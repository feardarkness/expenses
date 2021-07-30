import * as express from "express";
import debug from "debug";
import loginService from "./login.service";
import { LoginDto } from "./login.dto";
import configs from "../../configs";
import tokensRefreshService from "../tokens/tokens-refresh.service";
import { getManager } from "typeorm";

const log: debug.IDebugger = debug("app:login-controller");

export class LoginController {
  private static instance: LoginController;

  static getInstance(): LoginController {
    if (!LoginController.instance) {
      LoginController.instance = new LoginController();
    }
    return LoginController.instance;
  }

  async generateTokens(req: express.Request, res: express.Response) {
    const { token, refreshToken } = await loginService.generateToken(req.user);
    const refreshTokenExpirationDate = new Date(Date.now() + configs.jwt.refreshToken.expirationInMillis);

    await getManager().transaction(async (transactionalEntityManager) => {
      await tokensRefreshService.removeAllOfUser(req.user, transactionalEntityManager);
      await tokensRefreshService.create(
        {
          user: req.user,
          refreshToken: refreshToken,
          expirationDate: refreshTokenExpirationDate,
        },
        transactionalEntityManager
      );
    });

    const response: LoginDto = {
      token,
      refreshToken,
      user: req.user.basicData(),
    };

    res
      .cookie("token", refreshToken, {
        expires: refreshTokenExpirationDate,
        secure: true,
        httpOnly: true,
      })
      .status(200)
      .json(response);
  }
}

export default LoginController.getInstance();
