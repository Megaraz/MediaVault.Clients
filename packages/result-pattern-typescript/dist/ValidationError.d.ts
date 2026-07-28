import { ErrorContext } from "./ErrorCode";
import { ResultError } from "./Error";
export declare enum ValidationErrorType {
    Custom = 0,
    Required = 1,
    InvalidFormat = 2,
    OutOfRange = 3,
    NonMatchingValues = 4,
    AlreadyExists = 5,
    TooShort = 6,
    TooLong = 7
}
export declare class ValidationError extends ResultError {
    readonly validationErrorType: ValidationErrorType;
    readonly fieldName?: string;
    private constructor();
    static alreadyExists(errorContext: ErrorContext): ValidationError;
    static invalidFormat(errorContext: ErrorContext, expectedFormat: string): ValidationError;
    static required(errorContext: ErrorContext): ValidationError;
    static tooLong(errorContext: ErrorContext, range: string): ValidationError;
    static outOfRange(errorContext: ErrorContext, range: string): ValidationError;
    static tooShort(errorContext: ErrorContext, range: string): ValidationError;
    static nonMatchingValues(errorContext: ErrorContext, confirmFieldName?: string): ValidationError;
    static custom(errorContext: ErrorContext): ValidationError;
}
