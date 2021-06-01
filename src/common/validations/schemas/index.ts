import { createUserSchema, activateUserSchema, updateUserSchema } from "./user";
import loginSchema from "./login";
import { thingSchema } from "./thing";
import { expenseListSchema, expenseSchema, expenseUpdateSchema } from "./expense";

export default {
  createUserSchema,
  activateUserSchema,
  updateUserSchema,
  loginSchema,
  thingSchema,
  expenseSchema,
  expenseUpdateSchema,
  expenseListSchema,
};
