import { ErrorType, ResultError } from "./Error";
import { ValidationError } from "./ValidationError";

const DEFAULT_VALIDATION_FAILURE_MESSAGE = "Validation errors occurred, see validation errors for details.";

export class Result {
  public readonly isSuccess: boolean;
  public get isFailure(): boolean {
    return !this.isSuccess;
  }

  public readonly message: string;
  public readonly validationErrors: readonly ValidationError[];
  public readonly primaryError: ResultError;

  private constructor(
    isSuccess: boolean,
    message: string,
    validationErrors: readonly ValidationError[],
    primaryError: ResultError
  ) {
    validateResultState(isSuccess, message, validationErrors, primaryError);

    this.isSuccess = isSuccess;
    this.message = message;
    this.validationErrors = Object.freeze([...validationErrors]);
    this.primaryError = primaryError;
  }

  public static success(): Result {
    return new Result(true, "", [], ResultError.None);
  }

  public static validationFailure(validationErrors: readonly ValidationError[], message?: string): Result {
    if (!validationErrors) {
      throw new Error("validationErrors cannot be null.");
    }
    if (validationErrors.length === 0) {
      throw new Error("Validation failure must contain at least one validation error.");
    }

    return new Result(
      false,
      message && message.trim().length > 0 ? message : DEFAULT_VALIDATION_FAILURE_MESSAGE,
      validationErrors,
      validationErrors[0]
    );
  }

  public static failure(primaryError: ResultError, message?: string): Result {
    if (!primaryError) {
      throw new Error("primaryError cannot be null.");
    }
    return new Result(false, message ?? primaryError.userMessage, [], primaryError);
  }
}

export class ResultOf<TValue> {
  public readonly isSuccess: boolean;
  public get isFailure(): boolean {
    return !this.isSuccess;
  }

  public readonly message: string;
  public readonly validationErrors: readonly ValidationError[];
  public readonly primaryError: ResultError;
  private readonly _value?: TValue;

  private constructor(
    isSuccess: boolean,
    message: string,
    validationErrors: readonly ValidationError[],
    primaryError: ResultError,
    value?: TValue
  ) {
    validateResultState(isSuccess, message, validationErrors, primaryError);
    this.isSuccess = isSuccess;
    this.message = message;
    this.validationErrors = Object.freeze([...validationErrors]);
    this.primaryError = primaryError;
    this._value = value;
  }

  public get value(): TValue {
    if (this.isFailure) {
      throw new Error("Cannot access value of a failed result.");
    }
    return this._value as TValue;
  }

  public static success<TValue>(value: NonNullable<TValue>): ResultOf<TValue> {
    if (value === undefined || value === null) {
      throw new Error("value cannot be null.");
    }
    return new ResultOf<TValue>(true, "", [], ResultError.None, value);
  }

  public static validationFailure<TValue>(validationErrors: readonly ValidationError[], message?: string): ResultOf<TValue> {
    if (!validationErrors) {
      throw new Error("validationErrors cannot be null.");
    }
    if (validationErrors.length === 0) {
      throw new Error("Validation failure must contain at least one validation error.");
    }

    return new ResultOf<TValue>(
      false,
      message && message.trim().length > 0 ? message : DEFAULT_VALIDATION_FAILURE_MESSAGE,
      validationErrors,
      validationErrors[0]
    );
  }

  public static failure<TValue>(primaryError: ResultError, message?: string): ResultOf<TValue> {
    if (!primaryError) {
      throw new Error("primaryError cannot be null.");
    }
    return new ResultOf<TValue>(false, message ?? primaryError.userMessage, [], primaryError);
  }

  public static fromFailure<TValue>(result: Result | ResultOf<unknown>): ResultOf<TValue> {
    if (result.isSuccess) {
      throw new Error("Cannot create ResultOf<T> from a successful Result without a value.");
    }
    return new ResultOf<TValue>(false, result.message, result.validationErrors, result.primaryError);
  }
}

function validateResultState(
  isSuccess: boolean,
  message: string,
  validationErrors: readonly ValidationError[],
  primaryError: ResultError
): void {
  if (message === undefined || message === null) {
    throw new Error("message cannot be null.");
  }
  if (!validationErrors) {
    throw new Error("validationErrors cannot be null.");
  }
  if (!primaryError) {
    throw new Error("primaryError cannot be null.");
  }

  if (isSuccess) {
    if (primaryError.type !== ErrorType.None) {
      throw new Error("Success result cannot contain errors.");
    }
    if (validationErrors.length > 0) {
      throw new Error("Success result cannot contain validation errors.");
    }
    return;
  }

  if (primaryError.type === ErrorType.None) {
    throw new Error("Failure result must contain a primary error.");
  }

  if (primaryError.type === ErrorType.Validation) {
    if (!(primaryError instanceof ValidationError)) {
      throw new Error("Validation failure result must have an error of type ValidationError.");
    }

    if (validationErrors.length === 0) {
      throw new Error("Validation failure result must contain a collection of validation errors.");
    }

    if (!validationErrors.includes(primaryError)) {
      throw new Error("Validation errors must contain the primary validation error.");
    }
    return;
  }

  if (validationErrors.length > 0) {
    throw new Error("Non-validation failure result cannot contain validation errors.");
  }
}
