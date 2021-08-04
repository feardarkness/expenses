import { EntityRepository, Repository } from "typeorm";
import { UserStatus } from "../../common/enums/UserStatus";
import { User } from "./users.entity";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | undefined> {
    return this.createQueryBuilder("user").where("user.email=:email", { email }).getOne();
  }

  findActiveByEmail(email: string): Promise<User | undefined> {
    return this.createQueryBuilder("user")
      .where(`user.email=:email and status='${UserStatus.active}'`, { email })
      .getOne();
  }
}
