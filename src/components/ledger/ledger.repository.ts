import { EntityRepository, Repository } from "typeorm";

import { Ledger } from "./ledger.entity";

@EntityRepository(Ledger)
export class LedgerRepository extends Repository<Ledger> {
  // findActiveByEmail(email: string): Promise<User | undefined> {
  //   return this.createQueryBuilder("user")
  //     .where(`user.email=:email and status='${UserStatus.active}'`, { email })
  //     .getOne();
  // }
}
