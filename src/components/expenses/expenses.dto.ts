export interface ExpenseDto {
  amount: number;
  thingId: string;
  date: string;
}

export interface ExpenseUpdateDto {
  amount: number;
  date: string;
}

export interface ExpenseWithIdDto extends ExpenseDto {
  id: string;
  userId: string;
}
