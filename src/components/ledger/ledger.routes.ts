import { CommonRoutesConfig } from "../../common/common.routes.config";
import * as express from "express";
import authMiddleware from "../../common/middlewares/authorization";
import validateMiddleware from "../../common/middlewares/validation";
import asyncWrapper from "../../common/async-wrapper";
import { UserType } from "../../common/enums/UserType";
import ledgerController from "./ledger.controller";
import ledgerMiddleware from "./ledger.middleware";

export class LedgerRoutes extends CommonRoutesConfig {
  constructor() {
    super(express.Router(), "ledgers");
  }

  initializeRoutes(): express.Router {
    this.router
      .all(
        ``,
        asyncWrapper(authMiddleware.validateToken()),
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.user]))
      )
      .post(
        "",
        asyncWrapper(validateMiddleware.validateData("ledgerSchema", "body")),
        asyncWrapper(ledgerMiddleware.thingBelongsToUser),
        asyncWrapper(ledgerController.create)
      )
      .get(
        "",
        asyncWrapper(validateMiddleware.validateData("ledgerListSchema", "query")),
        asyncWrapper(ledgerController.list)
      );

    this.router
      .all(
        `/:entryId`,
        asyncWrapper(authMiddleware.validateToken()),
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.user])),
        asyncWrapper(validateMiddleware.validateUuidInPath("entryId"))
      )
      .get(`/:entryId`, asyncWrapper(ledgerController.getById))
      .put(
        `/:entryId`,
        asyncWrapper(validateMiddleware.validateData("ledgerUpdateSchema", "body")),
        asyncWrapper(ledgerMiddleware.thingBelongsToUser),
        asyncWrapper(ledgerController.update)
      )
      .delete(`/:entryId`, asyncWrapper(ledgerController.delete));

    return this.router;
  }
}
