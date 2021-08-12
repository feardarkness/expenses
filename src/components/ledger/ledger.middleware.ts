import * as express from "express";
import ValidationError from "../../common/errors/validation-error";

import thingsService from "../things/things.service";

class LedgerMiddleware {
  private static instance: LedgerMiddleware;

  /* istanbul ignore next */
  static getInstance() {
    if (!LedgerMiddleware.instance) {
      LedgerMiddleware.instance = new LedgerMiddleware();
    }
    return LedgerMiddleware.instance;
  }

  async thingBelongsToUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    const thing = await thingsService.findById(req.body.thingId, req.user);
    if (thing === undefined) {
      throw new ValidationError("Thing not found or doesn't belong to the user");
    }

    next();
  }
}

export default LedgerMiddleware.getInstance();
