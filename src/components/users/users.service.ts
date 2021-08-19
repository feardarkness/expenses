import { CRUD } from "../../common/interfaces/crud";
import { ReportQuery, UserDto } from "./users.dto";
import { User } from "./users.entity";
import { EntityManager, getManager } from "typeorm";
import { CommonServicesConfig } from "../../common/common.services.config";
import bcrypt from "../../common/bcrypt";
import configs from "../../configs";
import { UserType } from "../../common/enums/UserType";
import { UserStatus } from "../../common/enums/UserStatus";
import debug from "debug";
import tokensService from "../tokens/tokens.service";
import DateCommon from "../../common/date-common";
import ValidationError from "../../common/errors/validation-error";
import RandomString from "../../common/random-string";
import { TokenType } from "../../common/enums/TokenType";
import { TokenDto } from "../tokens/tokens.dto";
import mailsService from "../mails/mails.service";
import { LedgerQueryInterval } from "../../common/enums/LedgerQueryInterval";
import { LedgerEntryType } from "../../common/enums/LedgerEntryType";
import { Ledger } from "../ledger/ledger.entity";
import { LedgerQueryGroupBy } from "../../common/enums/LedgerQueryGroupBy";
import { crossOriginOpenerPolicy } from "helmet";
import ReportsHelper from "../../common/reports-helper";
import SanitizeSql from "../../common/sanitize-sql";

const debugInstance: debug.IDebugger = debug("app:user-service");

class UserService extends CommonServicesConfig implements CRUD {
  private static instance: UserService;

  /* istanbul ignore next */
  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  list: (params: object, association?: any) => Promise<any>;

  /**
   * Creates a user
   * @param resource User data
   */
  async create(resource: UserDto, manager?: EntityManager) {
    const userRepository = manager ? manager.getRepository(User) : getManager().getRepository(User);

    const user = new User();
    Object.assign(user, resource);
    user.email = resource.email.toLowerCase();
    user.type = UserType.user;
    user.status = UserStatus.new;
    user.password = await bcrypt.hash(resource.password, configs.jwt.saltRounds);

    const createdUser = await userRepository.save(user);
    return createdUser;
  }

  async findById(userId: string) {
    const userRepository = getManager().getRepository(User);

    return userRepository.findOne({
      id: userId,
    });
  }

  /* istanbul ignore next */
  async updateUser(user: User, dataToUpdate: UserDto) {
    const userRepository = getManager().getRepository(User);
    Object.assign(user, dataToUpdate);
    user.updatedAt = new Date();

    return userRepository.save(user);
  }

  async updateById(resourceId: string, dataToUpdate: UserDto) {
    const userRepository = getManager().getRepository(User);

    return userRepository.update(resourceId, {
      ...dataToUpdate,
      updatedAt: new Date(),
    });
  }

  async deleteById(resourceId: string) {
    const userRepository = getManager().getRepository(User);
    return userRepository.delete(resourceId);
  }

  async activateUser(activationToken: string) {
    const token = await tokensService.findActivationToken(activationToken);

    if (token === undefined) {
      throw new ValidationError("Token not found or expired");
    }

    return await getManager().transaction(async (transactionalEntityManager) => {
      const userRepository = transactionalEntityManager.getRepository(User);
      await userRepository.update(token.userId, {
        status: UserStatus.active,
        updatedAt: DateCommon.getCurrentDate(),
      });

      const user = new User();
      user.id = token.userId;
      await tokensService.deleteActivationTokensOfUser(user, transactionalEntityManager);
    });
  }

  async sendActivationEmail(user: User) {
    let userActivateToken;
    await getManager().transaction(async (transactionalEntityManager) => {
      await tokensService.deleteActivationTokensOfUser(user, transactionalEntityManager);
      userActivateToken = RandomString.generateRandomString(configs.activationToken.length);
      const userData = {
        token: userActivateToken,
        user,
        type: TokenType.userActivation,
      } as TokenDto;
      await tokensService.create(userData, transactionalEntityManager);
    });

    await mailsService.sendActivationEmail(userActivateToken, user.email);
  }

  async generateReport(query: ReportQuery, user: User) {
    const interval = (query.interval || LedgerQueryInterval.monthly) as LedgerQueryInterval;
    const groupBy = (query.groupBy || [LedgerQueryGroupBy.entryType]) as LedgerQueryGroupBy[];

    let subQueryAdditionalSelect = "";
    let subQueryAdditionalJoin = "";
    let querySelect = "";
    let mainQuerySelect = "";
    let queryGroupBy = "";
    let queryOrderBy = "";
    if (groupBy.includes(LedgerQueryGroupBy.entryType)) {
      subQueryAdditionalSelect += `, "type"`;
      querySelect += `,"type"::text`;
      mainQuerySelect += `,"type"::text`;
      subQueryAdditionalJoin += `, (VALUES ('Income'), ('Expense')) as x("type")`;
      queryGroupBy += `,"type"`;
      queryOrderBy += `,"type" DESC`;
    }
    if (groupBy.includes(LedgerQueryGroupBy.thing)) {
      subQueryAdditionalSelect += `, id as thing_id`;
      subQueryAdditionalJoin += `, (SELECT id FROM public.thing where user_id=$1) thing_id`;
      querySelect += `,thing_id`;
      mainQuerySelect += `,thing_id as "thingId"`;
      queryGroupBy += `,thing_id`;
      queryOrderBy += `,thing_id DESC`;
    }

    const queryInterval = ReportsHelper.correctReportIntervalName(interval);

    const allDatesSubQuery = `
      SELECT truncatedDate::date${subQueryAdditionalSelect}
      FROM generate_series(date_trunc('${queryInterval}', ${SanitizeSql.escapeLiteralString(
      query.minDate + "T00:00:00"
    )}::date)::timestamp,
                           date_trunc('${queryInterval}', ${SanitizeSql.escapeLiteralString(
      query.maxDate + "T00:00:00"
    )}::date)::timestamp,
                           interval  '1 ${queryInterval}') truncatedDate${subQueryAdditionalJoin}
    `;

    const fullQuery = `
      SELECT truncatedDate as "groupedDate", coalesce(total, 0) as total${mainQuerySelect}
      FROM (${allDatesSubQuery}) e
      LEFT JOIN(
          SELECT ${
            interval === LedgerQueryInterval.daily ? "date" : `date_trunc('${queryInterval}', date)`
          } as truncatedDate, sum(amount) as total${querySelect}
          FROM public.ledger as ledger
          WHERE user_id = $1
              AND date >= $2
              AND date <= $3
          GROUP BY truncatedDate${queryGroupBy}
      ) t USING(truncatedDate${queryGroupBy})
      ORDER BY truncatedDate DESC${queryOrderBy}
    `;

    return getManager().query(fullQuery, [
      user.id,
      SanitizeSql.escapeLiteralString(query.minDate),
      SanitizeSql.escapeLiteralString(query.maxDate),
    ]);
  }
}

export default UserService.getInstance();
