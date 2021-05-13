import { EntityRepository, Repository } from "typeorm";
import { Token } from "./tokens.entity";

@EntityRepository(Token)
export class TokenRepository extends Repository<Token> {
  findByToken(email: string): Promise<Token | undefined> {
    return this.createQueryBuilder("user").where("user.email=:email", { email }).getOne();
  }
}
