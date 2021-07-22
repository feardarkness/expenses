import { JSONSchemaType } from "ajv";
import { ExpenseDto, ExpenseUpdateDto } from "../../../components/expenses/expenses.dto";
import { ExpenseListParamsInterface } from "../../interfaces/list-params";

const expenseListSchema: JSONSchemaType<ExpenseListParamsInterface> = {
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

const expenseSchema: JSONSchemaType<ExpenseDto> = {
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

const expenseUpdateSchema: JSONSchemaType<ExpenseUpdateDto> = {
  type: "object",
  properties: {
    amount: {
      type: "number",
      multipleOf: 0.01,
      minimum: 0,
    },
    date: {
      type: "string",
      format: "date",
    },
  },
  required: ["amount", "date"],
  additionalProperties: false,
};

export { expenseSchema, expenseUpdateSchema, expenseListSchema };
