import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { UserType } from "../../common/enums/UserType";
import { UserBasicDto } from "./users.dto";
import { User } from "./users.entity";

@Entity()
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  issuedAt: Date;

  @ManyToOne((type) => User)
  @JoinColumn({
    name: "user_id",
  })
  user: User;
}
