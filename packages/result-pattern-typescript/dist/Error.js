"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Error = exports.ResultError = exports.ErrorType = void 0;
const ErrorCode_1 = require("./ErrorCode");
var ErrorType;
(function (ErrorType) {
    ErrorType[ErrorType["None"] = 0] = "None";
    ErrorType[ErrorType["Failure"] = 1] = "Failure";
    ErrorType[ErrorType["Validation"] = 2] = "Validation";
    ErrorType[ErrorType["NotFound"] = 3] = "NotFound";
    ErrorType[ErrorType["Conflict"] = 4] = "Conflict";
    ErrorType[ErrorType["Unauthorized"] = 5] = "Unauthorized";
    ErrorType[ErrorType["Forbidden"] = 6] = "Forbidden";
    ErrorType[ErrorType["Database"] = 7] = "Database";
    ErrorType[ErrorType["HttpError"] = 8] = "HttpError";
    ErrorType[ErrorType["Cancelled"] = 9] = "Cancelled";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
class ResultError {
    static None = new ResultError("", "", ErrorType.None);
    code;
    description;
    type;
    userMessage;
    exception;
    constructor(code, description, type, userMessage = "", exception) {
        this.code = code;
        this.description = description;
        this.type = type;
        this.userMessage = userMessage;
        this.exception = exception;
    }
    toString() {
        return `Error Code: ${this.code}\nDescription: ${this.description}`;
    }
    static notFound(errorContext) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.GeneralNotFound);
        const suffix = `${errorContext.entityName} not found`;
        return new ResultError(errorCode.code, this.formatDescription(errorContext, suffix), ErrorType.NotFound, suffix);
    }
    static conflict(errorContext) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.GeneralConflict);
        const suffix = `Unique ${errorContext.entityName} constraint violated.`;
        return new ResultError(errorCode.code, this.formatDescription(errorContext, suffix), ErrorType.Conflict, suffix);
    }
    static unauthorized(errorContext) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.GeneralUnauthorized);
        const suffix = `Unauthorized access${errorContext.fieldName && errorContext.fieldName.trim().length > 0 ? ` to ${errorContext.fieldName}` : ""}`;
        return new ResultError(errorCode.code, this.formatDescription(errorContext, suffix), ErrorType.Unauthorized, suffix);
    }
    static failure(errorContext, descriptionSuffix, exception) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.GeneralFailure);
        const suffix = descriptionSuffix && descriptionSuffix.trim().length > 0
            ? descriptionSuffix
            : `An unexpected failure occurred while processing ${errorContext.entityName}.`;
        return new ResultError(errorCode.code, this.formatDescription(errorContext, suffix), ErrorType.Failure, suffix, exception);
    }
    static cancelled(errorContext) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.OperationCancelled);
        const suffix = `The operation on ${errorContext.entityName} was cancelled.`;
        return new ResultError(errorCode.code, this.formatDescription(errorContext, suffix), ErrorType.Cancelled, suffix);
    }
    static formatDescription(errorContext, descriptionSuffix) {
        const operationName = ErrorCode_1.OperationType[errorContext.operation] ?? String(errorContext.operation);
        const prefix = `An error occurred during ${operationName} on entity ${errorContext.entityName}:\n` +
            `Layer: ${errorContext.layer}\n` +
            `Service: ${errorContext.serviceName}\n` +
            `Method: ${errorContext.methodName}`;
        return `${prefix}: ${descriptionSuffix}`;
    }
}
exports.ResultError = ResultError;
exports.Error = ResultError;
