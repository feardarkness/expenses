import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import DateCommon from "../../common/date-common";
import { LedgerEntryType } from "../../common/enums/LedgerEntryType";
import { Thing } from "../things/things.entity";
import { User } from "../users/users.entity";
import { LedgerWithIdDto } from "./ledger.dto";

@Entity()
// @Index("yearIndex", { synchronize: false })  // exclude from synchronize so it is not deleted if found
// @Index("monthIndex", { synchronize: false })
export class Ledger {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    scale: 2,
    precision: 12,
    type: "decimal",
  })
  amount: number;

  @Column({
    type: "enum",
    enum: LedgerEntryType,
    nullable: false,
  })
  type: LedgerEntryType;

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

  public basicData(): LedgerWithIdDto {
    return {
      id: this.id,
      amount: this.amount,
      thingId: this.thingId,
      userId: this.userId,
      type: this.type,
      date: this.date,
      createdAt: DateCommon.getIsoDate(this.createdAt),
      updatedAt: DateCommon.getIsoDate(this.updatedAt),
    };
  }
}
