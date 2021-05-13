import { TokenType } from "../../common/enums/TokenType";
import { User } from "../users/users.entity";

export interface TokenDto {
  token: string;
  type: TokenType;
  user: User;
}
