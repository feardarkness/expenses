import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { TokenType } from "../../common/enums/TokenType";
import { UserType } from "../../common/enums/UserType";
import { UserBasicDto } from "../users/users.dto";
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
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  issuedAt: Date;

  @Column({
    nullable: false,
    type: "timestamp",
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
}
