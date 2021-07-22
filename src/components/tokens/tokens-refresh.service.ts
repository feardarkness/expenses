import { CommonServicesConfig } from "../../common/common.services.config";
import { getManager } from "typeorm";
import { TokenRefresh } from "./tokens-refresh.entity";

class TokenRefreshService extends CommonServicesConfig {
  private static instance: TokenRefreshService;

  static getInstance(): TokenRefreshService {
    if (!TokenRefreshService.instance) {
      TokenRefreshService.instance = new TokenRefreshService();
    }
    return TokenRefreshService.instance;
  }

  find(token: string) {
    const tokenBlacklistRepository = getManager().getRepository(TokenRefresh);

    return tokenBlacklistRepository.findOne(token);
  }
}

export default TokenRefreshService.getInstance();
