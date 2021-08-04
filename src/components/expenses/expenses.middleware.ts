import * as express from "express";
import Bcrypt from "../../common/bcrypt";
import ValidationError from "../../common/errors/validation-error";

import thingsService from "../things/things.service";

class ExpensesMiddleware {
  private static instance: ExpensesMiddleware;

  /* istanbul ignore next */
  static getInstance() {
    if (!ExpensesMiddleware.instance) {
      ExpensesMiddleware.instance = new ExpensesMiddleware();
    }
    return ExpensesMiddleware.instance;
  }

  async thingBelongsToUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    const thing = await thingsService.findById(req.body.thingId, req.user);
    if (thing === undefined) {
      throw new ValidationError("Thing not found");
    }

    next();
  }
}

export default ExpensesMiddleware.getInstance();
