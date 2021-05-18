import * as express from "express";
import debug from "debug";
import thingService from "./thing.service";
import log from "../../common/logger";
import NotFoundError from "../../common/errors/not-found-error";

const debugInstance: debug.IDebugger = debug("app:thing-controller");

export class ThingController {
  private static instance: ThingController;

  static getInstance(): ThingController {
    if (!ThingController.instance) {
      ThingController.instance = new ThingController();
    }
    return ThingController.instance;
  }

  async create(req: express.Request, res: express.Response) {
    log.trace(`[create]`, { body: req.body });

    const thing = await thingService.create(req.body);

    res.status(201).json(thing);
  }

  async getById(req: express.Request, res: express.Response) {
    log.trace(`[getById]`, { id: req.params.thingId });

    const thing = await thingService.findById(req.params.thingId);

    if (thing === undefined) {
      throw new NotFoundError("Thing not found");
    }

    res.status(200).json(thing);
  }

  async update(req: express.Request, res: express.Response) {
    log.trace(`[update]`, { id: req.params.thingId, body: req.body });

    const thing = await thingService.updateById(req.params.thingId, req.body);

    res.status(200).json(thing);
  }

  async delete(req: express.Request, res: express.Response) {
    log.trace(`[delete]`, { id: req.params.thingId });

    await thingService.deleteById(req.params.thingId);

    res.status(204).json({
      message: "Thing deleted successfully",
    });
  }
}

export default ThingController.getInstance();
