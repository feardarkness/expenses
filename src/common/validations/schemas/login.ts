import { JSONSchemaType } from "ajv";
import { LoginBodyDto, RefreshTokenBodyDto } from "../../../components/auth/login.dto";

const loginSchema: JSONSchemaType<LoginBodyDto> = {
  type: "object",
  properties: {
    email: {
      type: "string",
    },
    password: {
      type: "string",
    },
  },
  required: ["email", "password"],
  additionalProperties: false,
};

const refreshSchema: JSONSchemaType<RefreshTokenBodyDto> = {
  type: "object",
  properties: {
    refreshToken: {
      type: "string",
    },
  },
  required: ["refreshToken"],
  additionalProperties: false,
};

export { loginSchema, refreshSchema };
