import { EntityManager, getManager, MoreThan } from "typeorm";
import { CommonServicesConfig } from "../../common/common.services.config";
import { CRUD } from "../../common/interfaces/crud";
import { TokenDto } from "./tokens.dto";
import { Token } from "./tokens.entity";
import configs from "../../configs";
import DateCommon from "../../common/date-common";
import { TokenType } from "../../common/enums/TokenType";
import { User } from "../users/users.entity";

class TokenService extends CommonServicesConfig implements CRUD {
  private static instance: TokenService;

  /* istanbul ignore next */
  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  create(tokenData: TokenDto, manager?: EntityManager) {
    const tokenRepository = manager ? manager.getRepository(Token) : getManager().getRepository(Token);
    const token = new Token();
    token.user = tokenData.user;
    token.token = tokenData.token;
    token.type = tokenData.type;
    token.expiresAt = DateCommon.addTime(DateCommon.getCurrentDate(), {
      hours: configs.activationToken.expirationInHours,
    });
    return tokenRepository.save(token);
  }

  async findActivationToken(token: string) {
    const tokenRepository = getManager().getRepository(Token);
    return await tokenRepository.findOne({
      where: {
        token,
        type: TokenType.userActivation,
        expiresAt: MoreThan(DateCommon.getCurrentDate()),
      },
    });
  }

  async deleteActivationTokensOfUser(user: User, manager?: EntityManager) {
    const tokenRepository = manager ? manager.getRepository(Token) : getManager().getRepository(Token);
    return tokenRepository.delete({
      user,
      type: TokenType.userActivation,
    });
  }

  list: (params: object, association?: any) => Promise<any>;
  updateById: (resourceId: any, dataToUpdate: any) => Promise<any>;
  findById: (resourceId: any) => Promise<any>;
  deleteById: (resourceId: any) => Promise<any>;
  patchById?: ((resourceId: any) => Promise<any>) | undefined;
}

export default TokenService.getInstance();
