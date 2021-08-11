import express from "express";
import UnauthorizedError from "../errors/unauthorized-error";
import JWT from "../jwt";
import configs from "../../configs/index";
import log from "../logger";
import usersService from "../../components/users/users.service";
import { UserType } from "../enums/UserType";
import ForbiddenError from "../errors/forbidden-error";
import tokensBlacklistService from "../../components/tokens/tokens-blacklist.service";
import tokensRefreshService from "../../components/tokens/tokens-refresh.service";

class AuthMiddleware {
  private static instance: AuthMiddleware;

  /* istanbul ignore next */
  static getInstance() {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  /**
   * Returns a middleware that will validate  a jwt token
   * @param ignoreExpiration true to return a function that will validate the token expiration, false to avoid that validation
   * @returns () => {} Function that will validate the token
   */
  validateToken(ignoreExpiration = false) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const authorizationToken = req.get("authorization");

      let decodedToken;
      try {
        if (authorizationToken === undefined) {
          throw new Error(`Token is not defined`);
        }
        const [tokenKeyword, token] = authorizationToken.split(" ");
        if (tokenKeyword.toLocaleLowerCase() !== "bearer") {
          throw new Error(`Token keyword is not bearer`);
        }

        decodedToken = (await JWT.verify(token, configs.jwt.secret, {
          ignoreExpiration,
        })) as JWTTokenDto;

        const blackListedToken = await tokensBlacklistService.find(token);

        if (blackListedToken !== undefined) {
          throw new UnauthorizedError(`Token in blacklist: ${token}`);
        }

        req.decodedToken = decodedToken;
        req.token = token;

        const user = await usersService.findById(decodedToken.id);

        if (user === undefined) {
          throw new Error(`User with id ${decodedToken.id} not found`);
        }

        req.user = user;
      } catch (err) {
        log.error(`Authorization error`, { err, authorizationToken });
        throw new UnauthorizedError(`Authorization token not provided or invalid`);
      }

      next();
    };
  }

  /**
   * Check if the refreshToken is valid; if found, delete it
   * @param req
   * @param res
   * @param next
   */
  async validateRefreshToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const refreshToken = await tokensRefreshService.find(req.body.refreshToken);
    if (refreshToken === undefined) {
      throw new UnauthorizedError("Unauthorized");
    }
    next();
  }

  /**
   * Delete all refresh tokens of the user
   * @param req
   * @param res
   * @param next
   */
  async deleteAllRefreshTokensOfUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    await tokensRefreshService.removeAllOfUser(req.user);
    next();
  }

  /**
   * Check if the user type is allowed to perform some action
   * @param userTypes User types allowed
   */
  userTypeAllowed(userTypes: UserType[]) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!userTypes.includes(req.user.type)) {
        throw new ForbiddenError(`User type "${req.user.type}" is not allowed on this route`);
      }
      next();
    };
  }
}

export interface JWTTokenDto {
  exp: string;
  userId: string;
  issued: string;
}

export default AuthMiddleware.getInstance();
