import { CommonRoutesConfig } from "../../common/common.routes.config";
import * as express from "express";
import logoutController from "./logout.controller";
import authMiddleware from "../../common/middlewares/authorization";
import asyncWrapper from "../../common/async-wrapper";
import { UserType } from "../../common/enums/UserType";

export class LogoutRoutes extends CommonRoutesConfig {
  constructor() {
    super(express.Router(), "logout");
  }

  initializeRoutes(): express.Router {
    this.router.post(
      "",
      asyncWrapper(authMiddleware.validateToken()),
      asyncWrapper(authMiddleware.userTypeAllowed([UserType.user])),
      asyncWrapper(logoutController.logout)
    );

    return this.router;
  }
}
