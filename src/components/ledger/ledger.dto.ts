import { LedgerEntryType } from "../../common/enums/LedgerEntryType";

export interface LedgerDto {
  amount: number;
  thingId: string;
  date: string;
  type: LedgerEntryType;
}

export interface LedgerUpdateDto {
  amount: number;
  thingId: string;
  type: string;
  date: string;
}

export interface LedgerWithIdDto extends LedgerDto {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
