import { ErrorContext } from "./ErrorCode";
import { HttpError } from "./HttpError";
import { Result, ResultOf } from "./Result";

export async function mapHttpResponseToResult<TValue>(
  response: Response | null | undefined,
  errorContext: ErrorContext
): Promise<ResultOf<TValue>> {
  if (!response) {
    return ResultOf.failure(HttpError.transportFailure(errorContext));
  }

  if (!response.ok) {
    const failureMessage = await getFailureMessage(response);
    return createHttpFailureResultOf<TValue>(response.status, response.statusText, errorContext, failureMessage);
  }

  const responseBody = await readResponseBody(response);
  if (!responseBody || responseBody.trim().length === 0) {
    return ResultOf.failure(
      HttpError.malformedResponse(
        errorContext,
        undefined,
        `The external service returned ${response.status} (${response.statusText}) without the expected response body.`
      )
    );
  }

  if (!hasJsonContentType(response)) {
    return ResultOf.failure(
      HttpError.malformedResponse(
        errorContext,
        undefined,
        `The external service returned ${response.status} (${response.statusText}) with unsupported content type '${response.headers.get("content-type") ?? "unknown"}'.`
      )
    );
  }

  try {
    const value = JSON.parse(responseBody) as TValue | null;
    if (value === null) {
      return ResultOf.failure(
        HttpError.malformedResponse(
          errorContext,
          undefined,
          `The external service returned ${response.status} (${response.statusText}) with an empty or invalid JSON body.`
        )
      );
    }
    return ResultOf.success(value as NonNullable<TValue>);
  } catch (exception) {
    return ResultOf.failure(HttpError.malformedResponse(errorContext, exception, "The external service returned malformed JSON."));
  }
}

export async function mapHttpResponseToResultWithoutValue(
  response: Response | null | undefined,
  errorContext: ErrorContext
): Promise<Result> {
  if (!response) {
    return Result.failure(HttpError.transportFailure(errorContext));
  }

  if (response.ok) {
    return Result.success();
  }

  const failureMessage = await getFailureMessage(response);
  return createHttpFailureResult(response.status, response.statusText, errorContext, failureMessage);
}

function createHttpFailureResultOf<TValue>(
  statusCode: number,
  statusText: string,
  errorContext: ErrorContext,
  callerMessage: string
): ResultOf<TValue> {
  return ResultOf.failure(mapHttpError(statusCode, statusText, errorContext, callerMessage));
}

function createHttpFailureResult(
  statusCode: number,
  statusText: string,
  errorContext: ErrorContext,
  callerMessage: string
): Result {
  return Result.failure(mapHttpError(statusCode, statusText, errorContext, callerMessage));
}

function mapHttpError(statusCode: number, statusText: string, errorContext: ErrorContext, callerMessage?: string): HttpError {
  switch (statusCode) {
    case 404:
      return HttpError.notFound(errorContext, callerMessage);
    case 400:
      return HttpError.badRequest(errorContext, callerMessage);
    case 422:
      return HttpError.unprocessableContent(errorContext, callerMessage);
    case 409:
      return HttpError.conflict(errorContext, callerMessage);
    case 401:
      return HttpError.unauthorizedAccess(errorContext, callerMessage);
    case 403:
      return HttpError.forbidden(errorContext, callerMessage);
    case 500:
      return HttpError.internalServerError(errorContext, callerMessage);
    case 429:
      return HttpError.tooManyRequests(errorContext, callerMessage);
    default:
      return HttpError.unexpectedStatusCode(errorContext, statusCode, statusText);
  }
}

async function getFailureMessage(response: Response): Promise<string> {
  const responseMessage = await tryGetResponseMessage(response);
  return buildFailureMessage(responseMessage, getDefaultFailureMessage(response.status), response.statusText);
}

function buildFailureMessage(responseMessage: string | null, defaultMessage: string, reasonPhrase: string): string {
  return firstNonEmpty(responseMessage, defaultMessage, reasonPhrase, "An error occurred while calling the external service.");
}

function getDefaultFailureMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "The external service rejected the request.";
    case 401:
      return "The external service requires authentication.";
    case 403:
      return "The external service refused the request.";
    case 404:
      return "The requested resource was not found in the external service.";
    case 409:
      return "The external service reported a conflict.";
    case 422:
      return "The external service could not process the request.";
    case 500:
      return "The external service encountered an internal server error.";
    case 429:
      return "The external service has rate-limited this request.";
    default:
      return `The external service returned an unexpected HTTP status code ${statusCode}.`;
  }
}

function hasJsonContentType(response: Response): boolean {
  const mediaType = response.headers.get("content-type");
  return !mediaType || mediaType.trim().length === 0 || mediaType.toLowerCase().includes("json");
}

async function readResponseBody(response: Response): Promise<string | null> {
  const text = await response.text();
  return text.length > 0 ? text : null;
}

async function tryGetResponseMessage(response: Response): Promise<string | null> {
  const responseBody = await readResponseBody(response);
  if (!responseBody || responseBody.trim().length === 0) {
    return null;
  }

  try {
    const body = JSON.parse(responseBody) as Record<string, unknown>;

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return responseBody.trim();
    }

    for (const key of ["message", "detail", "title", "error", "error_description"]) {
      const value = body[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }

    const errors = extractErrors(body["errors"]);
    if (errors && errors.trim().length > 0) {
      return errors;
    }
  } catch {
    return responseBody.trim();
  }

  return responseBody.trim();
}

function extractErrors(errors: unknown): string | null {
  if (Array.isArray(errors)) {
    const messages = errors.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    return messages.join(" ");
  }

  if (errors && typeof errors === "object") {
    const objectValues = Object.values(errors as Record<string, unknown>);
    const messages: string[] = [];
    for (const item of objectValues) {
      if (Array.isArray(item)) {
        for (const value of item) {
          if (typeof value === "string" && value.trim().length > 0) {
            messages.push(value);
          }
        }
      }
    }
    return messages.join(" ");
  }

  return null;
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (value && value.trim().length > 0) {
      return value;
    }
  }
  return "An error occurred while calling the external service.";
}
