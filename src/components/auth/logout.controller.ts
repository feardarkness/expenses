import * as express from "express";
import debug from "debug";
import configs from "../../configs";
import logoutService from "./logout.service";
import log from "../../common/logger";

const debugInstance: debug.IDebugger = debug("app:logout-controller");

export class LogoutController {
  private static instance: LogoutController;

  static getInstance(): LogoutController {
    if (!LogoutController.instance) {
      LogoutController.instance = new LogoutController();
    }
    return LogoutController.instance;
  }

  async logout(req: express.Request, res: express.Response) {
    log.trace(`[logout]`);

    await logoutService.addTokenToBlacklist(req.token, req.decodedToken.exp);

    res
      .cookie("token", "cleared-token", {
        expires: new Date(Date.now() + configs.jwt.refreshToken.expirationInMillis),
        secure: true,
        httpOnly: true,
      })
      .status(200)
      .json({
        message: "Logout completed",
      });
  }
}

export default LogoutController.getInstance();
