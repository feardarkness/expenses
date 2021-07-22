import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../users/users.entity";

@Entity()
export class TokenRefresh {
  @PrimaryColumn()
  token: string;

  @Column({
    name: "user_id",
    nullable: false,
  })
  userId: string;

  @ManyToOne((type) => User, { onDelete: "RESTRICT" })
  @JoinColumn({
    name: "user_id",
  })
  user: User;

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  expires: Date;
}
