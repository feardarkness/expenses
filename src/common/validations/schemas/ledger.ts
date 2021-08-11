import { JSONSchemaType } from "ajv";
import { LedgerDto } from "../../../components/ledger/ledger.dto";
import { LedgerListParamsInterface } from "../../interfaces/list-params";

const ledgerListSchema: JSONSchemaType<LedgerListParamsInterface> = {
  type: "object",
  properties: {
    limit: {
      type: "string",
      nullable: true,
      pattern: "^\\d+$",
    },
    offset: {
      type: "string",
      nullable: true,
      pattern: "^\\d+$",
    },
    order: {
      type: "string",
      nullable: true,
    },
    thingId: {
      type: "string",
      minLength: 36,
      maxLength: 36,
      nullable: true,
    },
  },
  required: [],
  additionalProperties: false,
};

const ledgerSchema: JSONSchemaType<LedgerDto> = {
  type: "object",
  properties: {
    amount: {
      type: "number",
      multipleOf: 0.01,
      minimum: 0,
    },
    thingId: {
      type: "string",
      minLength: 36,
      maxLength: 36,
    },
    date: {
      type: "string",
      format: "date",
    },
  },
  required: ["amount", "thingId", "date"],
  additionalProperties: false,
};

const ledgerUpdateSchema: JSONSchemaType<LedgerDto> = {
  type: "object",
  properties: {
    amount: {
      type: "number",
      multipleOf: 0.01,
      minimum: 0,
    },
    thingId: {
      type: "string",
      minLength: 36,
      maxLength: 36,
    },
    date: {
      type: "string",
      format: "date",
    },
  },
  required: ["amount", "date", "thingId"],
  additionalProperties: false,
};

export { ledgerSchema, ledgerUpdateSchema, ledgerListSchema };
