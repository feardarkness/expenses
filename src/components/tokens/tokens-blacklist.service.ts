import { CommonServicesConfig } from "../../common/common.services.config";
import { getManager } from "typeorm";
import { TokenBlacklist } from "./tokens-blacklist.entity";

class TokenBlacklistService extends CommonServicesConfig {
  private static instance: TokenBlacklistService;

  static getInstance(): TokenBlacklistService {
    if (!TokenBlacklistService.instance) {
      TokenBlacklistService.instance = new TokenBlacklistService();
    }
    return TokenBlacklistService.instance;
  }

  find(token: string) {
    const tokenBlacklistRepository = getManager().getRepository(TokenBlacklist);

    return tokenBlacklistRepository.findOne(token);
  }
}

export default TokenBlacklistService.getInstance();
