export enum OperationType {
  Custom = 0,
  Create = 1,
  Get = 2,
  GetCollection = 3,
  Update = 4,
  Delete = 5,
  Login = 100
}

export enum ErrorReasonCode {
  Custom = 0,
  ValidationRequired = 100,
  ValidationInvalidFormat = 101,
  ValidationOutOfRange = 102,
  ValidationNonMatchingValues = 103,
  ValidationTooShort = 104,
  ValidationTooLong = 105,
  ValidationAlreadyExists = 106,
  DatabaseSaveChangesFailure = 200,
  DatabaseConcurrencyFailure = 201,
  DatabaseQueryFailure = 202,
  DatabaseUnexpectedFailure = 203,
  OperationCancelled = 250,
  GeneralFailure = 300,
  GeneralNotFound = 301,
  GeneralConflict = 302,
  GeneralUnauthorized = 303,
  GeneralForbidden = 304,
  UserLoginFailure = 399,
  HttpBadRequest = 400,
  HttpUnauthorized = 401,
  HttpForbidden = 403,
  HttpNotFound = 404,
  HttpMethodNotAllowed = 405,
  HttpRequestTimeout = 408,
  HttpConflict = 409,
  HttpUnprocessableContent = 422,
  HttpTooManyRequests = 429,
  HttpInternalServerError = 500,
  HttpBadGateway = 502,
  HttpServiceUnavailable = 503,
  HttpGatewayTimeout = 504,
  HttpTransportFailure = 550,
  HttpMalformedResponse = 551,
  HttpUnexpectedStatusCode = 552
}

export function toReasonCodePart(reason: ErrorReasonCode): string {
  switch (reason) {
    case ErrorReasonCode.Custom:
      return "Custom";
    case ErrorReasonCode.ValidationRequired:
      return "Required";
    case ErrorReasonCode.ValidationInvalidFormat:
      return "InvalidFormat";
    case ErrorReasonCode.ValidationOutOfRange:
      return "OutOfRange";
    case ErrorReasonCode.ValidationNonMatchingValues:
      return "NonMatchingValues";
    case ErrorReasonCode.ValidationTooShort:
      return "TooShort";
    case ErrorReasonCode.ValidationTooLong:
      return "TooLong";
    case ErrorReasonCode.ValidationAlreadyExists:
      return "AlreadyExists";
    case ErrorReasonCode.DatabaseSaveChangesFailure:
      return "DbSaveChangesFailure";
    case ErrorReasonCode.DatabaseConcurrencyFailure:
      return "DbConcurrencyFailure";
    case ErrorReasonCode.DatabaseQueryFailure:
      return "DbQueryFailure";
    case ErrorReasonCode.DatabaseUnexpectedFailure:
      return "DbUnexpectedFailure";
    case ErrorReasonCode.OperationCancelled:
      return "Cancelled";
    case ErrorReasonCode.GeneralFailure:
      return "Failure";
    case ErrorReasonCode.GeneralNotFound:
      return "NotFound";
    case ErrorReasonCode.GeneralConflict:
      return "Conflict";
    case ErrorReasonCode.GeneralUnauthorized:
      return "Unauthorized";
    case ErrorReasonCode.GeneralForbidden:
      return "Forbidden";
    case ErrorReasonCode.UserLoginFailure:
      return "LoginFailure";
    case ErrorReasonCode.HttpBadRequest:
      return "BadRequest";
    case ErrorReasonCode.HttpUnauthorized:
      return "Unauthorized";
    case ErrorReasonCode.HttpForbidden:
      return "Forbidden";
    case ErrorReasonCode.HttpNotFound:
      return "NotFound";
    case ErrorReasonCode.HttpMethodNotAllowed:
      return "MethodNotAllowed";
    case ErrorReasonCode.HttpRequestTimeout:
      return "RequestTimeout";
    case ErrorReasonCode.HttpConflict:
      return "Conflict";
    case ErrorReasonCode.HttpUnprocessableContent:
      return "UnprocessableContent";
    case ErrorReasonCode.HttpInternalServerError:
      return "InternalServerError";
    case ErrorReasonCode.HttpBadGateway:
      return "BadGateway";
    case ErrorReasonCode.HttpServiceUnavailable:
      return "ServiceUnavailable";
    case ErrorReasonCode.HttpGatewayTimeout:
      return "GatewayTimeout";
    case ErrorReasonCode.HttpTooManyRequests:
      return "TooManyRequests";
    case ErrorReasonCode.HttpTransportFailure:
      return "TransportFailure";
    case ErrorReasonCode.HttpMalformedResponse:
      return "MalformedResponse";
    case ErrorReasonCode.HttpUnexpectedStatusCode:
      return "UnexpectedStatusCode";
    default:
      return "Unknown";
  }
}

export interface ErrorContext {
  layer: string;
  serviceName: string;
  methodName: string;
  operation: OperationType;
  entityName: string;
  fieldName?: string;
}

export class ErrorCode {
  public readonly operation: OperationType;
  public readonly nameOfEntity: string;
  public readonly reason: ErrorReasonCode;

  private constructor(operation: OperationType, nameOfEntity: string, reason: ErrorReasonCode) {
    this.operation = operation;
    this.nameOfEntity = nameOfEntity;
    this.reason = reason;
  }

  public get code(): string {
    return `${OperationType[this.operation]}.${this.nameOfEntity}.${toReasonCodePart(this.reason)}`;
  }

  public static for(errorContext: ErrorContext, reason: ErrorReasonCode): ErrorCode {
    return new ErrorCode(errorContext.operation, errorContext.entityName, reason);
  }
}
