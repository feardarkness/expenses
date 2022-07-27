/* tslint:disable */
import { JSONSchemaType } from "ajv";
import { LedgerDto } from "../../../components/ledger/ledger.dto";
import { LedgerEntryType } from "../../enums/LedgerEntryType";
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
      enum: ["date", "amount", "createdAt", "updatedAt", "-date", "-amount", "-createdAt", "-updatedAt"],
    },
    thingId: {
      type: "string",
      nullable: true,
      minLength: 36,
      maxLength: 36,
    },
    type: {
      type: "string",
      nullable: true,
      enum: Object.values(LedgerEntryType),
    },
    minDate: {
      type: "string",
      format: "date",
      nullable: true,
    },
    maxDate: {
      type: "string",
      format: "date",
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
    type: {
      type: "string",
      enum: Object.values(LedgerEntryType),
    },
    date: {
      type: "string",
      format: "date",
    },
  },
  required: ["amount", "thingId", "date", "type"],
  additionalProperties: false,
  // if: {
  //   properties: {
  //     type: {
  //       const: LedgerEntryType.expense,
  //     },
  //   },
  // },
  // then: {
  //   properties: {
  //     amount: {
  //       type: "number",
  //       multipleOf: 0.01,
  //       maximum: 0,
  //     },
  //   },
  // },
  // else: {
  //   properties: {
  //     amount: {
  //       type: "number",
  //       multipleOf: 0.01,
  //       minimum: 0,
  //     },
  //   },
  // },
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
    type: {
      type: "string",
      enum: Object.values(LedgerEntryType),
    },
  },
  required: ["amount", "date", "thingId", "type"],
  additionalProperties: false,
};

export { ledgerSchema, ledgerUpdateSchema, ledgerListSchema };
