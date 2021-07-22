import { CommonRoutesConfig } from "../../common/common.routes.config";
import * as express from "express";
import authMiddleware from "../../common/middlewares/authorization";
import validateMiddleware from "../../common/middlewares/validation";
import asyncWrapper from "../../common/async-wrapper";
import { UserType } from "../../common/enums/UserType";
import thingController from "./things.controller";

export class ThingRoutes extends CommonRoutesConfig {
  constructor() {
    super(express.Router(), "things");
  }

  initializeRoutes(): express.Router {
    this.router
      .all(
        "",
        asyncWrapper(authMiddleware.validateToken()),
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.user]))
      )
      .post(
        "",
        asyncWrapper(validateMiddleware.validateData("thingSchema", "body")),
        asyncWrapper(thingController.create)
      )
      .get(
        "",
        asyncWrapper(validateMiddleware.validateData("thingListSchema", "query")),
        asyncWrapper(thingController.list)
      );

    this.router
      .all(
        `/:thingId`,
        asyncWrapper(authMiddleware.validateToken()),
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.user])),
        asyncWrapper(validateMiddleware.validateUuidInPath("thingId"))
      )
      .get(`/:thingId`, asyncWrapper(thingController.getById))
      .put(
        `/:thingId`,
        asyncWrapper(validateMiddleware.validateData("thingSchema", "body")),
        asyncWrapper(thingController.update)
      )
      .delete(`/:thingId`, asyncWrapper(thingController.delete));

    return this.router;
  }
}
