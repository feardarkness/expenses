import { CRUD } from "../../common/interfaces/crud";
import { getManager } from "typeorm";
import { CommonServicesConfig } from "../../common/common.services.config";
import debug from "debug";
import { Thing } from "./things.entity";
import { ThingDto } from "./things.dto";

const debugInstance: debug.IDebugger = debug("app:thing-service");

class ThingService extends CommonServicesConfig implements CRUD {
  private static instance: ThingService;

  static getInstance(): ThingService {
    if (!ThingService.instance) {
      ThingService.instance = new ThingService();
    }
    return ThingService.instance;
  }

  create(resource: ThingDto) {
    const thingRepository = getManager().getRepository(Thing);

    const thing = new Thing();
    Object.assign(thing, resource);

    return thingRepository.save(thing);
  }

  async deleteById(resourceId: string) {
    const thingRepository = getManager().getRepository(Thing);
    return thingRepository.delete(resourceId);
  }

  async updateById(resourceId: string, dataToUpdate: ThingDto) {
    const thingRepository = getManager().getRepository(Thing);

    return thingRepository.update(resourceId, {
      ...dataToUpdate,
      updatedAt: new Date(),
    });
  }

  async findById(thingId: string) {
    const thingRepository = getManager().getRepository(Thing);
    return thingRepository.findOne(thingId);
  }

  list: (limit: number, page: number) => Promise<any>;
  patchById?: ((resourceId: any) => Promise<any>) | undefined;
}

export default ThingService.getInstance();
