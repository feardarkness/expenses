import * as express from "express";
import loginService from "./login.service";
import Bcrypt from "../../common/bcrypt";
import UnauthorizedError from "../../common/errors/unauthorized-error";

export class LoginMiddleware {
  private static instance: LoginMiddleware;

  static getInstance() {
    if (!LoginMiddleware.instance) {
      LoginMiddleware.instance = new LoginMiddleware();
    }
    return LoginMiddleware.instance;
  }

  /**
   * Check if the credentials provided are valid
   * @param req Express request
   * @param res Express response
   * @param next Function to call the next middleware
   */
  async credentialsAreValid(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = await loginService.searchActiveByEmail(req.body.email);

    if (user === undefined) {
      throw new UnauthorizedError("Unauthorized");
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
