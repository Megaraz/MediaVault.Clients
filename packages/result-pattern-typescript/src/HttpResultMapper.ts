import { ErrorType, ResultError } from "./Error";
import { HttpError, HttpErrorType } from "./HttpError";
import { ErrorResponseBody, MappedHttpResponse, ValidationErrorItem, ValidationErrorResponseBody } from "./MappedHttpResponse";
import { Result, ResultOf } from "./Result";

type ResultLike = Pick<Result, "message" | "validationErrors" | "primaryError" | "isSuccess">;

function mapFailure(result: ResultLike): MappedHttpResponse {
  const primaryError = result.primaryError;
  const message = result.message;
  const validationErrorItems: ValidationErrorItem[] = result.validationErrors.map((x) => ({
    field: x.fieldName,
    message: x.userMessage
  }));

  const [statusCode, body] = buildFailureResponse(message, primaryError, validationErrorItems);
  return { statusCode, body };
}

function buildFailureResponse(
  message: string,
  primaryError: ResultError,
  validationErrorItems: readonly ValidationErrorItem[]
): [number, ErrorResponseBody | ValidationErrorResponseBody] {
  switch (primaryError.type) {
    case ErrorType.Validation:
      return [422, { message, validationErrors: validationErrorItems }];
    case ErrorType.NotFound:
      return [404, { message, code: primaryError.code }];
    case ErrorType.Conflict:
      return [409, { message, code: primaryError.code }];
    case ErrorType.Unauthorized:
      return [401, { message, code: primaryError.code }];
    case ErrorType.Forbidden:
      return [403, { message, code: primaryError.code }];
    case ErrorType.Failure:
    case ErrorType.Database:
      return [500, { message, code: primaryError.code }];
    case ErrorType.Cancelled:
      return [503, { message, code: primaryError.code }];
    case ErrorType.HttpError:
      return mapHttpErrorFailure(message, primaryError);
    default:
      return [400, { message, code: primaryError.code }];
  }
}

function mapHttpErrorFailure(message: string, error: ResultError): [number, ErrorResponseBody] {
  if (!(error instanceof HttpError)) {
    return [502, { message, code: error.code }];
  }

  let statusCode = 502;
  switch (error.httpErrorType) {
    case HttpErrorType.BadRequest:
      statusCode = 400;
      break;
    case HttpErrorType.Unauthorized:
      statusCode = 401;
      break;
    case HttpErrorType.Forbidden:
      statusCode = 403;
      break;
    case HttpErrorType.NotFound:
      statusCode = 404;
      break;
    case HttpErrorType.Conflict:
      statusCode = 409;
      break;
    case HttpErrorType.UnprocessableContent:
      statusCode = 422;
      break;
    case HttpErrorType.TooManyRequests:
      statusCode = 429;
      break;
    case HttpErrorType.InternalServerError:
    case HttpErrorType.MalformedResponse:
    case HttpErrorType.UnexpectedStatusCode:
      statusCode = 502;
      break;
    case HttpErrorType.TransportFailure:
      statusCode = 503;
      break;
    default:
      statusCode = 502;
      break;
  }

  return [statusCode, { message, code: error.code }];
}

export function toHttpResponse<TValue>(result: ResultOf<TValue>): MappedHttpResponse;
export function toHttpResponse(result: Result): MappedHttpResponse;
export function toHttpResponse<TValue>(result: Result | ResultOf<TValue>): MappedHttpResponse {
  if (result.isSuccess) {
    if (result instanceof ResultOf) {
      return { statusCode: 200, body: result.value };
    }
    return { statusCode: 200 };
  }
  return mapFailure(result);
}

export function toNoContentResponse(result: Result): MappedHttpResponse {
  if (result.isSuccess) {
    return { statusCode: 204 };
  }
  return mapFailure(result);
}

export function toCreatedResponse<TValue>(result: ResultOf<TValue>, location?: string): MappedHttpResponse {
  if (result.isSuccess) {
    return { statusCode: 201, body: result.value, location };
  }
  return mapFailure(result);
}
