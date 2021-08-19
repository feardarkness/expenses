import * as express from "express";
import DateCommon from "../../common/date-common";
import { LedgerQueryInterval } from "../../common/enums/LedgerQueryInterval";
import ValidationError from "../../common/errors/validation-error";

class UserReportMiddleware {
  private static instance: UserReportMiddleware;

  /* istanbul ignore next */
  static getInstance() {
    if (!UserReportMiddleware.instance) {
      UserReportMiddleware.instance = new UserReportMiddleware();
    }
    return UserReportMiddleware.instance;
  }

  /**
   * Validate that minDate and maxDate range is not too big for the interval selected (To avoid really big queries)
   * @param req
   * @param res
   * @param next
   */
  async validateDateRangeForReportInterval(req: express.Request, res: express.Response, next: express.NextFunction) {
    const minDate = new Date(req.query.minDate as string);
    const maxDate = new Date(req.query.maxDate as string);
    const interval = req.query.interval as LedgerQueryInterval;

    // allow only a range of 94 days (kinda three months) with daily interval
    if (
      interval === LedgerQueryInterval.daily &&
      DateCommon.isDateBefore(DateCommon.addTime(minDate, { days: 93 }), maxDate)
    ) {
      throw new ValidationError(`Expected range of days is 94 with a ${LedgerQueryInterval.daily} interval`);
    }

    // allow only a range of 27 weeks (kinda six months)  with weekly interval
    if (
      interval === LedgerQueryInterval.weekly &&
      DateCommon.isDateBefore(DateCommon.addTime(minDate, { weeks: 27 }), maxDate)
    ) {
      throw new ValidationError(`Expected range of months is six with a ${LedgerQueryInterval.weekly} interval`);
    }

    // allow only a range of 12 months (a year)  with monthly interval
    if (
      interval === LedgerQueryInterval.monthly &&
      DateCommon.isDateBefore(DateCommon.addTime(minDate, { months: 12 }), maxDate)
    ) {
      throw new ValidationError(`Expected range of months is twelve with a ${LedgerQueryInterval.monthly} interval`);
    }

    // allow only a range of 10 years with yearly interval
    if (
      interval === LedgerQueryInterval.yearly &&
      DateCommon.isDateBefore(DateCommon.addTime(minDate, { years: 10 }), maxDate)
    ) {
      throw new ValidationError(`Expected range of years is ten with a ${LedgerQueryInterval.yearly} interval`);
    }

    next();
  }
}

export default UserReportMiddleware.getInstance();
