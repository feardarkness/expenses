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
      type: "string",
      pattern: "^[0-9]{1,10}\\.[0-9]{2}$",
    },
    userId: {
      type: "string",
      minLength: 36,
      maxLength: 36,
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
  required: ["amount", "userId", "thingId", "date"],
  additionalProperties: false,
};

const expenseUpdateSchema: JSONSchemaType<ExpenseUpdateDto> = {
  type: "object",
  properties: {
    amount: {
      type: "string",
      pattern: "^[0-9]{1,10}\\.[0-9]{2}$",
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
