import { ErrorCode, ErrorContext, ErrorReasonCode, OperationType } from "./ErrorCode";

export enum ErrorType {
  None = 0,
  Failure = 1,
  Validation = 2,
  NotFound = 3,
  Conflict = 4,
  Unauthorized = 5,
  Forbidden = 6,
  Database = 7,
  HttpError = 8,
  Cancelled = 9
}

export class ResultError {
  public static readonly None = new ResultError("", "", ErrorType.None);

  public readonly code: string;
  public readonly description: string;
  public readonly type: ErrorType;
  public readonly userMessage: string;

  public constructor(
    code: string,
    description: string,
    type: ErrorType,
    userMessage = "",
    exception?: unknown
  ) {
    this.code = code;
    // Preserve the legacy shape without retaining technical descriptions or
    // exception objects that could later be rendered or serialized.
    this.description = userMessage || "The operation could not be completed.";
    this.type = type;
    this.userMessage = userMessage;
    void description;
    void exception;
  }

  public toString(): string {
    return `Error Code: ${this.code}\nDescription: ${this.description}`;
  }

  public static notFound(errorContext: ErrorContext): ResultError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.GeneralNotFound);
    const suffix = `${errorContext.entityName} not found`;
    return new ResultError(errorCode.code, this.formatDescription(errorContext, suffix), ErrorType.NotFound, suffix);
  }

  public static conflict(errorContext: ErrorContext): ResultError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.GeneralConflict);
    const suffix = `Unique ${errorContext.entityName} constraint violated.`;
    return new ResultError(errorCode.code, this.formatDescription(errorContext, suffix), ErrorType.Conflict, suffix);
  }

  public static unauthorized(errorContext: ErrorContext): ResultError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.GeneralUnauthorized);
    const suffix = `Unauthorized access${errorContext.fieldName && errorContext.fieldName.trim().length > 0 ? ` to ${errorContext.fieldName}` : ""}`;
    return new ResultError(errorCode.code, this.formatDescription(errorContext, suffix), ErrorType.Unauthorized, suffix);
  }

  public static failure(errorContext: ErrorContext, descriptionSuffix?: string, exception?: unknown): ResultError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.GeneralFailure);
    const suffix =
      descriptionSuffix && descriptionSuffix.trim().length > 0
        ? descriptionSuffix
        : `An unexpected failure occurred while processing ${errorContext.entityName}.`;
    return new ResultError(errorCode.code, this.formatDescription(errorContext, suffix), ErrorType.Failure, suffix, exception);
  }

  public static cancelled(errorContext: ErrorContext): ResultError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.OperationCancelled);
    const suffix = `The operation on ${errorContext.entityName} was cancelled.`;
    return new ResultError(errorCode.code, this.formatDescription(errorContext, suffix), ErrorType.Cancelled, suffix);
  }

  protected static formatDescription(errorContext: ErrorContext, descriptionSuffix: string): string {
    const operationName = OperationType[errorContext.operation] ?? String(errorContext.operation);
    const prefix =
      `An error occurred during ${operationName} on entity ${errorContext.entityName}:\n` +
      `Layer: ${errorContext.layer}\n` +
      `Service: ${errorContext.serviceName}\n` +
      `Method: ${errorContext.methodName}`;
    return `${prefix}: ${descriptionSuffix}`;
  }
}

export { ResultError as Error };
