import { ResultError, ErrorType } from "./Error";
import { DatabaseError } from "./DatabaseError";
import { HttpError, HttpErrorType } from "./HttpError";
import { ValidationError } from "./ValidationError";

export interface IErrorLogPolicy {
  shouldLog(error: ResultError): boolean;
}

export class ErrorLogPolicy implements IErrorLogPolicy {
  public shouldLog(error: ResultError): boolean {
    if (error instanceof ValidationError) {
      return false;
    }
    if (error instanceof DatabaseError) {
      return true;
    }
    if (error instanceof HttpError) {
      return this.shouldLogHttpError(error);
    }
    if (error.type === ErrorType.Cancelled) {
      return false;
    }
    return true;
  }

  private shouldLogHttpError(error: HttpError): boolean {
    switch (error.httpErrorType) {
      case HttpErrorType.BadRequest:
      case HttpErrorType.NotFound:
      case HttpErrorType.Conflict:
      case HttpErrorType.UnprocessableContent:
        return false;
      default:
        return true;
    }
  }
}
