import { CRUD } from "../../common/interfaces/crud";
import { UserDto } from "./users.dto";
import { User } from "./users.entity";
import { EntityManager, getManager } from "typeorm";
import { CommonServicesConfig } from "../../common/common.services.config";
import bcrypt from "../../common/bcrypt";
import configs from "../../configs";
import { UserType } from "../../common/enums/UserType";
import { UserStatus } from "../../common/enums/UserStatus";
import debug from "debug";
import tokensService from "../tokens/tokens.service";
import DateCommon from "../../common/date-common";
import ValidationError from "../../common/errors/validation-error";
import RandomString from "../../common/random-string";
import { TokenType } from "../../common/enums/TokenType";
import { TokenDto } from "../tokens/tokens.dto";
import mailsService from "../mails/mails.service";

const debugInstance: debug.IDebugger = debug("app:user-service");

class UserService extends CommonServicesConfig implements CRUD {
  private static instance: UserService;

  /* istanbul ignore next */
  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  list: (params: object, association?: any) => Promise<any>;

  /**
   * Creates a user
   * @param resource User data
   */
  async create(resource: UserDto, manager?: EntityManager) {
    const userRepository = manager ? manager.getRepository(User) : getManager().getRepository(User);

    const user = new User();
    Object.assign(user, resource);
    user.email = resource.email.toLowerCase();
    user.type = UserType.user;
    user.status = UserStatus.new;
    user.password = await bcrypt.hash(resource.password, configs.jwt.saltRounds);

    const createdUser = await userRepository.save(user);
    return createdUser;
  }

  async findById(userId: string) {
    const userRepository = getManager().getRepository(User);

    return userRepository.findOne(userId);
  }

  /* istanbul ignore next */
  async updateUser(user: User, dataToUpdate: UserDto) {
    const userRepository = getManager().getRepository(User);
    Object.assign(user, dataToUpdate);
    user.updatedAt = new Date();

    return userRepository.save(user);
  }

  async updateById(resourceId: string, dataToUpdate: UserDto) {
    const userRepository = getManager().getRepository(User);

    return userRepository.update(resourceId, {
      ...dataToUpdate,
      updatedAt: new Date(),
    });
  }

  async deleteById(resourceId: string) {
    const userRepository = getManager().getRepository(User);
    return userRepository.delete(resourceId);
  }

  async activateUser(activationToken: string) {
    const userRepository = getManager().getRepository(User);
    const token = await tokensService.findActivationToken(activationToken);

    if (token === undefined) {
      throw new ValidationError("Token not found or expired");
    }

    return userRepository.update(token.userId, {
      status: UserStatus.active,
      updatedAt: DateCommon.getCurrentDate(),
    });
  }

  async sendActivationEmail(user: User) {
    let userActivateToken;
    await getManager().transaction(async (transactionalEntityManager) => {
      await tokensService.deleteActivationTokensOfUser(user, transactionalEntityManager);
      userActivateToken = RandomString.generateRandomString(configs.activationToken.length);
      const userData = {
        token: userActivateToken,
        user,
        type: TokenType.userActivation,
      } as TokenDto;
      await tokensService.create(userData, transactionalEntityManager);
    });

    await mailsService.sendActivationEmail(userActivateToken, user.email);
  }
}

export default UserService.getInstance();
