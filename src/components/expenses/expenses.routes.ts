import { CommonRoutesConfig } from "../../common/common.routes.config";
import * as express from "express";
import authMiddleware from "../../common/middlewares/authorization";
import validateMiddleware from "../../common/middlewares/validation";
import asyncWrapper from "../../common/async-wrapper";
import { UserType } from "../../common/enums/UserType";
import expensesController from "./expenses.controller";
import expensesMiddleware from "./expenses.middleware";

export class ExpenseRoutes extends CommonRoutesConfig {
  constructor() {
    super(express.Router(), "expenses");
  }

  initializeRoutes(): express.Router {
    this.router
      .all(``, asyncWrapper(authMiddleware.tokenIsValid), asyncWrapper(authMiddleware.userTypeAllowed([UserType.user])))
      .post(
        "",
        asyncWrapper(validateMiddleware.validateData("expenseSchema", "body")),
        asyncWrapper(expensesMiddleware.thingBelongsToUser),
        asyncWrapper(expensesController.create)
      )
      .get(
        "",
        asyncWrapper(validateMiddleware.validateData("expenseListSchema", "query")),
        asyncWrapper(expensesController.list)
      );

    this.router
      .all(
        `/:expenseId`,
        asyncWrapper(authMiddleware.tokenIsValid),
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.user])),
        asyncWrapper(validateMiddleware.validateUuidInPath("expenseId"))
      )
      .get(`/:expenseId`, asyncWrapper(expensesController.getById))
      .put(
        `/:expenseId`,
        asyncWrapper(validateMiddleware.validateData("expenseUpdateSchema", "body")),
        asyncWrapper(expensesController.update)
      )
      .delete(`/:expenseId`, asyncWrapper(expensesController.delete));

    return this.router;
  }
}
