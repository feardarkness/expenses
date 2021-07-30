import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from "typeorm";
import { UserStatus } from "../../common/enums/UserStatus";
import { UserType } from "../../common/enums/UserType";
import { Token } from "../tokens/tokens.entity";
import { UserBasicDto } from "./users.dto";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    length: 300,
    nullable: true,
  })
  fullName: string;

  @Column({
    nullable: false,
  })
  password: string;

  @Column({
    nullable: true,
  })
  age: number;

  @Column({
    nullable: false,
  })
  @Index({
    unique: true,
  })
  email: string;

  @Column({
    type: "enum",
    enum: UserType,
    default: UserType.user,
    nullable: false,
  })
  type: UserType;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.new,
    nullable: false,
  })
  status: UserStatus;

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  createdAt: Date;

  @Column({
    type: "timestamptz",
    onUpdate: "CURRENT_TIMESTAMP",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  updatedAt: Date;

  @OneToMany(() => Token, (token) => token.user, { onDelete: "CASCADE" })
  tokens: Token[];

  public basicData(): UserBasicDto {
    return {
      email: this.email,
      id: this.id,
      age: this.age,
      fullName: this.fullName,
    };
  }
}
