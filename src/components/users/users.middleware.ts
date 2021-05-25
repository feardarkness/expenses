import * as express from "express";
import userService from "./users.service";
import ValidationError from "../../common/errors/validation-error";
import UnauthorizedError from "../../common/errors/unauthorized-error";
import ForbiddenError from "../../common/errors/forbidden-error";

class UsersMiddleware {
  private static instance: UsersMiddleware;

  static getInstance() {
    if (!UsersMiddleware.instance) {
      UsersMiddleware.instance = new UsersMiddleware();
    }
    return UsersMiddleware.instance;
  }

  async validateEmailAlreadyExists(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = await userService.searchByEmail(req.body.email);

    if (user !== undefined) {
      throw new ValidationError(`User with email ${req.body.email} already registered`);
    }
    next();
  }

  async validatePasswordComplexity(req: express.Request, res: express.Response, next: express.NextFunction) {
    // TODO add a password validator, length, number of chars, etc
    next();
  }

  async validateUserAllowedByToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.params.userId !== req.user.id) {
      throw new ForbiddenError("Forbidden");
    }
    next();
  }
}

export default UsersMiddleware.getInstance();
