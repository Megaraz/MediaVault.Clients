"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ValidationErrorType = void 0;
const ErrorCode_1 = require("./ErrorCode");
const Error_1 = require("./Error");
var ValidationErrorType;
(function (ValidationErrorType) {
    ValidationErrorType[ValidationErrorType["Custom"] = 0] = "Custom";
    ValidationErrorType[ValidationErrorType["Required"] = 1] = "Required";
    ValidationErrorType[ValidationErrorType["InvalidFormat"] = 2] = "InvalidFormat";
    ValidationErrorType[ValidationErrorType["OutOfRange"] = 3] = "OutOfRange";
    ValidationErrorType[ValidationErrorType["NonMatchingValues"] = 4] = "NonMatchingValues";
    ValidationErrorType[ValidationErrorType["AlreadyExists"] = 5] = "AlreadyExists";
    ValidationErrorType[ValidationErrorType["TooShort"] = 6] = "TooShort";
    ValidationErrorType[ValidationErrorType["TooLong"] = 7] = "TooLong";
})(ValidationErrorType || (exports.ValidationErrorType = ValidationErrorType = {}));
class ValidationError extends Error_1.ResultError {
    validationErrorType;
    fieldName;
    constructor(code, description, type, userMessage, fieldName) {
        super(code, description, Error_1.ErrorType.Validation, userMessage);
        this.validationErrorType = type;
        this.fieldName = fieldName;
    }
    static alreadyExists(errorContext) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.ValidationAlreadyExists);
        const fieldName = errorContext.fieldName ?? "";
        const suffix = `A ${errorContext.entityName} with that ${fieldName} already exists, please choose a different ${fieldName}.`;
        return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.AlreadyExists, suffix, errorContext.fieldName);
    }
    static invalidFormat(errorContext, expectedFormat) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.ValidationInvalidFormat);
        const suffix = `The field '${errorContext.fieldName ?? ""}' has an invalid format. Expected format: ${expectedFormat}.`;
        return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.InvalidFormat, suffix, errorContext.fieldName);
    }
    static required(errorContext) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.ValidationRequired);
        const suffix = errorContext.fieldName && errorContext.fieldName.trim().length > 0
            ? `A value for the field '${errorContext.fieldName}' is required and cannot be null or empty.`
            : `A value for the entity '${errorContext.entityName}' is required and cannot be null or empty.`;
        return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.Required, suffix, errorContext.fieldName);
    }
    static tooLong(errorContext, range) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.ValidationTooLong);
        const suffix = `The field '${errorContext.fieldName ?? ""}' is too long. Expected maximum length: ${range}.`;
        return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.TooLong, suffix, errorContext.fieldName);
    }
    static outOfRange(errorContext, range) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.ValidationOutOfRange);
        const suffix = `The field '${errorContext.fieldName ?? ""}' is out of range. Expected range: ${range}.`;
        return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.OutOfRange, suffix, errorContext.fieldName);
    }
    static tooShort(errorContext, range) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.ValidationTooShort);
        const suffix = `The field '${errorContext.fieldName ?? ""}' is too short. Expected minimum length: ${range}.`;
        return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.TooShort, suffix, errorContext.fieldName);
    }
    static nonMatchingValues(errorContext, confirmFieldName) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.ValidationNonMatchingValues);
        const suffix = errorContext.fieldName &&
            errorContext.fieldName.trim().length > 0 &&
            confirmFieldName &&
            confirmFieldName.trim().length > 0
            ? `The values for '${errorContext.fieldName}' and '${confirmFieldName}' do not match.`
            : "The provided values do not match.";
        return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.NonMatchingValues, suffix, confirmFieldName ?? errorContext.fieldName);
    }
    static custom(errorContext) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.Custom);
        const suffix = "A custom validation error occurred.";
        return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.Custom, suffix, errorContext.fieldName);
    }
}
exports.ValidationError = ValidationError;
