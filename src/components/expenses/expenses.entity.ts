import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import DateCommon from "../../common/date-common";
import { thingSchema } from "../../common/validations/schemas/thing";
import { Thing } from "../things/things.entity";
import { User } from "../users/users.entity";
import { ExpenseDto, ExpenseWithIdDTO } from "./expenses.dto";

@Entity()
export class Expense {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    scale: 2,
    precision: 12,
    type: "decimal",
  })
  amount: string;

  @Column({ nullable: false, name: "thing_id" })
  thingId: string;

  @ManyToOne((type) => Thing, { onDelete: "RESTRICT" })
  @JoinColumn({
    name: "thing_id",
  })
  thing: Thing;

  @Column({
    nullable: false,
    name: "user_id",
  })
  userId: string;

  @ManyToOne((type) => User, { onDelete: "RESTRICT" })
  @JoinColumn({
    name: "user_id",
  })
  user: User;

  @Column({
    type: "date",
    nullable: false,
    default: () => "NOW()",
  })
  date: string;

  @Column({
    type: "timestamptz",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    type: "timestamptz",
    nullable: false,
    onUpdate: "CURRENT_TIMESTAMP",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  public basicData(): ExpenseWithIdDTO {
    return {
      id: this.id,
      amount: this.amount,
      thingId: this.thingId,
      userId: this.userId,
      date: this.date,
    };
  }
}
