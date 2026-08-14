export type ErrorKind = "failure" | "validation" | "not-found" | "conflict" | "unauthorized" | "forbidden" | "cancelled" | "network" | "rate-limited";
export interface ResultError {
    readonly kind: ErrorKind;
    readonly code: string;
    readonly message: string;
}
export interface FieldError {
    readonly field: string | null;
    readonly message: string;
}
export interface Success<TValue> {
    readonly ok: true;
    readonly value: TValue;
}
export interface Failure {
    readonly ok: false;
    readonly error: ResultError;
    readonly validationErrors: readonly FieldError[];
}
export type Result<TValue> = Success<TValue> | Failure;
export interface ErrorInput {
    readonly kind: Exclude<ErrorKind, "validation">;
    readonly code: string;
    readonly message: string;
}
export interface ResultMatcher<TValue, TOutput> {
    readonly success: (value: TValue) => TOutput;
    readonly failure: (error: ResultError, validationErrors: readonly FieldError[]) => TOutput;
}
export declare const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
export declare const VALIDATION_ERROR_MESSAGE = "Please check the highlighted fields.";
export declare const CANCELLED_MESSAGE = "The operation was cancelled.";
export declare const NETWORK_ERROR_MESSAGE = "Unable to reach the server. Check your connection and try again.";
export declare function success(): Result<void>;
export declare function success<TValue>(value: NonNullable<TValue>): Result<TValue>;
export declare function failure<TValue = never>(input: ErrorInput): Result<TValue>;
export declare function validationFailure<TValue = never>(errors: readonly FieldError[], message?: string): Result<TValue>;
export declare function unexpectedFailure<TValue = never>(): Result<TValue>;
export declare function cancelled<TValue = never>(): Result<TValue>;
export declare function networkFailure<TValue = never>(): Result<TValue>;
export declare function map<TValue, TOutput>(result: Result<TValue>, transform: (value: TValue) => NonNullable<TOutput>): Result<TOutput>;
export declare function mapAsync<TValue, TOutput>(result: Result<TValue>, transform: (value: TValue) => Promise<NonNullable<TOutput>>): Promise<Result<TOutput>>;
export declare function flatMap<TValue, TOutput>(result: Result<TValue>, transform: (value: TValue) => Result<TOutput>): Result<TOutput>;
export declare function match<TValue, TOutput>(result: Result<TValue>, matcher: ResultMatcher<TValue, TOutput>): TOutput;
export declare function valueOr<TValue>(result: Result<TValue>, fallback: TValue): TValue;
export declare function errorsByField(result: Result<unknown>): Readonly<Record<string, readonly string[]>>;
export declare function createFieldError(field: string | null, message: string): FieldError;
export declare function isPublicErrorCode(value: unknown): value is string;
export declare function isSafeMessage(value: unknown): value is string;
