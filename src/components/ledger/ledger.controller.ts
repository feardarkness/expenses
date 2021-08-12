import * as express from "express";
import debug from "debug";
import ledgerService from "./ledger.service";
import log from "../../common/logger";
import NotFoundError from "../../common/errors/not-found-error";

const debugInstance: debug.IDebugger = debug("app:ledger-controller");

export class LedgerController {
  private static instance: LedgerController;

  /* istanbul ignore next */
  static getInstance(): LedgerController {
    if (!LedgerController.instance) {
      LedgerController.instance = new LedgerController();
    }
    return LedgerController.instance;
  }

  async create(req: express.Request, res: express.Response) {
    log.trace(`[create]`, { body: req.body });

    const ledger = await ledgerService.create(req.body, req.user);

    res.status(201).json(ledger.basicData());
  }

  async getById(req: express.Request, res: express.Response) {
    log.trace(`[getById]`, { id: req.params.entryId });

    const ledger = await ledgerService.findById(req.params.entryId, req.user);

    if (ledger === undefined) {
      throw new NotFoundError("Entry not found");
    }

    res.status(200).json(ledger.basicData());
  }

  async update(req: express.Request, res: express.Response) {
    log.trace(`[update]`, { id: req.params.entryId, body: req.body });

    const resp = await ledgerService.updateById(req.params.entryId, req.body, req.user);

    if (resp.affected === 0) {
      throw new NotFoundError("Entry not found");
    }

    res.status(200).json({
      message: "Entry updated successfully",
    });
  }

  async delete(req: express.Request, res: express.Response) {
    log.trace(`[delete]`, { id: req.params.entryId });

    await ledgerService.deleteById(req.params.entryId, req.user);

    res.status(204).send();
  }

  async list(req: express.Request, res: express.Response) {
    log.trace(`[list]`, { query: req.query });

    const { entries, total, limit, offset } = await ledgerService.list(req.query, req.user);

    res.status(200).json({
      records: entries,
      total,
      limit,
      offset,
    });
  }
}

export default LedgerController.getInstance();
