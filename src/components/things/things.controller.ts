import * as express from "express";
import debug from "debug";
import thingService from "./things.service";
import log from "../../common/logger";
import NotFoundError from "../../common/errors/not-found-error";

const debugInstance: debug.IDebugger = debug("app:thing-controller");

export class ThingController {
  private static instance: ThingController;

  /* istanbul ignore next */
  static getInstance(): ThingController {
    if (!ThingController.instance) {
      ThingController.instance = new ThingController();
    }
    return ThingController.instance;
  }

  async create(req: express.Request, res: express.Response) {
    log.trace(`[create]`, { body: req.body });

    const thing = await thingService.create(req.body, req.user);

    res.status(201).json(thing.basicData());
  }

  async getById(req: express.Request, res: express.Response) {
    log.trace(`[getById]`, { id: req.params.thingId });

    const thing = await thingService.findById(req.params.thingId, req.user);

    if (thing === undefined) {
      throw new NotFoundError("Thing not found");
    }

    res.status(200).json(thing.basicData());
  }

  async update(req: express.Request, res: express.Response) {
    log.trace(`[update]`, { id: req.params.thingId, body: req.body });

    await thingService.updateById(req.params.thingId, req.body, req.user);

    res.status(200).json({
      message: "Thing updated successfully",
    });
  }

  async delete(req: express.Request, res: express.Response) {
    log.trace(`[delete]`, { id: req.params.thingId });

    await thingService.deleteById(req.params.thingId, req.user);

    res.status(204).json({
      message: "Thing deleted successfully",
    });
  }

  async list(req: express.Request, res: express.Response) {
    log.trace(`[list]`, { query: req.query });

    const { things, total, limit, offset } = await thingService.list(req.query, req.user);

    res.status(200).json({
      records: things.map((thing) => thing.basicData()),
      total,
      limit,
      offset,
    });
  }
}

export default ThingController.getInstance();
