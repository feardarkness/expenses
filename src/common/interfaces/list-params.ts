import { LedgerEntryType } from "../enums/LedgerEntryType";

export interface ListParamsInterface {
  limit?: string;
  offset?: string;
  order?: string;
}

export interface LedgerListParamsInterface extends ListParamsInterface {
  thingId?: string;
  type?: LedgerEntryType;
  minDate?: string;
  maxDate?: string;
}

export interface ThingListParamsInterface extends ListParamsInterface {
  userId?: string;
}
