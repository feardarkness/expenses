import { CommonRoutesConfig } from "../../common/common.routes.config";
import * as express from "express";
import userController from "./users.controller";
import userMiddleware from "./users.middleware";
import authMiddleware from "../../common/middlewares/authorization";
import validateMiddleware from "../../common/middlewares/validation";
import asyncWrapper from "../../common/async-wrapper";
import { UserType } from "../../common/enums/UserType";

export class UserRoutes extends CommonRoutesConfig {
  constructor() {
    super(express.Router(), "users");
  }

  initializeRoutes(): express.Router {
    this.router.post(
      "",
      asyncWrapper(validateMiddleware.validateData("createUserSchema", "body")),
      asyncWrapper(userMiddleware.validateEmailAlreadyExists),
      asyncWrapper(userMiddleware.validatePasswordComplexity),
      asyncWrapper(userController.createUser)
    );

    this.router.put(
      "/status",
      asyncWrapper(validateMiddleware.validateData("activateUserSchema", "query")),
      asyncWrapper(userController.updateStatus)
    );

    this.router
      .all(
        `/:userId`,
        asyncWrapper(authMiddleware.tokenIsValid),
        asyncWrapper(validateMiddleware.validateUuidInPath)
        // (req: express.Request, res: express.Response, next: express.NextFunction) => {
        //   // this middleware function runs before any request to /users/:userId
        //   next();
        // }
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
        asyncWrapper(validateMiddleware.validateUuidInPath),
        asyncWrapper(userController.updateUser)
      )
      .delete(
        `/:userId`,
        asyncWrapper(authMiddleware.userTypeAllowed([UserType.user])),
        asyncWrapper(validateMiddleware.validateUuidInPath),
        asyncWrapper(userController.deleteById)
      );

    return this.router;
  }
}
