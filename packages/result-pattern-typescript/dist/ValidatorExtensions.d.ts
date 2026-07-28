import { ErrorContext } from "./ErrorCode";
import { ValidationError } from "./ValidationError";
export type ValidationCheck = {
    readonly failed: true;
    readonly error: ValidationError;
} | {
    readonly failed: false;
    readonly error?: never;
};
export interface ValidationCollectionCheck {
    readonly failed: boolean;
    readonly errors: readonly ValidationError[];
}
export declare function isNotValidId<TKey>(id: TKey, errorContext: ErrorContext): ValidationCheck;
export declare function isNull<TValue>(value: TValue | null | undefined, errorContext: ErrorContext): ValidationCheck;
export declare function requiredFieldsAreNullOrWhiteSpace(requiredValues: ReadonlyArray<{
    fieldName: string;
    value?: string | null;
}>, errorContext: ErrorContext): ValidationCollectionCheck;
export declare function isNullOrWhiteSpace(value: string | null | undefined, fieldName: string, errorContext: ErrorContext): ValidationCheck;
export declare function isNullOrWhiteSpaceFromContext(value: string | null | undefined, errorContext: ErrorContext): ValidationCheck;
export declare function isTooLow(value: number, minValue: number, errorContext: ErrorContext): ValidationCheck;
export declare function doesNotMatch(value1: string, value2: string, fieldName: string, confirmFieldName: string, errorContext: ErrorContext): ValidationCheck;
