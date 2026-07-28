import { ResultError } from "./Error";
import { ValidationError } from "./ValidationError";
export declare class Result {
    readonly isSuccess: boolean;
    get isFailure(): boolean;
    readonly message: string;
    readonly validationErrors: readonly ValidationError[];
    readonly primaryError: ResultError;
    private constructor();
    static success(): Result;
    static validationFailure(validationErrors: readonly ValidationError[], message?: string): Result;
    static failure(primaryError: ResultError, message?: string): Result;
}
export declare class ResultOf<TValue> {
    readonly isSuccess: boolean;
    get isFailure(): boolean;
    readonly message: string;
    readonly validationErrors: readonly ValidationError[];
    readonly primaryError: ResultError;
    private readonly _value?;
    private constructor();
    get value(): TValue;
    static success<TValue>(value: NonNullable<TValue>): ResultOf<TValue>;
    static validationFailure<TValue>(validationErrors: readonly ValidationError[], message?: string): ResultOf<TValue>;
    static failure<TValue>(primaryError: ResultError, message?: string): ResultOf<TValue>;
    static fromFailure<TValue>(result: Result | ResultOf<unknown>): ResultOf<TValue>;
}
