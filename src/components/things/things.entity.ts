import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../users/users.entity";
import { ThingBasicDto } from "./things.dto";
import DateCommon from "../../common/date-common";

@Entity()
export class Thing {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    length: 100,
    nullable: false,
  })
  name: string;

  @Column({
    length: 500,
    nullable: false,
  })
  description: string;

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
    nullable: false,
  })
  createdAt: Date;

  @Column({
    type: "timestamptz",
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  public basicData(): ThingBasicDto {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      userId: this.userId,
      createdAt: DateCommon.getIsoDate(this.createdAt),
      updatedAt: DateCommon.getIsoDate(this.updatedAt),
    };
  }
}
