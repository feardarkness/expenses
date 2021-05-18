import { CommonRoutesConfig } from "../../common/common.routes.config";
import * as express from "express";
import authMiddleware from "../../common/middlewares/authorization";
import validateMiddleware from "../../common/middlewares/validation";
import asyncWrapper from "../../common/async-wrapper";
import { UserType } from "../../common/enums/UserType";
import thingController from "./thing.controller";

export class UserRoutes extends CommonRoutesConfig {
  constructor() {
    super(express.Router(), "things");
  }

  initializeRoutes(): express.Router {
    this.router.post(
      "",
      asyncWrapper(authMiddleware.tokenIsValid),
      asyncWrapper(authMiddleware.userTypeAllowed([UserType.admin])),
      asyncWrapper(validateMiddleware.validateData("thingSchema", "body")),
      asyncWrapper(thingController.create)
    );

    this.router
      .all(
        `/:thingId`,
        asyncWrapper(authMiddleware.tokenIsValid),
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.admin])),
        asyncWrapper(authMiddleware.tokenIsValid),
        asyncWrapper(validateMiddleware.validateUuidInPath)
      )
      .get(`/:thingId`, asyncWrapper(thingController.getById))
      .put(`/:thingId`, asyncWrapper(thingController.update))
      .delete(`/:thingId`, asyncWrapper(thingController.delete));

    return this.router;
  }
}
