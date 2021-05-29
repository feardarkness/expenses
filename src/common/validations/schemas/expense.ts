import { JSONSchemaType } from "ajv";
import { ExpenseDto, ExpenseUpdateDto } from "../../../components/expenses/expenses.dto";

const expenseSchema: JSONSchemaType<ExpenseDto> = {
  type: "object",
  properties: {
    amount: {
      type: "number",
      minimum: 0,
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
  },
  required: ["amount", "userId", "thingId"],
  additionalProperties: false,
};

const expenseUpdateSchema: JSONSchemaType<ExpenseUpdateDto> = {
  type: "object",
  properties: {
    amount: {
      type: "number",
      minimum: 0,
    },
  },
  required: ["amount"],
  additionalProperties: false,
};

export { expenseSchema, expenseUpdateSchema };
