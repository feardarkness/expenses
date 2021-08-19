import { LedgerQueryInterval } from "./enums/LedgerQueryInterval";

export default class ReportsHelper {
  static correctReportIntervalName(param: LedgerQueryInterval) {
    if (LedgerQueryInterval.daily === param) {
      return "day";
    } else if (LedgerQueryInterval.monthly === param) {
      return "month";
    } else if (LedgerQueryInterval.weekly === param) {
      return "week";
    } else {
      return "year";
    }
  }
}
