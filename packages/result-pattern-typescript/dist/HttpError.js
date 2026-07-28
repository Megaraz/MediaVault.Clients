"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = exports.HttpErrorType = void 0;
const ErrorCode_1 = require("./ErrorCode");
const Error_1 = require("./Error");
var HttpErrorType;
(function (HttpErrorType) {
    HttpErrorType[HttpErrorType["Custom"] = 0] = "Custom";
    HttpErrorType[HttpErrorType["BadRequest"] = 1] = "BadRequest";
    HttpErrorType[HttpErrorType["Unauthorized"] = 2] = "Unauthorized";
    HttpErrorType[HttpErrorType["Forbidden"] = 3] = "Forbidden";
    HttpErrorType[HttpErrorType["NotFound"] = 4] = "NotFound";
    HttpErrorType[HttpErrorType["Conflict"] = 5] = "Conflict";
    HttpErrorType[HttpErrorType["InternalServerError"] = 6] = "InternalServerError";
    HttpErrorType[HttpErrorType["UnprocessableContent"] = 7] = "UnprocessableContent";
    HttpErrorType[HttpErrorType["TooManyRequests"] = 8] = "TooManyRequests";
    HttpErrorType[HttpErrorType["TransportFailure"] = 9] = "TransportFailure";
    HttpErrorType[HttpErrorType["MalformedResponse"] = 10] = "MalformedResponse";
    HttpErrorType[HttpErrorType["UnexpectedStatusCode"] = 11] = "UnexpectedStatusCode";
})(HttpErrorType || (exports.HttpErrorType = HttpErrorType = {}));
class HttpError extends Error_1.ResultError {
    httpErrorType;
    constructor(code, description, type, userMessage, exception) {
        super(code, description, Error_1.ErrorType.HttpError, userMessage, exception);
        this.httpErrorType = type;
    }
    static custom(errorContext, customDescriptionSuffix) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.Custom);
        return new HttpError(errorCode.code, this.formatDescription(errorContext, customDescriptionSuffix), HttpErrorType.Custom, customDescriptionSuffix);
    }
    static transportFailure(errorContext, exception) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpTransportFailure);
        const suffix = "Transport Failure";
        return new HttpError(errorCode.code, this.formatDescription(errorContext, suffix), HttpErrorType.TransportFailure, suffix, exception);
    }
    static tooManyRequests(errorContext, callerMessage) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpTooManyRequests);
        const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Too Many Requests";
        return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.TooManyRequests, userMessage);
    }
    static malformedResponse(errorContext, exception, detail) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpMalformedResponse);
        const userMessage = "The external service returned a malformed or unexpected response.";
        const suffix = detail && detail.trim().length > 0 ? detail : userMessage;
        return new HttpError(errorCode.code, this.formatDescription(errorContext, suffix), HttpErrorType.MalformedResponse, userMessage, exception);
    }
    static unexpectedStatusCode(errorContext, statusCode, statusText) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpUnexpectedStatusCode);
        const suffix = `The external service returned an unexpected HTTP status code ${statusCode}${statusText ? ` (${statusText})` : ""}.`;
        return new HttpError(errorCode.code, this.formatDescription(errorContext, suffix), HttpErrorType.UnexpectedStatusCode, suffix);
    }
    static unprocessableContent(errorContext, callerMessage) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpUnprocessableContent);
        const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Unprocessable Content";
        return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.UnprocessableContent, userMessage);
    }
    static badRequest(errorContext, callerMessage) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpBadRequest);
        const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Bad Request";
        return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.BadRequest, userMessage);
    }
    static unauthorizedAccess(errorContext, callerMessage) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpUnauthorized);
        const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Unauthorized";
        return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.Unauthorized, userMessage);
    }
    static notFound(errorContext, callerMessage) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpNotFound);
        const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Not Found";
        return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.NotFound, userMessage);
    }
    static conflict(errorContext, callerMessage) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpConflict);
        const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Conflict";
        return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.Conflict, userMessage);
    }
    static forbidden(errorContext, callerMessage) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpForbidden);
        const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Forbidden";
        return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.Forbidden, userMessage);
    }
    static internalServerError(errorContext, callerMessage) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.HttpInternalServerError);
        const userMessage = callerMessage && callerMessage.trim().length > 0 ? callerMessage : "Internal Server Error";
        return new HttpError(errorCode.code, this.formatDescription(errorContext, userMessage), HttpErrorType.InternalServerError, userMessage);
    }
}
exports.HttpError = HttpError;
