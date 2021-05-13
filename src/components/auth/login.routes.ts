import { CommonRoutesConfig } from "../../common/common.routes.config";
import * as express from "express";
import loginController from "./login.controller";
import loginMiddleware from "./login.middleware";
import validateMiddleware from "../../common/middlewares/validation";
import AsyncWrapper from "../../common/async-wrapper";

export class LoginRoutes extends CommonRoutesConfig {
  constructor() {
    super(express.Router(), "login");
  }

  initializeRoutes(): express.Router {
    this.router.post(
      "",
      AsyncWrapper(validateMiddleware.validateData("loginSchema", "body")),
      AsyncWrapper(loginMiddleware.credentialsAreValid),
      AsyncWrapper(loginController.login)
    );

    return this.router;
  }
}
