import express from "express";
import ValidationError from "../errors/validation-error";
import commonValidators from "../validations/common-validators";
import validate from "../validations/validate";

class ValidateMiddleware {
  private static instance: ValidateMiddleware;

  static getInstance() {
    if (!ValidateMiddleware.instance) {
      ValidateMiddleware.instance = new ValidateMiddleware();
    }
    return ValidateMiddleware.instance;
  }

  validateData(schemaType: string, pieceToValidate: string) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      validate.schema(schemaType, req[pieceToValidate]);
      next();
    };
  }

  validateUuidInPath(propertyName: string) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const isValid = commonValidators.isUUID(req.params[propertyName]);
      if (!isValid) {
        throw new ValidationError("The identifier should be an UUID");
      }
      next();
    };
  }
}

export default ValidateMiddleware.getInstance();
