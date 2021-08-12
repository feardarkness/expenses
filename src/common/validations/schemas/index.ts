import * as userSchemas from "./user";
import * as loginSchemas from "./login";
import * as thingSchemas from "./thing";
import * as ledgerSchemas from "./ledger";

export default {
  ...userSchemas,
  ...loginSchemas,
  ...thingSchemas,
  ...ledgerSchemas,
};
