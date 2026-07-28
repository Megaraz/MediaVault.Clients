export declare enum OperationType {
    Custom = 0,
    Create = 1,
    Get = 2,
    GetCollection = 3,
    Update = 4,
    Delete = 5,
    Login = 100
}
export declare enum ErrorReasonCode {
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
export declare function toReasonCodePart(reason: ErrorReasonCode): string;
export interface ErrorContext {
    layer: string;
    serviceName: string;
    methodName: string;
    operation: OperationType;
    entityName: string;
    fieldName?: string;
}
export declare class ErrorCode {
    readonly operation: OperationType;
    readonly nameOfEntity: string;
    readonly reason: ErrorReasonCode;
    private constructor();
    get code(): string;
    static for(errorContext: ErrorContext, reason: ErrorReasonCode): ErrorCode;
}
