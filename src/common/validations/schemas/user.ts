import { JSONSchemaType } from "ajv";
import { UserDto } from "../../../components/users/users.dto";

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
    },
    password: {
      type: "string",
      nullable: false,
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

export { createUserSchema, activateUserSchema, updateUserSchema };
