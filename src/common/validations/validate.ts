import Ajv, { DefinedError } from "ajv";
import Schemas from "./schemas/index";
import ValidationError from "../errors/validation-error";
import addFormats from "ajv-formats";
import log from "../logger";
import ajvKeywords from "ajv-keywords";

class Validate {
  private static instance: Validate;
  private validator: Ajv;

  constructor() {
    this.validator = new Ajv();
    addFormats(this.validator);
    ajvKeywords(this.validator);
  }

  getValidator() {
    return this.validator;
  }

  /* istanbul ignore next */
  static getInstance() {
    if (!Validate.instance) {
      Validate.instance = new Validate();
    }
    return Validate.instance;
  }

  schema(schemaName: string, data: any) {
    log.trace(`[Validate ] validating with schema`, { schemaName, data });

    const validate = this.validator.compile(Schemas[schemaName]);
    if (!validate(data)) {
      log.trace(`[Validate] errors on validate`, {
        errors: validate.errors,
      });

      const errors: string[] | undefined = [];

      for (const err of validate.errors as DefinedError[]) {
        console.log("err======================");
        console.log(err);
        console.log("======================");
        let errMessage: string = "Error";
        if (err.keyword === "enum") {
          errMessage = `${err.dataPath} ${err.message}`.trim();
          if (err.params && "allowedValues" in err.params && Array.isArray(err.params.allowedValues)) {
            errMessage = `${errMessage} [${err.params.allowedValues.join(",")}].`;
          }
        } else if (err.message) {
          errMessage = `${err.dataPath} ${err.message}`.trim();

          if (err.params && "additionalProperty" in err.params) {
            errMessage = `${errMessage} [${err.params.additionalProperty}]`;
          }
        }
        if (errMessage.startsWith("/")) {
          errMessage = errMessage.substr(1);
        }
        errors.push(errMessage);
      }
      throw new ValidationError(`Invalid data`, errors);
    }
  }
}

export default Validate.getInstance();
