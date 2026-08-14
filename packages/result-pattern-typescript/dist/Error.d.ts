import { ErrorContext } from "./ErrorCode";
export declare enum ErrorType {
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
export declare class ResultError {
    static readonly None: ResultError;
    readonly code: string;
    readonly description: string;
    readonly type: ErrorType;
    readonly userMessage: string;
    constructor(code: string, description: string, type: ErrorType, userMessage?: string, exception?: unknown);
    toString(): string;
    static notFound(errorContext: ErrorContext): ResultError;
    static conflict(errorContext: ErrorContext): ResultError;
    static unauthorized(errorContext: ErrorContext): ResultError;
    static failure(errorContext: ErrorContext, descriptionSuffix?: string, exception?: unknown): ResultError;
    static cancelled(errorContext: ErrorContext): ResultError;
    protected static formatDescription(errorContext: ErrorContext, descriptionSuffix: string): string;
}
export { ResultError as Error };
