export interface ListParamsInterface {
  limit?: string;
  offset?: string;
  order?: string;
}

export interface ExpenseListParamsInterface extends ListParamsInterface {
  thingId?: string;
}
