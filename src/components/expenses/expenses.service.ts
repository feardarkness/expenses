import { CRUD } from "../../common/interfaces/crud";
import { getManager } from "typeorm";
import { CommonServicesConfig } from "../../common/common.services.config";
import debug from "debug";
import { Expense } from "./expenses.entity";
import { ExpenseDto, ExpenseUpdateDto } from "./expenses.dto";
import { Thing } from "../things/things.entity";
import { User } from "../users/users.entity";

const debugInstance: debug.IDebugger = debug("app:thing-service");

class ExpenseService extends CommonServicesConfig implements CRUD {
  private static instance: ExpenseService;

  static getInstance(): ExpenseService {
    if (!ExpenseService.instance) {
      ExpenseService.instance = new ExpenseService();
    }
    return ExpenseService.instance;
  }

  create(resource: ExpenseDto) {
    const expenseRepository = getManager().getRepository(Expense);

    const expense = new Expense();
    expense.amount = resource.amount;

    const thing = new Thing();
    thing.id = resource.thingId;
    expense.thing = thing;

    const user = new User();
    user.id = resource.userId;
    expense.user = user;

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
        ...dataToUpdate,
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

  list: (limit: number, page: number) => Promise<any>;
  patchById?: ((resourceId: any) => Promise<any>) | undefined;
}

export default ExpenseService.getInstance();
