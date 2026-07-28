"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.ErrorReasonCode = exports.OperationType = void 0;
exports.toReasonCodePart = toReasonCodePart;
var OperationType;
(function (OperationType) {
    OperationType[OperationType["Custom"] = 0] = "Custom";
    OperationType[OperationType["Create"] = 1] = "Create";
    OperationType[OperationType["Get"] = 2] = "Get";
    OperationType[OperationType["GetCollection"] = 3] = "GetCollection";
    OperationType[OperationType["Update"] = 4] = "Update";
    OperationType[OperationType["Delete"] = 5] = "Delete";
    OperationType[OperationType["Login"] = 100] = "Login";
})(OperationType || (exports.OperationType = OperationType = {}));
var ErrorReasonCode;
(function (ErrorReasonCode) {
    ErrorReasonCode[ErrorReasonCode["Custom"] = 0] = "Custom";
    ErrorReasonCode[ErrorReasonCode["ValidationRequired"] = 100] = "ValidationRequired";
    ErrorReasonCode[ErrorReasonCode["ValidationInvalidFormat"] = 101] = "ValidationInvalidFormat";
    ErrorReasonCode[ErrorReasonCode["ValidationOutOfRange"] = 102] = "ValidationOutOfRange";
    ErrorReasonCode[ErrorReasonCode["ValidationNonMatchingValues"] = 103] = "ValidationNonMatchingValues";
    ErrorReasonCode[ErrorReasonCode["ValidationTooShort"] = 104] = "ValidationTooShort";
    ErrorReasonCode[ErrorReasonCode["ValidationTooLong"] = 105] = "ValidationTooLong";
    ErrorReasonCode[ErrorReasonCode["ValidationAlreadyExists"] = 106] = "ValidationAlreadyExists";
    ErrorReasonCode[ErrorReasonCode["DatabaseSaveChangesFailure"] = 200] = "DatabaseSaveChangesFailure";
    ErrorReasonCode[ErrorReasonCode["DatabaseConcurrencyFailure"] = 201] = "DatabaseConcurrencyFailure";
    ErrorReasonCode[ErrorReasonCode["DatabaseQueryFailure"] = 202] = "DatabaseQueryFailure";
    ErrorReasonCode[ErrorReasonCode["DatabaseUnexpectedFailure"] = 203] = "DatabaseUnexpectedFailure";
    ErrorReasonCode[ErrorReasonCode["OperationCancelled"] = 250] = "OperationCancelled";
    ErrorReasonCode[ErrorReasonCode["GeneralFailure"] = 300] = "GeneralFailure";
    ErrorReasonCode[ErrorReasonCode["GeneralNotFound"] = 301] = "GeneralNotFound";
    ErrorReasonCode[ErrorReasonCode["GeneralConflict"] = 302] = "GeneralConflict";
    ErrorReasonCode[ErrorReasonCode["GeneralUnauthorized"] = 303] = "GeneralUnauthorized";
    ErrorReasonCode[ErrorReasonCode["GeneralForbidden"] = 304] = "GeneralForbidden";
    ErrorReasonCode[ErrorReasonCode["UserLoginFailure"] = 399] = "UserLoginFailure";
    ErrorReasonCode[ErrorReasonCode["HttpBadRequest"] = 400] = "HttpBadRequest";
    ErrorReasonCode[ErrorReasonCode["HttpUnauthorized"] = 401] = "HttpUnauthorized";
    ErrorReasonCode[ErrorReasonCode["HttpForbidden"] = 403] = "HttpForbidden";
    ErrorReasonCode[ErrorReasonCode["HttpNotFound"] = 404] = "HttpNotFound";
    ErrorReasonCode[ErrorReasonCode["HttpMethodNotAllowed"] = 405] = "HttpMethodNotAllowed";
    ErrorReasonCode[ErrorReasonCode["HttpRequestTimeout"] = 408] = "HttpRequestTimeout";
    ErrorReasonCode[ErrorReasonCode["HttpConflict"] = 409] = "HttpConflict";
    ErrorReasonCode[ErrorReasonCode["HttpUnprocessableContent"] = 422] = "HttpUnprocessableContent";
    ErrorReasonCode[ErrorReasonCode["HttpTooManyRequests"] = 429] = "HttpTooManyRequests";
    ErrorReasonCode[ErrorReasonCode["HttpInternalServerError"] = 500] = "HttpInternalServerError";
    ErrorReasonCode[ErrorReasonCode["HttpBadGateway"] = 502] = "HttpBadGateway";
    ErrorReasonCode[ErrorReasonCode["HttpServiceUnavailable"] = 503] = "HttpServiceUnavailable";
    ErrorReasonCode[ErrorReasonCode["HttpGatewayTimeout"] = 504] = "HttpGatewayTimeout";
    ErrorReasonCode[ErrorReasonCode["HttpTransportFailure"] = 550] = "HttpTransportFailure";
    ErrorReasonCode[ErrorReasonCode["HttpMalformedResponse"] = 551] = "HttpMalformedResponse";
    ErrorReasonCode[ErrorReasonCode["HttpUnexpectedStatusCode"] = 552] = "HttpUnexpectedStatusCode";
})(ErrorReasonCode || (exports.ErrorReasonCode = ErrorReasonCode = {}));
function toReasonCodePart(reason) {
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
class ErrorCode {
    operation;
    nameOfEntity;
    reason;
    constructor(operation, nameOfEntity, reason) {
        this.operation = operation;
        this.nameOfEntity = nameOfEntity;
        this.reason = reason;
    }
    get code() {
        return `${OperationType[this.operation]}.${this.nameOfEntity}.${toReasonCodePart(this.reason)}`;
    }
    static for(errorContext, reason) {
        return new ErrorCode(errorContext.operation, errorContext.entityName, reason);
    }
}
exports.ErrorCode = ErrorCode;
