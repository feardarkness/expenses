import { CRUD } from "../../common/interfaces/crud";
import { Between, getManager, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { CommonServicesConfig } from "../../common/common.services.config";
import debug from "debug";
import { Ledger } from "./ledger.entity";
import { LedgerDto, LedgerUpdateDto } from "./ledger.dto";
import { Thing } from "../things/things.entity";
import { User } from "../users/users.entity";
import DateCommon from "../../common/date-common";
import { LedgerListParamsInterface } from "../../common/interfaces/list-params";
import ListQueryBuilder from "../../common/list-query-builder";

const debugInstance: debug.IDebugger = debug("app:ledger-service");

class LedgerService extends CommonServicesConfig implements CRUD {
  private static instance: LedgerService;

  /* istanbul ignore next */
  static getInstance(): LedgerService {
    if (!LedgerService.instance) {
      LedgerService.instance = new LedgerService();
    }
    return LedgerService.instance;
  }

  create(resource: LedgerDto, user: User) {
    const ledgerRepository = getManager().getRepository(Ledger);

    const ledger = new Ledger();
    ledger.amount = resource.amount;

    const thing = new Thing();
    thing.id = resource.thingId;
    ledger.thing = thing;

    ledger.user = user;
    ledger.type = resource.type;
    ledger.date = (DateCommon.parseDateFromString(resource.date) as unknown) as string;

    return ledgerRepository.save(ledger);
  }

  async deleteById(resourceId: string, user: User) {
    const ledgerRepository = getManager().getRepository(Ledger);

    return ledgerRepository.delete({
      id: resourceId,
      user,
    });
  }

  async updateById(resourceId: string, dataToUpdate: LedgerUpdateDto, user: User) {
    const ledgerRepository = getManager().getRepository(Ledger);

    return ledgerRepository.update(
      {
        id: resourceId,
        userId: user.id,
      },
      {
        amount: dataToUpdate.amount,
        date: (DateCommon.parseDateFromString(dataToUpdate.date) as unknown) as string,
        updatedAt: new Date(),
      }
    );
  }

  async findById(entryId: string, user: User) {
    const ledgerRepository = getManager().getRepository(Ledger);
    return ledgerRepository.findOne({
      where: {
        id: entryId,
        user: user,
      },
    });
  }

  async list(queryParams: LedgerListParamsInterface, user: User) {
    const ledgerRepository = getManager().getRepository(Ledger);

    const query = ListQueryBuilder.buildQuery(queryParams);
    query.where["userId"] = user.id;

    if ("minDate" in query.where && "maxDate" in query.where) {
      const minDate = query.where.minDate;
      delete query.where.minDate;
      const maxDate = query.where.maxDate;
      delete query.where.maxDate;
      query.where.date = Between(minDate, maxDate);
    } else {
      if ("minDate" in query.where) {
        const minDate = query.where.minDate;
        delete query.where.minDate;
        query.where.date = MoreThanOrEqual(minDate);
      }
      if ("maxDate" in query.where) {
        const maxDate = query.where.maxDate;
        delete query.where.maxDate;
        query.where.date = LessThanOrEqual(maxDate);
      }
    }

    const [entries, total] = await Promise.all([
      ledgerRepository.find(query),
      ledgerRepository.count({
        where: query.where,
      }),
    ]);

    return {
      entries,
      total,
      limit: query.take,
      offset: query.skip,
    };
  }

  patchById?: ((resourceId: any) => Promise<any>) | undefined;
}

export default LedgerService.getInstance();
