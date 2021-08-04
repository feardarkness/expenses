import * as express from "express";
import loginService from "./login.service";
import Bcrypt from "../../common/bcrypt";
import UnauthorizedError from "../../common/errors/unauthorized-error";
import { UserStatus } from "../../common/enums/UserStatus";
import ValidationError from "../../common/errors/validation-error";
import usersService from "../users/users.service";

export class LoginMiddleware {
  private static instance: LoginMiddleware;

  static getInstance() {
    if (!LoginMiddleware.instance) {
      LoginMiddleware.instance = new LoginMiddleware();
    }
    return LoginMiddleware.instance;
  }

  /**
   * Check if the credentials provided are valid and if the user is active. If the user is new, send an activation email to his/her account
   * @param req Express request
   * @param res Express response
   * @param next Function to call the next middleware
   */
  async credentialsAreValidAndUserIsActive(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = await loginService.searchByEmail(req.body.email);

    if (user === undefined || user.status === UserStatus.inactive) {
      throw new UnauthorizedError("Unauthorized");
    }

    if (user.status === UserStatus.new) {
      await usersService.sendActivationEmail(user);
      throw new ValidationError("Looks like your account is not yet verified. Please check your email.");
    }

    const validCredentials = await Bcrypt.compare(req.body.password, user.password);
    if (!validCredentials) {
      throw new UnauthorizedError("Unauthorized");
    }

    req.user = user;
    next();
  }
}

export default LoginMiddleware.getInstance();
