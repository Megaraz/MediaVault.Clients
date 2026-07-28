"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogPolicy = void 0;
const Error_1 = require("./Error");
const DatabaseError_1 = require("./DatabaseError");
const HttpError_1 = require("./HttpError");
const ValidationError_1 = require("./ValidationError");
class ErrorLogPolicy {
    shouldLog(error) {
        if (error instanceof ValidationError_1.ValidationError) {
            return false;
        }
        if (error instanceof DatabaseError_1.DatabaseError) {
            return true;
        }
        if (error instanceof HttpError_1.HttpError) {
            return this.shouldLogHttpError(error);
        }
        if (error.type === Error_1.ErrorType.Cancelled) {
            return false;
        }
        return true;
    }
    shouldLogHttpError(error) {
        switch (error.httpErrorType) {
            case HttpError_1.HttpErrorType.BadRequest:
            case HttpError_1.HttpErrorType.NotFound:
            case HttpError_1.HttpErrorType.Conflict:
            case HttpError_1.HttpErrorType.UnprocessableContent:
                return false;
            default:
                return true;
        }
    }
}
exports.ErrorLogPolicy = ErrorLogPolicy;
