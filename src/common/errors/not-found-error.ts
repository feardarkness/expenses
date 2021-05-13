import { ErrorInterface } from "../interfaces/error-interface";

export default class NotFoundError extends Error implements ErrorInterface {
  errorStatusCode = 404;

  constructor(message: string) {
    super(message);
  }
}
