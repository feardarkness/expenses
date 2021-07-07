import { JSONSchemaType } from "ajv";
import { ThingBasicDto, ThingDto } from "../../../components/things/things.dto";
import { ThingListParamsInterface } from "../../interfaces/list-params";

const thingListSchema: JSONSchemaType<ThingListParamsInterface> = {
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
    userId: {
      type: "string",
      minLength: 36,
      maxLength: 36,
      nullable: true,
    },
  },
  required: [],
  additionalProperties: false,
};

const thingSchema: JSONSchemaType<ThingDto> = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 3,
      maxLength: 100,
    },
    description: {
      type: "string",
      minLength: 3,
      maxLength: 500,
    },
  },
  required: ["name", "description"],
  additionalProperties: false,
};

const thingBasicDataSchema: JSONSchemaType<ThingBasicDto> = {
  type: "object",
  properties: {
    id: {
      type: "string",
      minLength: 36,
      maxLength: 36,
      nullable: false,
    },
    name: {
      type: "string",
      minLength: 3,
      maxLength: 100,
      nullable: false,
    },
    description: {
      type: "string",
      minLength: 3,
      maxLength: 500,
      nullable: false,
    },
    userId: {
      type: "string",
      minLength: 36,
      maxLength: 36,
      nullable: false,
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
    },
  },
  required: ["id", "name", "description", "userId", "createdAt", "updatedAt"],
  additionalProperties: false,
};

export { thingSchema, thingListSchema, thingBasicDataSchema };
