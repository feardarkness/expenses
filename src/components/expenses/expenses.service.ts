import { CRUD } from "../../common/interfaces/crud";
import { getManager } from "typeorm";
import { CommonServicesConfig } from "../../common/common.services.config";
import debug from "debug";
import { Expense } from "./expenses.entity";
import { ExpenseDto, ExpenseUpdateDto } from "./expenses.dto";
import { Thing } from "../things/things.entity";
import { User } from "../users/users.entity";
import DateCommon from "../../common/date-common";
import { ExpenseListParamsInterface } from "../../common/interfaces/list-params";
import ListQueryBuilder from "../../common/list-query-builder";

const debugInstance: debug.IDebugger = debug("app:expense-service");

class ExpenseService extends CommonServicesConfig implements CRUD {
  private static instance: ExpenseService;

  static getInstance(): ExpenseService {
    if (!ExpenseService.instance) {
      ExpenseService.instance = new ExpenseService();
    }
    return ExpenseService.instance;
  }

  create(resource: ExpenseDto, user: User) {
    const expenseRepository = getManager().getRepository(Expense);

    const expense = new Expense();
    expense.amount = resource.amount;

    const thing = new Thing();
    thing.id = resource.thingId;
    expense.thing = thing;

    expense.user = user;

    expense.date = (DateCommon.parseDateFromString(resource.date) as unknown) as string;

    return expenseRepository.save(expense);
  }

  async deleteById(resourceId: string, user: User) {
    const expenseRepository = getManager().getRepository(Expense);

    return expenseRepository.delete({
      id: resourceId,
      user,
    });
  }

  async updateById(resourceId: string, dataToUpdate: ExpenseUpdateDto, user: User) {
    const expenseRepository = getManager().getRepository(Expense);

    return expenseRepository.update(
      {
        id: resourceId,
        userId: user.id,
      },
      {
        amount: dataToUpdate.amount,
        date: (DateCommon.parseDateFromString(dataToUpdate.date) as unknown) as string,
        updatedAt: new Date(),
      }
    );
  }

  async findById(expenseId: string, user: User) {
    const expenseRepository = getManager().getRepository(Expense);
    return expenseRepository.findOne({
      where: {
        id: expenseId,
        user: user,
      },
    });
  }

  async list(queryParams: ExpenseListParamsInterface, user: User) {
    const expenseRepository = getManager().getRepository(Expense);
    const query = ListQueryBuilder.buildQuery(queryParams);
    query.where["userId"] = user.id;

    const [expenses, total] = await Promise.all([
      expenseRepository.find(query),
      expenseRepository.count({
        where: query.where,
      }),
    ]);

    return {
      expenses,
      total,
      limit: query.take,
      offset: query.skip,
    };
  }

  patchById?: ((resourceId: any) => Promise<any>) | undefined;
}

export default ExpenseService.getInstance();
