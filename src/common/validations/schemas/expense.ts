import { JSONSchemaType } from "ajv";
import { ExpenseDto, ExpenseUpdateDto } from "../../../components/expenses/expenses.dto";

const expenseSchema: JSONSchemaType<ExpenseDto> = {
  type: "object",
  properties: {
    amount: {
      type: "string",
      pattern: "^[0-9]{1,10}.[0-9]{2}$",
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
      pattern: "^[0-9]{1,10}.[0-9]{2}$",
    },
    date: {
      type: "string",
      format: "date",
    },
  },
  required: ["amount", "date"],
  additionalProperties: false,
};

export { expenseSchema, expenseUpdateSchema };
