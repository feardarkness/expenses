export interface LedgerDto {
  amount: number;
  thingId: string;
  date: string;
}

export interface LedgerUpdateDto {
  amount: number;
  date: string;
}

export interface LedgerWithIdDto extends LedgerDto {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
