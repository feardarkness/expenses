import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity()
export class Thing {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    length: 100,
  })
  name: string;

  @Column({
    length: 500,
  })
  description: string;

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
}
