import { CommonServicesConfig } from "../../common/common.services.config";
import { EntityManager, getManager } from "typeorm";
import { TokenRefresh } from "./tokens-refresh.entity";
import { User } from "../users/users.entity";
import configs from "../../configs";

class TokenRefreshService extends CommonServicesConfig {
  private static instance: TokenRefreshService;

  /* istanbul ignore next */
  static getInstance(): TokenRefreshService {
    if (!TokenRefreshService.instance) {
      TokenRefreshService.instance = new TokenRefreshService();
    }
    return TokenRefreshService.instance;
  }

  /* istanbul ignore next */
  find(token: string) {
    const tokenRefreshRepository = getManager().getRepository(TokenRefresh);

    return tokenRefreshRepository.findOne(token);
  }

  async create(
    { user, refreshToken, expirationDate }: { user: User; refreshToken: string; expirationDate: Date },
    manager?: EntityManager
  ) {
    const refreshTokenRepository = manager
      ? manager.getRepository(TokenRefresh)
      : getManager().getRepository(TokenRefresh);

    const token = new TokenRefresh();
    token.token = refreshToken;
    token.user = user;
    token.expires = expirationDate;

    const refreshTokenCreated = await refreshTokenRepository.save(token);
    return refreshTokenCreated;
  }

  /* istanbul ignore next */
  async remove(refreshToken: TokenRefresh) {
    const refreshTokenRepository = getManager().getRepository(TokenRefresh);
    return refreshTokenRepository.remove(refreshToken);
  }

  async removeAllOfUser(user: User, manager?: EntityManager) {
    const refreshTokenRepository = manager
      ? manager.getRepository(TokenRefresh)
      : getManager().getRepository(TokenRefresh);

    return refreshTokenRepository.delete({
      user,
    });
  }
}

export default TokenRefreshService.getInstance();
