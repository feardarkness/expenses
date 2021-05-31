import { add, fromUnixTime } from "date-fns";
import { formatISO, format, parse } from "date-fns";

const COMMON_DATE_FORMAT = "yyyy-MM-dd";

export default class DateCommon {
  /**
   * Add to a Date
   * @param date Date to operate with
   * @param duration Duration to be added
   */
  static addTime(date: number | Date, duration: Duration) {
    return add(date, duration);
  }

  /**
   * Returns the current date
   */
  static getCurrentDate(): Date {
    return new Date();
  }

  /**
   * Return the date in ISO 8601 format
   * @param date A javascript date
   */
  static getIsoDate(date: Date): string {
    return formatISO(date);
  }

  static formatDate(date: Date, formatToParse: string): string {
    return format(date, formatToParse);
  }

  static formatDateWithoutTime(date: Date) {
    return DateCommon.formatDate(date, COMMON_DATE_FORMAT);
  }

  static parseDateFromString(date: string) {
    return parse(date, COMMON_DATE_FORMAT, new Date());
  }

  static dateFromUnixTime(unixTime: number) {
    return fromUnixTime(unixTime);
  }
}
