import * as express from "express";
import debug from "debug";
import loginService from "./login.service";
import { LoginDto } from "./login.dto";
import configs from "../../configs";

const log: debug.IDebugger = debug("app:login-controller");

export class LoginController {
  private static instance: LoginController;

  static getInstance(): LoginController {
    if (!LoginController.instance) {
      LoginController.instance = new LoginController();
    }
    return LoginController.instance;
  }

  async login(req: express.Request, res: express.Response) {
    const { token, refreshToken } = await loginService.generateToken(req.user);

    const response: LoginDto = {
      token,
      refreshToken,
      user: req.user.basicData(),
    };

    res
      .cookie("token", refreshToken, {
        expires: new Date(Date.now() + configs.jwt.refreshToken.expirationInMillis),
        secure: true,
        httpOnly: true,
      })
      .status(200)
      .json(response);
  }

  async refresh(req: express.Request, res: express.Response) {
    const { token, refreshToken } = await loginService.generateToken(req.user);

    const response: LoginDto = {
      token,
      refreshToken,
      user: req.user.basicData(),
    };

    res
      .cookie("token", refreshToken, {
        expires: new Date(Date.now() + configs.jwt.refreshToken.expirationInMillis),
        secure: true,
        httpOnly: true,
      })
      .status(200)
      .json(response);
  }
}

export default LoginController.getInstance();
