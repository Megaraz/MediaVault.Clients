"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultOf = exports.Result = void 0;
const Error_1 = require("./Error");
const ValidationError_1 = require("./ValidationError");
const DEFAULT_VALIDATION_FAILURE_MESSAGE = "Validation errors occurred, see validation errors for details.";
class Result {
    isSuccess;
    get isFailure() {
        return !this.isSuccess;
    }
    message;
    validationErrors;
    primaryError;
    constructor(isSuccess, message, validationErrors, primaryError) {
        validateResultState(isSuccess, message, validationErrors, primaryError);
        this.isSuccess = isSuccess;
        this.message = message;
        this.validationErrors = Object.freeze([...validationErrors]);
        this.primaryError = primaryError;
    }
    static success() {
        return new Result(true, "", [], Error_1.ResultError.None);
    }
    static validationFailure(validationErrors, message) {
        if (!validationErrors) {
            throw new Error("validationErrors cannot be null.");
        }
        if (validationErrors.length === 0) {
            throw new Error("Validation failure must contain at least one validation error.");
        }
        return new Result(false, message && message.trim().length > 0 ? message : DEFAULT_VALIDATION_FAILURE_MESSAGE, validationErrors, validationErrors[0]);
    }
    static failure(primaryError, message) {
        if (!primaryError) {
            throw new Error("primaryError cannot be null.");
        }
        return new Result(false, message ?? primaryError.userMessage, [], primaryError);
    }
}
exports.Result = Result;
class ResultOf {
    isSuccess;
    get isFailure() {
        return !this.isSuccess;
    }
    message;
    validationErrors;
    primaryError;
    _value;
    constructor(isSuccess, message, validationErrors, primaryError, value) {
        validateResultState(isSuccess, message, validationErrors, primaryError);
        this.isSuccess = isSuccess;
        this.message = message;
        this.validationErrors = Object.freeze([...validationErrors]);
        this.primaryError = primaryError;
        this._value = value;
    }
    get value() {
        if (this.isFailure) {
            throw new Error("Cannot access value of a failed result.");
        }
        return this._value;
    }
    static success(value) {
        if (value === undefined || value === null) {
            throw new Error("value cannot be null.");
        }
        return new ResultOf(true, "", [], Error_1.ResultError.None, value);
    }
    static validationFailure(validationErrors, message) {
        if (!validationErrors) {
            throw new Error("validationErrors cannot be null.");
        }
        if (validationErrors.length === 0) {
            throw new Error("Validation failure must contain at least one validation error.");
        }
        return new ResultOf(false, message && message.trim().length > 0 ? message : DEFAULT_VALIDATION_FAILURE_MESSAGE, validationErrors, validationErrors[0]);
    }
    static failure(primaryError, message) {
        if (!primaryError) {
            throw new Error("primaryError cannot be null.");
        }
        return new ResultOf(false, message ?? primaryError.userMessage, [], primaryError);
    }
    static fromFailure(result) {
        if (result.isSuccess) {
            throw new Error("Cannot create ResultOf<T> from a successful Result without a value.");
        }
        return new ResultOf(false, result.message, result.validationErrors, result.primaryError);
    }
}
exports.ResultOf = ResultOf;
function validateResultState(isSuccess, message, validationErrors, primaryError) {
    if (message === undefined || message === null) {
        throw new Error("message cannot be null.");
    }
    if (!validationErrors) {
        throw new Error("validationErrors cannot be null.");
    }
    if (!primaryError) {
        throw new Error("primaryError cannot be null.");
    }
    if (isSuccess) {
        if (primaryError.type !== Error_1.ErrorType.None) {
            throw new Error("Success result cannot contain errors.");
        }
        if (validationErrors.length > 0) {
            throw new Error("Success result cannot contain validation errors.");
        }
        return;
    }
    if (primaryError.type === Error_1.ErrorType.None) {
        throw new Error("Failure result must contain a primary error.");
    }
    if (primaryError.type === Error_1.ErrorType.Validation) {
        if (!(primaryError instanceof ValidationError_1.ValidationError)) {
            throw new Error("Validation failure result must have an error of type ValidationError.");
        }
        if (validationErrors.length === 0) {
            throw new Error("Validation failure result must contain a collection of validation errors.");
        }
        if (!validationErrors.includes(primaryError)) {
            throw new Error("Validation errors must contain the primary validation error.");
        }
        return;
    }
    if (validationErrors.length > 0) {
        throw new Error("Non-validation failure result cannot contain validation errors.");
    }
}
