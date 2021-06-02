import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { TokenType } from "../../common/enums/TokenType";
import { User } from "../users/users.entity";

@Entity()
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: false,
    length: 500,
  })
  @Index({
    unique: true,
  })
  token: string;

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  issuedAt: Date;

  @Column({
    type: "timestamptz",
    nullable: false,
  })
  expiresAt: Date;

  @Column({
    type: "enum",
    enum: TokenType,
    nullable: false,
  })
  type: TokenType;

  @ManyToOne((type) => User, { onDelete: "CASCADE" })
  @JoinColumn({
    name: "user_id",
  })
  user: User;

  @Column({
    nullable: false,
    name: "user_id",
  })
  userId: string;
}
