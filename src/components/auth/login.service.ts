import { User } from "../users/users.entity";
import JWT from "../../common/jwt";
import configs from "../../configs/index";
import { CommonServicesConfig } from "../../common/common.services.config";
import RandomString from "../../common/random-string";

class LoginService extends CommonServicesConfig {
  private static instance: LoginService;

  static getInstance(): LoginService {
    if (!LoginService.instance) {
      LoginService.instance = new LoginService();
    }
    return LoginService.instance;
  }

  async generateToken(user: User) {
    const token = await JWT.generateToken(
      {
        id: user.id,
        // someKey: "asdsadsa"
      },
      configs.jwt.secret,
      {
        algorithm: "HS256",
        expiresIn: configs.jwt.expiration,
      }
    );

    const refreshToken = await RandomString.generateSecureRandomString();

    return {
      token,
      refreshToken,
    };
  }
}

export default LoginService.getInstance();
