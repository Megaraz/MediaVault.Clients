export type ErrorKind =
  | "failure"
  | "validation"
  | "not-found"
  | "conflict"
  | "unauthorized"
  | "forbidden"
  | "cancelled"
  | "network"
  | "rate-limited";

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

export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
export const VALIDATION_ERROR_MESSAGE = "Please check the highlighted fields.";
export const CANCELLED_MESSAGE = "The operation was cancelled.";
export const NETWORK_ERROR_MESSAGE = "Unable to reach the server. Check your connection and try again.";

const PUBLIC_CODE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const PUBLIC_FIELD = /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/;
const MAX_MESSAGE_LENGTH = 500;

export function success(): Result<void>;
export function success<TValue>(value: NonNullable<TValue>): Result<TValue>;
export function success<TValue>(...args: [] | [NonNullable<TValue>]): Result<TValue | void> {
  if (args.length === 0) {
    return Object.freeze({ ok: true, value: undefined });
  }

  const [value] = args;
  if (value === null || value === undefined) {
    throw new TypeError("A successful result requires a value.");
  }

  return Object.freeze({ ok: true, value }) as Success<TValue>;
}

export function failure<TValue = never>(input: ErrorInput): Result<TValue> {
  const error = createError(input);
  return freezeFailure(error, []);
}

export function validationFailure<TValue = never>(
  errors: readonly FieldError[],
  message = VALIDATION_ERROR_MESSAGE,
): Result<TValue> {
  if (errors.length === 0) {
    throw new TypeError("A validation failure requires at least one field error.");
  }

  const validationErrors = Object.freeze(errors.map((error) => createFieldError(error.field, error.message)));
  const resultError = createResultError("validation", "Validation.Failed", message);
  return freezeFailure(resultError, validationErrors);
}

export function unexpectedFailure<TValue = never>(): Result<TValue> {
  return failure({ kind: "failure", code: "Client.Unexpected", message: GENERIC_ERROR_MESSAGE });
}

export function cancelled<TValue = never>(): Result<TValue> {
  return failure({ kind: "cancelled", code: "Client.Cancelled", message: CANCELLED_MESSAGE });
}

export function networkFailure<TValue = never>(): Result<TValue> {
  return failure({ kind: "network", code: "Client.Network", message: NETWORK_ERROR_MESSAGE });
}

export function map<TValue, TOutput>(
  result: Result<TValue>,
  transform: (value: TValue) => NonNullable<TOutput>,
): Result<TOutput> {
  return result.ok ? success(transform(result.value)) : result;
}

export async function mapAsync<TValue, TOutput>(
  result: Result<TValue>,
  transform: (value: TValue) => Promise<NonNullable<TOutput>>,
): Promise<Result<TOutput>> {
  return result.ok ? success(await transform(result.value)) : result;
}

export function flatMap<TValue, TOutput>(
  result: Result<TValue>,
  transform: (value: TValue) => Result<TOutput>,
): Result<TOutput> {
  return result.ok ? transform(result.value) : result;
}

export function match<TValue, TOutput>(result: Result<TValue>, matcher: ResultMatcher<TValue, TOutput>): TOutput {
  return result.ok
    ? matcher.success(result.value)
    : matcher.failure(result.error, result.validationErrors);
}

export function valueOr<TValue>(result: Result<TValue>, fallback: TValue): TValue {
  return result.ok ? result.value : fallback;
}

export function errorsByField(result: Result<unknown>): Readonly<Record<string, readonly string[]>> {
  if (result.ok || result.validationErrors.length === 0) {
    return Object.freeze({});
  }

  const grouped = Object.create(null) as Record<string, string[]>;
  for (const error of result.validationErrors) {
    if (error.field === null) continue;
    (grouped[error.field] ??= []).push(error.message);
  }

  return Object.freeze(
    Object.fromEntries(Object.entries(grouped).map(([field, messages]) => [field, Object.freeze(messages)])),
  );
}

export function createFieldError(field: string | null, message: string): FieldError {
  const normalizedField = field === null ? null : field.trim();
  if (normalizedField !== null && !PUBLIC_FIELD.test(normalizedField)) {
    throw new TypeError("A field name must be a safe public property path.");
  }

  return Object.freeze({ field: normalizedField, message: validateMessage(message) });
}

export function isPublicErrorCode(value: unknown): value is string {
  return typeof value === "string" && PUBLIC_CODE.test(value);
}

export function isSafeMessage(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= MAX_MESSAGE_LENGTH && !/[\u0000-\u001f\u007f]/.test(normalized);
}

function createError(input: ErrorInput): ResultError {
  return createResultError(input.kind, input.code, input.message);
}

function createResultError(kind: ErrorKind, code: string, message: string): ResultError {
  if (!isPublicErrorCode(code)) {
    throw new TypeError("An error code must be a short public identifier.");
  }

  return Object.freeze({ kind, code, message: validateMessage(message) });
}

function validateMessage(message: string): string {
  if (!isSafeMessage(message)) {
    throw new TypeError("A user message must be non-empty, short, and free of control characters.");
  }
  return message.trim();
}

function freezeFailure(error: ResultError, validationErrors: readonly FieldError[]): Failure {
  const frozenErrors = Object.freeze([...validationErrors]);
  return Object.freeze({ ok: false, error, validationErrors: frozenErrors });
}
