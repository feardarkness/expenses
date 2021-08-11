export interface ListParamsInterface {
  limit?: string;
  offset?: string;
  order?: string;
}

export interface LedgerListParamsInterface extends ListParamsInterface {
  thingId?: string;
}

export interface ThingListParamsInterface extends ListParamsInterface {
  userId?: string;
}
