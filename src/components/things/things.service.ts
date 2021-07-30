import { CRUD } from "../../common/interfaces/crud";
import { getManager } from "typeorm";
import { CommonServicesConfig } from "../../common/common.services.config";
import debug from "debug";
import { Thing } from "./things.entity";
import { ThingDto } from "./things.dto";
import { User } from "../users/users.entity";
import { ThingListParamsInterface } from "../../common/interfaces/list-params";
import ListQueryBuilder from "../../common/list-query-builder";

const debugInstance: debug.IDebugger = debug("app:thing-service");

class ThingService extends CommonServicesConfig implements CRUD {
  private static instance: ThingService;

  static getInstance(): ThingService {
    if (!ThingService.instance) {
      ThingService.instance = new ThingService();
    }
    return ThingService.instance;
  }

  create(resource: ThingDto, user: User) {
    const thingRepository = getManager().getRepository(Thing);

    const thing = new Thing();
    Object.assign(thing, resource);
    thing.user = user;
    return thingRepository.save(thing);
  }

  async deleteById(resourceId: string, user: User) {
    const thingRepository = getManager().getRepository(Thing);
    return thingRepository.delete({
      id: resourceId,
      user,
    });
  }

  async updateById(resourceId: string, dataToUpdate: ThingDto, user: User) {
    const thingRepository = getManager().getRepository(Thing);

    return thingRepository.update(
      {
        id: resourceId,
        user,
      },
      {
        name: dataToUpdate.name,
        description: dataToUpdate.description,
        updatedAt: new Date(),
      }
    );
  }

  async findById(thingId: string, user: User) {
    const thingRepository = getManager().getRepository(Thing);
    return thingRepository.findOne({
      where: {
        id: thingId,
        user,
      },
    });
  }

  async list(queryParams: ThingListParamsInterface, user: User) {
    const thingRepository = getManager().getRepository(Thing);
    const query = ListQueryBuilder.buildQuery(queryParams);
    query.where["userId"] = user.id;

    const [things, total] = await Promise.all([
      thingRepository.find(query),
      thingRepository.count({
        where: query.where,
      }),
    ]);

    return {
      things,
      total,
      limit: query.take,
      offset: query.skip,
    };
  }
  patchById?: ((resourceId: any) => Promise<any>) | undefined;
}

export default ThingService.getInstance();
