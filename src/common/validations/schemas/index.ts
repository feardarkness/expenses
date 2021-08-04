import * as userSchemas from "./user";
import * as loginSchemas from "./login";
import * as thingSchemas from "./thing";
import * as expenseSchemas from "./expense";

export default {
  ...userSchemas,
  ...loginSchemas,
  ...thingSchemas,
  ...expenseSchemas,
};
