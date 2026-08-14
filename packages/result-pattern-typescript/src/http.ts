import {
  CANCELLED_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  Result,
  cancelled,
  failure,
  isPublicErrorCode,
  isSafeMessage,
  networkFailure,
  success,
  unexpectedFailure,
  validationFailure,
} from "./client";

export interface HttpResultOptions<TValue> {
  readonly decode?: (body: unknown) => NonNullable<TValue>;
}

interface ErrorBody {
  readonly message: string;
  readonly code: string;
}

interface ValidationBody {
  readonly message?: string;
  readonly validationErrors: readonly { readonly field?: string | null; readonly message: string }[];
}

const MAX_RESPONSE_BODY_LENGTH = 64 * 1024;

export async function resultFromResponse<TValue>(
  response: Response,
  options: HttpResultOptions<TValue> = {},
): Promise<Result<TValue>> {
  if (!response.ok) return failureFromResponse(response);

  const body = await readJson(response);
  if (!body.ok) return unexpectedFailure();

  try {
    const value = options.decode ? options.decode(body.value) : (body.value as NonNullable<TValue>);
    return success(value);
  } catch {
    return unexpectedFailure();
  }
}

export async function emptyResultFromResponse(response: Response): Promise<Result<void>> {
  return response.ok ? success() : failureFromResponse(response);
}

export function resultFromRequestError(error: unknown): Result<never> {
  if (isAbortError(error)) return cancelled();
  return networkFailure();
}

async function failureFromResponse<TValue>(response: Response): Promise<Result<TValue>> {
  if (response.status === 422) {
    const body = await readJson(response);
    if (body.ok && isValidationBody(body.value)) {
      const errors = body.value.validationErrors.slice(0, 50).map((error) => ({
        field: safeField(error.field),
        message: error.message.trim(),
      }));
      const message = isSafeMessage(body.value.message) ? body.value.message.trim() : undefined;
      return validationFailure(errors, message);
    }
    return failure({ kind: "failure", code: "Validation.InvalidResponse", message: "Please review your input." });
  }

  const kind = kindForStatus(response.status);
  const fallback = messageForStatus(response.status);

  if (response.status >= 500 || response.status === 401 || response.status === 403) {
    return failure({ kind, code: `Http.${response.status}`, message: fallback });
  }

  const body = await readJson(response);
  if (body.ok && isErrorBody(body.value)) {
    return failure({ kind, code: body.value.code, message: body.value.message.trim() });
  }

  return failure({ kind, code: `Http.${response.status}`, message: fallback });
}

async function readJson(response: Response): Promise<{ readonly ok: true; readonly value: unknown } | { readonly ok: false }> {
  try {
    const text = await response.text();
    if (text.length === 0 || text.length > MAX_RESPONSE_BODY_LENGTH) return { ok: false };
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

function isErrorBody(value: unknown): value is ErrorBody {
  if (!isRecord(value)) return false;
  return isSafeMessage(value.message) && isPublicErrorCode(value.code);
}

function isValidationBody(value: unknown): value is ValidationBody {
  if (!isRecord(value) || !Array.isArray(value.validationErrors) || value.validationErrors.length === 0) return false;
  if (value.message !== undefined && !isSafeMessage(value.message)) return false;

  return value.validationErrors.every((item) => {
    if (!isRecord(item) || !isSafeMessage(item.message)) return false;
    return item.field === undefined || item.field === null || safeField(item.field) !== null;
  });
}

function safeField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const field = value.trim();
  return /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(field) ? field : null;
}

function kindForStatus(status: number) {
  switch (status) {
    case 401: return "unauthorized" as const;
    case 403: return "forbidden" as const;
    case 404: return "not-found" as const;
    case 409: return "conflict" as const;
    case 429: return "rate-limited" as const;
    default: return "failure" as const;
  }
}

function messageForStatus(status: number): string {
  switch (status) {
    case 401: return "Please sign in to continue.";
    case 403: return "You do not have permission to perform this action.";
    case 404: return "The requested item was not found.";
    case 409: return "The request conflicts with the current state.";
    case 429: return "Too many requests. Please wait and try again.";
    default: return GENERIC_ERROR_MESSAGE;
  }
}

function isAbortError(error: unknown): boolean {
  return isRecord(error) && error.name === "AbortError";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export { CANCELLED_MESSAGE, GENERIC_ERROR_MESSAGE, NETWORK_ERROR_MESSAGE };
