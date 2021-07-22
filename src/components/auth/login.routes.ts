import { CommonRoutesConfig } from "../../common/common.routes.config";
import * as express from "express";
import loginController from "./login.controller";
import loginMiddleware from "./login.middleware";
import authMiddleware from "../../common/middlewares/authorization";
import validateMiddleware from "../../common/middlewares/validation";
import asyncWrapper from "../../common/async-wrapper";

export class LoginRoutes extends CommonRoutesConfig {
  constructor() {
    super(express.Router(), "login");
  }

  initializeRoutes(): express.Router {
    this.router.post(
      "",
      asyncWrapper(validateMiddleware.validateData("loginSchema", "body")),
      asyncWrapper(loginMiddleware.credentialsAreValid),
      asyncWrapper(loginController.login)
    );

    this.router.post(
      "/refresh",
      asyncWrapper(validateMiddleware.validateData("refreshSchema", "body")),
      asyncWrapper(authMiddleware.validateToken(true)),
      asyncWrapper(loginController.refresh)
    );

    return this.router;
  }
}
