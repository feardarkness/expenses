import * as express from "express";
import userService from "./users.service";
import ValidationError from "../../common/errors/validation-error";
import ForbiddenError from "../../common/errors/forbidden-error";
import { UserStatus } from "../../common/enums/UserStatus";
import usersService from "./users.service";

class UserMiddleware {
  private static instance: UserMiddleware;

  /* istanbul ignore next */
  static getInstance() {
    if (!UserMiddleware.instance) {
      UserMiddleware.instance = new UserMiddleware();
    }
    return UserMiddleware.instance;
  }

  /**
   * Checks if the email is already registered. If the email is registered but the user is not activated yet, send an email to his/her account
   * @param req
   * @param res
   * @param next
   */
  async validateEmailAlreadyExistsOrNotYetActivated(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await userService.searchByEmail(req.body.email);

    if (user !== undefined) {
      if (user?.status === UserStatus.new) {
        await usersService.sendActivationEmail(user);
        throw new ValidationError("Looks like your account is not yet verified. Please check your email.");
      }
      throw new ValidationError(`User with email ${req.body.email} already registered`);
    }
    next();
  }

  async validatePasswordComplexity(req: express.Request, res: express.Response, next: express.NextFunction) {
    // TODO add a password validator, length, number of chars, etc
    next();
  }

  /**
   * Validates that the userId in the token os the same as the userId in the url
   * @param req
   * @param res
   * @param next
   */
  async validateUserAllowedByToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.params.userId !== req.user.id) {
      throw new ForbiddenError("Forbidden");
    }
    next();
  }
}

export default UserMiddleware.getInstance();
