import * as format from "pg-format";

export default class SanitizeSql {
  static escapeLiteralString(val: string) {
    return format.literal(val);
  }
  static escapeIdentifierString(val: string) {
    return format.string(val);
  }
}
