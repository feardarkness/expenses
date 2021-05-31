export interface ExpenseDto {
  amount: string;
  userId: string;
  thingId: string;
  date: string;
}

export interface ExpenseUpdateDto {
  amount: string;
  date: string;
}

export interface ExpenseWithIdDTO extends ExpenseDto {
  id: string;
}