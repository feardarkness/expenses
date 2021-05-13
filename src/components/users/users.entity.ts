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
    length: 100,
  })
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column()
  age: number;

  @Column({
    nullable: false,
  })
  @Index({
    unique: true,
  })
  email: string;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    type: "enum",
    enum: UserType,
    default: UserType.user,
  })
  type: UserType;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.new,
  })
  status: UserStatus;

  @Column({
    type: "timestamp",
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: true,
  })
  updatedAt: Date;

  @OneToMany(() => Token, (token) => token.user, { onDelete: "CASCADE" })
  tokens: Token[];

  public basicData(): UserBasicDto {
    return {
      email: this.email,
      id: this.id,
      age: this.age,
      firstName: this.firstName,
      lastName: this.lastName,
    };
  }
}
