import { CommonRoutesConfig } from "../../common/common.routes.config";
import * as express from "express";
import authMiddleware from "../../common/middlewares/authorization";
import validateMiddleware from "../../common/middlewares/validation";
import asyncWrapper from "../../common/async-wrapper";
import { UserType } from "../../common/enums/UserType";
import expensesController from "./expenses.controller";

export class ExpenseRoutes extends CommonRoutesConfig {
  constructor() {
    super(express.Router(), "expenses");
  }

  initializeRoutes(): express.Router {
    this.router.post(
      "",
      asyncWrapper(authMiddleware.tokenIsValid),
      asyncWrapper(authMiddleware.userTypeAllowed([UserType.user])),
      asyncWrapper(validateMiddleware.validateData("expenseSchema", "body")),
      asyncWrapper(expensesController.create)
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