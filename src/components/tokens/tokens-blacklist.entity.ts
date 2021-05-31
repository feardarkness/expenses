import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class TokenBlacklist {
  @PrimaryColumn()
  token: string;

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  expires: Date;
}
