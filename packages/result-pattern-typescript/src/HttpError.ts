import { ErrorReasonCode, ErrorCode, ErrorContext } from "./ErrorCode";
import { ErrorType, ResultError } from "./Error";

export enum HttpErrorType {
  Custom = 0,
  BadRequest = 1,
  Unauthorized = 2,
  Forbidden = 3,
  NotFound = 4,
  Conflict = 5,
  InternalServerError = 6,
  UnprocessableContent = 7,
  TooManyRequests = 8,
  TransportFailure = 9,
  MalformedResponse = 10,
  UnexpectedStatusCode = 11
}

export class HttpError extends ResultError {
  public readonly httpErrorType: HttpErrorType;

  private constructor(code: string, description: string, type: HttpErrorType, userMessage: string, exception?: unknown) {
    super(code, description, ErrorType.HttpError, userMessage, exception);
    this.httpErrorType = type;
  }

  public static custom(errorContext: ErrorContext, customDescriptionSuffix: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.Custom);
    return new HttpError(errorCode.code, this.formatDescription(errorContext, customDescriptionSuffix), HttpErrorType.Custom, customDescriptionSuffix);
  }

  public static transportFailure(errorContext: ErrorContext, exception?: unknown): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpTransportFailure);
    const suffix = "Transport Failure";
    return new HttpError(errorCode.code, this.formatDescription(errorContext, suffix), HttpErrorType.TransportFailure, suffix, exception);
  }

  public static tooManyRequests(errorContext: ErrorContext, callerMessage?: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpTooManyRequests);
    const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Too Many Requests";
    return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.TooManyRequests, userMessage);
  }

  public static malformedResponse(errorContext: ErrorContext, exception?: unknown, detail?: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpMalformedResponse);
    const userMessage = "The external service returned a malformed or unexpected response.";
    const suffix = detail && detail.trim().length > 0 ? detail : userMessage;
    return new HttpError(errorCode.code, this.formatDescription(errorContext, suffix), HttpErrorType.MalformedResponse, userMessage, exception);
  }

  public static unexpectedStatusCode(errorContext: ErrorContext, statusCode: number, statusText?: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpUnexpectedStatusCode);
    const suffix = `The external service returned an unexpected HTTP status code ${statusCode}${statusText ? ` (${statusText})` : ""}.`;
    return new HttpError(errorCode.code, this.formatDescription(errorContext, suffix), HttpErrorType.UnexpectedStatusCode, suffix);
  }

  public static unprocessableContent(errorContext: ErrorContext, callerMessage?: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpUnprocessableContent);
    const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Unprocessable Content";
    return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.UnprocessableContent, userMessage);
  }

  public static badRequest(errorContext: ErrorContext, callerMessage?: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpBadRequest);
    const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Bad Request";
    return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.BadRequest, userMessage);
  }

  public static unauthorizedAccess(errorContext: ErrorContext, callerMessage?: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpUnauthorized);
    const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Unauthorized";
    return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.Unauthorized, userMessage);
  }

  public static notFound(errorContext: ErrorContext, callerMessage?: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpNotFound);
    const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Not Found";
    return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.NotFound, userMessage);
  }

  public static conflict(errorContext: ErrorContext, callerMessage?: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpConflict);
    const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Conflict";
    return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.Conflict, userMessage);
  }

  public static forbidden(errorContext: ErrorContext, callerMessage?: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpForbidden);
    const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Forbidden";
    return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.Forbidden, userMessage);
  }

  public static internalServerError(errorContext: ErrorContext, callerMessage?: string): HttpError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.HttpInternalServerError);
    const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Internal Server Error";
    return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.InternalServerError, userMessage);
  }
}
