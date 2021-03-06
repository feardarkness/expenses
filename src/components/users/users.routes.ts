import { CommonRoutesConfig } from "../../common/common.routes.config";
import * as express from "express";
import userController from "./users.controller";
import userMiddleware from "./users.middleware";
import authMiddleware from "../../common/middlewares/authorization";
import validateMiddleware from "../../common/middlewares/validation";
import asyncWrapper from "../../common/async-wrapper";
import { UserType } from "../../common/enums/UserType";
import usersReportsMiddleware from "./users-reports.middleware";

export class UserRoutes extends CommonRoutesConfig {
  constructor() {
    super(express.Router(), "users");
  }

  initializeRoutes(): express.Router {
    this.router.post(
      "",
      asyncWrapper(validateMiddleware.validateData("createUserSchema", "body")),
      asyncWrapper(userMiddleware.validateEmailAlreadyExistsOrNotYetActivated),
      asyncWrapper(userMiddleware.validatePasswordComplexity),
      asyncWrapper(userController.createUser)
    );

    // get so every user can access this route from the browser
    this.router.get(
      "/status",
      asyncWrapper(validateMiddleware.validateData("activateUserSchema", "query")),
      asyncWrapper(userController.updateStatus)
    );

    this.router.post(
      "/activation",
      asyncWrapper(validateMiddleware.validateData("activationTokenForUserSchema", "body")),
      asyncWrapper(userController.sendActivationEmail)
    );

    this.router
      .all(
        `/:userId/reports`,
        asyncWrapper(authMiddleware.validateToken()),
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.user])),
        asyncWrapper(validateMiddleware.validateUuidInPath("userId")),
        asyncWrapper(userMiddleware.validateUserAllowedByToken),
        asyncWrapper(validateMiddleware.validateData("reportQuerySchema", "query")),
        asyncWrapper(usersReportsMiddleware.validateDateRangeForReportInterval)
      )
      .get(`/:userId/reports`, asyncWrapper(userController.generateReport));

    this.router
      .all(
        `/:userId`,
        asyncWrapper(authMiddleware.validateToken()),
        asyncWrapper(validateMiddleware.validateUuidInPath("userId")),
        asyncWrapper(userMiddleware.validateUserAllowedByToken)
      )
      .get(
        `/:userId`,
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.admin, UserType.user])),
        asyncWrapper(userController.getUserById)
      )
      .put(
        `/:userId`,
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.user])),
        asyncWrapper(validateMiddleware.validateData("updateUserSchema", "body")),
        asyncWrapper(userController.updateUser)
      )
      .delete(
        `/:userId`,
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.user])),
        asyncWrapper(userController.deleteById)
      );

    return this.router;
  }
}
