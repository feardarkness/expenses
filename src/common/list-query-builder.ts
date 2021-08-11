import { LedgerListParamsInterface } from "./interfaces/list-params";

export default class ListQueryBuilder {
  static buildOrderQuery(queryOrder: string | undefined, fieldToOrderByDefault: string) {
    const order = {};

    if (queryOrder !== undefined) {
      const orderFields = queryOrder.split(",");
      orderFields.forEach((orderField) => {
        let orderChar = "+";
        let fieldName = orderField;
        if (orderField.charAt(0) === "+" || orderField.charAt(0) === "-") {
          orderChar = orderField.charAt(0);
          fieldName = orderField.substr(1);
        }

        if (orderChar === "-") {
          order[fieldName] = "DESC";
        } else {
          order[fieldName] = "ASC";
        }
      });
    } else {
      order[fieldToOrderByDefault] = "DESC";
    }
    return order;
  }

  static buildWhereQuery(queryWhere: LedgerListParamsInterface) {
    const where = {};
    const queryParamsWithWhereClausesOnly = { ...queryWhere };
    delete queryParamsWithWhereClausesOnly.limit;
    delete queryParamsWithWhereClausesOnly.order;
    delete queryParamsWithWhereClausesOnly.offset;

    const whereKeys = Object.getOwnPropertyNames(queryParamsWithWhereClausesOnly);
    whereKeys.forEach((whereKey) => {
      where[whereKey] = queryParamsWithWhereClausesOnly[whereKey];
    });
    return where;
  }

  static buildLimitQuery(limit: string = "100") {
    let intLimit = parseInt(limit);
    if (intLimit > 100) {
      intLimit = 100;
    }
    if (intLimit < 1) {
      intLimit = 1;
    }
    return intLimit;
  }

  static buildOffsetQuery(offset: string = "0") {
    return parseInt(offset);
  }

  static buildQuery(queryParams: LedgerListParamsInterface, fieldToOrderByDefault: string = "updatedAt") {
    const limit = this.buildLimitQuery(queryParams.limit);

    const offset = this.buildOffsetQuery(queryParams.offset);

    const order = this.buildOrderQuery(queryParams.order, fieldToOrderByDefault);

    const where = this.buildWhereQuery(queryParams);

    return {
      take: limit,
      skip: offset,
      order,
      where,
    };
  }
}
