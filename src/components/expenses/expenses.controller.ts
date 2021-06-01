import * as express from "express";
import debug from "debug";
import expenseService from "./expenses.service";
import log from "../../common/logger";
import NotFoundError from "../../common/errors/not-found-error";

const debugInstance: debug.IDebugger = debug("app:expense-controller");

export class ExpenseController {
  private static instance: ExpenseController;

  static getInstance(): ExpenseController {
    if (!ExpenseController.instance) {
      ExpenseController.instance = new ExpenseController();
    }
    return ExpenseController.instance;
  }

  async create(req: express.Request, res: express.Response) {
    log.trace(`[create]`, { body: req.body });

    const expense = await expenseService.create(req.body);

    res.status(201).json(expense.basicData());
  }

  async getById(req: express.Request, res: express.Response) {
    log.trace(`[getById]`, { id: req.params.expenseId });

    const expense = await expenseService.findById(req.params.expenseId, req.user);

    if (expense === undefined) {
      throw new NotFoundError("Expense not found");
    }

    res.status(200).json(expense.basicData());
  }

  async update(req: express.Request, res: express.Response) {
    log.trace(`[update]`, { id: req.params.expenseId, body: req.body });

    const resp = await expenseService.updateById(req.params.expenseId, req.body, req.user);

    if (resp.affected === 0) {
      throw new NotFoundError("Expense not found");
    }

    res.status(200).json({
      message: "Expense updated successfully",
    });
  }

  async delete(req: express.Request, res: express.Response) {
    log.trace(`[delete]`, { id: req.params.expenseId });

    await expenseService.deleteById(req.params.expenseId, req.user);

    res.status(204).json({
      message: "Expense deleted successfully",
    });
  }

  async list(req: express.Request, res: express.Response) {
    log.trace(`[list]`, { query: req.query });

    const { expenses, total, limit, offset } = await expenseService.list(req.query, req.user);

    res.status(200).json({
      records: expenses,
      total,
      limit,
      offset,
    });
  }
}

export default ExpenseController.getInstance();
