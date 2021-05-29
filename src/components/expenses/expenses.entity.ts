import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { thingSchema } from "../../common/validations/schemas/thing";
import { Thing } from "../things/things.entity";
import { User } from "../users/users.entity";
import { ExpenseDto } from "./expenses.dto";

@Entity()
export class Expense {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    scale: 2,
    precision: 10,
    type: "decimal",
  })
  amount: number;

  @Column({ nullable: true, name: "thing_id" })
  thingId: string;

  @ManyToOne((type) => Thing, { onDelete: "RESTRICT" })
  @JoinColumn({
    name: "thing_id",
  })
  thing: Thing;

  @Column({ nullable: true, name: "user_id" })
  userId: string;

  @ManyToOne((type) => User, { onDelete: "RESTRICT" })
  @JoinColumn({
    name: "user_id",
  })
  user: User;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    type: "timestamp",
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: true,
  })
  updatedAt: Date;

  public basicData(): ExpenseDto {
    return {
      amount: this.amount,
      thingId: this.thingId,
      userId: this.userId,
    };
  }
}
