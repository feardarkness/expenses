import { JSONSchemaType } from "ajv";
import { ReportQuery, UserDto } from "../../../components/users/users.dto";
import { LedgerEntryType } from "../../enums/LedgerEntryType";
import { LedgerQueryGroupBy } from "../../enums/LedgerQueryGroupBy";
import { LedgerQueryInterval } from "../../enums/LedgerQueryInterval";

const createUserSchema: JSONSchemaType<UserDto> = {
  type: "object",
  properties: {
    age: {
      type: "integer",
      minimum: 0,
      maximum: 200,
      nullable: true,
    },
    fullName: {
      type: "string",
      nullable: true,
      maxLength: 300,
    },
    email: {
      type: "string",
      format: "email",
      nullable: false,
      minLength: 3,
      maxLength: 254,
      transform: ["trim", "toLowerCase"],
    },
    password: {
      type: "string",
      nullable: false,
      minLength: 5,
      maxLength: 60,
    },
  },
  required: ["email", "password"],
  additionalProperties: false,
};

interface ActivateUserQuery {
  token: string;
}

const activateUserSchema: JSONSchemaType<ActivateUserQuery> = {
  type: "object",
  properties: {
    token: {
      type: "string",
    },
  },
  required: ["token"],
  additionalProperties: false,
};

interface UpdateUser {
  fullName?: string;
  age?: number;
}

const updateUserSchema: JSONSchemaType<UpdateUser> = {
  type: "object",
  properties: {
    age: {
      type: "integer",
      minimum: 0,
      maximum: 200,
      nullable: true,
    },
    fullName: {
      type: "string",
      nullable: true,
      maxLength: 300,
    },
  },
  required: [],
  additionalProperties: false,
};

interface GenerateActivationTokenQuery {
  email: string;
}

const activationTokenForUserSchema: JSONSchemaType<GenerateActivationTokenQuery> = {
  type: "object",
  properties: {
    email: {
      type: "string",
      format: "email",
      nullable: false,
      transform: ["trim", "toLowerCase"],
    },
  },
  required: ["email"],
  additionalProperties: false,
};

const reportQuerySchema: JSONSchemaType<ReportQuery> = {
  type: "object",
  properties: {
    interval: {
      type: "string",
      enum: Object.values(LedgerQueryInterval),
    },
    groupBy: {
      type: "array",
      nullable: true,
      default: [LedgerQueryGroupBy.entryType],
      uniqueItems: true,
      items: {
        type: "string",
        enum: Object.values(LedgerQueryGroupBy),
      },
    },
    minDate: {
      type: "string",
      format: "date",
    },
    maxDate: {
      type: "string",
      format: "date",
    },
  },
  required: ["interval", "minDate", "maxDate"],
  additionalProperties: false,
};

export { createUserSchema, activateUserSchema, updateUserSchema, activationTokenForUserSchema, reportQuerySchema };
