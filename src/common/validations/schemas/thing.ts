import { JSONSchemaType } from "ajv";
import { ThingDto } from "../../../components/thing/thing.dto";

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

export { thingSchema };
