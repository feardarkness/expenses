import * as express from "express";
import debug from "debug";
import userService from "./users.service";
import mailService from "../mails/mails.service";
import NotFoundError from "../../common/errors/not-found-error";
import log from "../../common/logger";
import configs from "../../configs";
import tokensService from "../tokens/tokens.service";
import RandomString from "../../common/random-string";
import { TokenDto } from "../tokens/tokens.dto";
import { getManager } from "typeorm";
import { TokenType } from "../../common/enums/TokenType";
import { config } from "process";

const debugInstance: debug.IDebugger = debug("app:user-controller");

export class UserController {
  private static instance: UserController;

  static getInstance(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController();
    }
    return UserController.instance;
  }

  async createUser(req: express.Request, res: express.Response) {
    log.trace(`[createUser]`, { body: req.body });
    let userCreated;
    let userActivateToken;

    await getManager().transaction(async (transactionalEntityManager) => {
      userCreated = await userService.create(req.body, transactionalEntityManager);

      userActivateToken = RandomString.generateRandomString(configs.activationToken.length);
      const userData = {
        token: userActivateToken,
        user: userCreated,
        type: TokenType.userActivation,
      } as TokenDto;
      await tokensService.create(userData, transactionalEntityManager);
    });

    await mailService.sendActivationEmail(userActivateToken, userCreated.email);

    res.status(201).json({
      message: "An email was sent with a link to activate your user. The link is valid for six hours",
    });
  }

  async getUserById(req: express.Request, res: express.Response) {
    log.trace(`[getUserById]`, { userId: req.params.userId });
    const user = await userService.findById(req.params.userId);
    if (user === undefined) {
      throw new NotFoundError("User not found");
    }
    res.status(200).json(user.basicData());
  }

  async updateUser(req: express.Request, res: express.Response) {
    log.trace(`[updateUser]`, { userId: req.params.userId });
    await userService.updateById(req.params.userId, req.body);
    res.status(200).json({
      message: "User updated successfully",
    });
  }

  async updateStatus(req: express.Request, res: express.Response) {
    log.trace(`[updateStatus]`, { userId: req.params.userId });
    await userService.activateUser(req.query.token as string);
    res.status(200).json({
      message: "User activated successfully",
    });
  }

  async deleteById(req: express.Request, res: express.Response) {
    log.trace(`[deleteById]`, { userId: req.params.userId });

    await userService.deleteById(req.params.userId);

    res.status(204).json({
      message: "User deleted successfully",
    });
  }

  async sendActivationEmail(req: express.Request, res: express.Response) {
    log.trace(`[sendActivationEmail]`, { email: req.query.email });

    if (typeof req.query.email === "string") {
      const user = await userService.searchByEmail(req.query.email);
      if (user !== undefined) {
        let userActivateToken;
        await getManager().transaction(async (transactionalEntityManager) => {
          await tokensService.deleteActivationTokensOfUser(user, transactionalEntityManager);
          userActivateToken = RandomString.generateRandomString(configs.activationToken.length);
          const userData = {
            token: userActivateToken,
            user,
            type: TokenType.userActivation,
          } as TokenDto;
          await tokensService.create(userData, transactionalEntityManager);
        });

        await mailService.sendActivationEmail(userActivateToken, user.email);
      }
    }

    res.status(200).json({
      message: `An email to activate your account will be sent shortly if your email account is registered.`,
    });
  }
}

export default UserController.getInstance();
