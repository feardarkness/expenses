import { EntityRepository, getManager, Repository } from "typeorm";
import { TokenBlacklist } from "./tokens-blacklist.entity";
import { Token } from "./tokens.entity";

@EntityRepository(Token)
export class TokenBlacklistRepository extends Repository<Token> {
  findToken(token: string) {
    const tokenBlacklistRepository = getManager().getRepository(TokenBlacklist);

    return tokenBlacklistRepository.findOne(token);
  }
}
