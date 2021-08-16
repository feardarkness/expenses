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
    const interval = query.interval || LedgerQueryInterval.monthly;
    const groupBy = query.groupBy || [LedgerQueryGroupBy.entryType];

    const additionalGroupByFields: string[] = [];
    const additionalSelectFields: string[] = [];

    if (groupBy.includes(LedgerQueryGroupBy.entryType)) {
      additionalSelectFields.push(`type`);
      additionalGroupByFields.push(`type`);
    }
    if (groupBy.includes(LedgerQueryGroupBy.thing)) {
      additionalSelectFields.push(`thing_id as "thingId"`);
      additionalGroupByFields.push(`"thingId"`);
    }

    const queryBuilder = getManager().getRepository(Ledger).createQueryBuilder("ledger");
    if (interval === LedgerQueryInterval.daily) {
      queryBuilder.select(['date as "groupedDate"', "sum(amount) as total"]);
    } else {
      let trunc = "week";
      if (interval === LedgerQueryInterval.monthly) {
        trunc = "month";
      } else if (interval === LedgerQueryInterval.yearly) {
        trunc = "year";
      }
      queryBuilder.select([`date_trunc('${trunc}', date) as "groupedDate"`, `sum(amount) as total`]);
    }

    if (additionalSelectFields.length > 0) {
      queryBuilder.addSelect(additionalSelectFields);
    }

    queryBuilder.where(`ledger.userId = :userId and ledger.date <= :maxDate and ledger.date >= :minDate`, {
      userId: user.id,
      minDate: query.minDate,
      maxDate: query.maxDate,
    });

    queryBuilder.groupBy('"groupedDate"');
    if (additionalGroupByFields.length > 0) {
      additionalGroupByFields.forEach((field) => {
        queryBuilder.addGroupBy(field);
      });
    }

    queryBuilder.orderBy('"groupedDate"', "DESC");
    if (additionalGroupByFields.length > 0) {
      additionalGroupByFields.forEach((field) => queryBuilder.addOrderBy(field, "DESC"));
    }

    return queryBuilder.getRawMany();
  }
}

export default UserService.getInstance();
