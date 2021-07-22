import express from "express";
import UnauthorizedError from "../errors/unauthorized-error";
import JWT from "../jwt";
import configs from "../../configs/index";
import log from "../logger";
import usersService from "../../components/users/users.service";
import { UserType } from "../enums/UserType";
import ForbiddenError from "../errors/forbidden-error";
import tokensBlacklistService from "../../components/tokens/tokens-blacklist.service";

class AuthMiddleware {
  private static instance: AuthMiddleware;

  static getInstance() {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  /**
   * Returns a middleware that will validate  a token
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

  // /**
  //  * Validate the token, set req.user if the token is valid
  //  * @param req
  //  * @param res
  //  * @param next
  //  */
  // async tokenIsValid(req: express.Request, res: express.Response, next: express.NextFunction) {
  //   const authorizationToken = req.get("authorization");
  //   let decodedToken;
  //   try {
  //     if (authorizationToken === undefined) {
  //       throw new Error(`Token is not defined`);
  //     }
  //     const [tokenKeyword, token] = authorizationToken.split(" ");
  //     if (tokenKeyword.toLocaleLowerCase() !== "bearer") {
  //       throw new Error(`Token keyword is not bearer`);
  //     }

  //     decodedToken = (await JWT.verify(token, configs.jwt.secret)) as JWTTokenDto;

  //     const blackListedToken = await tokensBlacklistService.find(token);

  //     if (blackListedToken !== undefined) {
  //       throw new UnauthorizedError(`Token in blacklist: ${token}`);
  //     }

  //     req.decodedToken = decodedToken;
  //     req.token = token;

  //     const user = await usersService.findById(decodedToken.id);

  //     if (user === undefined) {
  //       throw new Error(`User with id ${decodedToken.id} not found`);
  //     }

  //     req.user = user;
  //   } catch (err) {
  //     log.error(`Authorization error`, { err, authorizationToken });
  //     throw new UnauthorizedError(`Authorization token not provided or invalid`);
  //   }

  //   next();
  // }

  // /**
  //  * Validate the token, set req.user if the token is valid. The token is valid even if is expired already
  //  * @param req
  //  * @param res
  //  * @param next
  //  */
  // async tokenIsValidEvenExpired(req: express.Request, res: express.Response, next: express.NextFunction) {
  //   const authorizationToken = req.get("authorization");
  //   let decodedToken;
  //   try {
  //     if (authorizationToken === undefined) {
  //       throw new Error(`Token is not defined`);
  //     }
  //     const [tokenKeyword, token] = authorizationToken.split(" ");
  //     if (tokenKeyword.toLocaleLowerCase() !== "bearer") {
  //       throw new Error(`Token keyword is not bearer`);
  //     }

  //     decodedToken = (await JWT.verify(token, configs.jwt.secret, {
  //       ignoreExpiration: true,
  //     })) as JWTTokenDto;

  //     const blackListedToken = await tokensBlacklistService.find(token);

  //     if (blackListedToken !== undefined) {
  //       throw new UnauthorizedError(`Token in blacklist: ${token}`);
  //     }

  //     req.decodedToken = decodedToken;
  //     req.token = token;

  //     const user = await usersService.findById(decodedToken.id);

  //     if (user === undefined) {
  //       throw new Error(`User with id ${decodedToken.id} not found`);
  //     }

  //     req.user = user;
  //   } catch (err) {
  //     log.error(`Authorization error`, { err, authorizationToken });
  //     throw new UnauthorizedError(`Authorization token not provided or invalid`);
  //   }

  //   next();
  // }

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
