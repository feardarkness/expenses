import { CommonServicesConfig } from "../../common/common.services.config";
import { getManager } from "typeorm";
import { TokenBlacklist } from "../tokens/tokens-blacklist.entity";
import DateCommon from "../../common/date-common";

export class LogoutService extends CommonServicesConfig {
  private static instance: LogoutService;

  static getInstance(): LogoutService {
    if (!LogoutService.instance) {
      LogoutService.instance = new LogoutService();
    }
    return LogoutService.instance;
  }

  async addTokenToBlacklist(token: string, expires: number) {
    const tokenBlacklistRepository = getManager().getRepository(TokenBlacklist);

    const tokenBlacklist = new TokenBlacklist();
    tokenBlacklist.token = token;
    tokenBlacklist.expires = DateCommon.dateFromUnixTime(expires);

    return tokenBlacklistRepository.save(tokenBlacklist);
  }
}

export default LogoutService.getInstance();
