import * as express from "express";
import userService from "./users.service";
import ValidationError from "../../common/errors/validation-error";
import Validate from "../../common/validations/validate";
import commonValidators from "../../common/validations/common-validators";

class UsersMiddleware {
  private static instance: UsersMiddleware;

  static getInstance() {
    if (!UsersMiddleware.instance) {
      UsersMiddleware.instance = new UsersMiddleware();
    }
    return UsersMiddleware.instance;
  }

  validateUserData(schemaType: string, pieceToValidate: string) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      Validate.schema(schemaType, req[pieceToValidate]);
      next();
    };
  }

  async validateUuidInPath(req: express.Request, res: express.Response, next: express.NextFunction) {
    const isValid = commonValidators.isUUID(req.params.userId);
    if (!isValid) {
      throw new ValidationError("The user identifier should be an UUID");
    }
    next();
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
}

export default UsersMiddleware.getInstance();
