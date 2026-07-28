import { ErrorContext } from "./ErrorCode";
import { ResultError } from "./Error";
export declare enum HttpErrorType {
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
export declare class HttpError extends ResultError {
    readonly httpErrorType: HttpErrorType;
    private constructor();
    static custom(errorContext: ErrorContext, customDescriptionSuffix: string): HttpError;
    static transportFailure(errorContext: ErrorContext, exception?: unknown): HttpError;
    static tooManyRequests(errorContext: ErrorContext, callerMessage?: string): HttpError;
    static malformedResponse(errorContext: ErrorContext, exception?: unknown, detail?: string): HttpError;
    static unexpectedStatusCode(errorContext: ErrorContext, statusCode: number, statusText?: string): HttpError;
    static unprocessableContent(errorContext: ErrorContext, callerMessage?: string): HttpError;
    static badRequest(errorContext: ErrorContext, callerMessage?: string): HttpError;
    static unauthorizedAccess(errorContext: ErrorContext, callerMessage?: string): HttpError;
    static notFound(errorContext: ErrorContext, callerMessage?: string): HttpError;
    static conflict(errorContext: ErrorContext, callerMessage?: string): HttpError;
    static forbidden(errorContext: ErrorContext, callerMessage?: string): HttpError;
    static internalServerError(errorContext: ErrorContext, callerMessage?: string): HttpError;
}
