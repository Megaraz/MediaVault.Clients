"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.DatabaseErrorType = void 0;
const ErrorCode_1 = require("./ErrorCode");
const Error_1 = require("./Error");
var DatabaseErrorType;
(function (DatabaseErrorType) {
    DatabaseErrorType[DatabaseErrorType["Custom"] = 0] = "Custom";
    DatabaseErrorType[DatabaseErrorType["SaveChangesFailure"] = 1] = "SaveChangesFailure";
    DatabaseErrorType[DatabaseErrorType["ConcurrencyFailure"] = 2] = "ConcurrencyFailure";
    DatabaseErrorType[DatabaseErrorType["QueryFailure"] = 3] = "QueryFailure";
    DatabaseErrorType[DatabaseErrorType["UnexpectedFailure"] = 4] = "UnexpectedFailure";
})(DatabaseErrorType || (exports.DatabaseErrorType = DatabaseErrorType = {}));
class DatabaseError extends Error_1.ResultError {
    databaseErrorType;
    constructor(code, description, type, userMessage, exception) {
        super(code, description, Error_1.ErrorType.Database, userMessage, exception);
        this.databaseErrorType = type;
    }
    static saveChangesFailure(errorContext, exception) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.DatabaseSaveChangesFailure);
        const suffix = `A database failure occurred while saving changes for ${errorCode.nameOfEntity}.`;
        return new DatabaseError(errorCode.code, this.formatDescription(errorContext, suffix), DatabaseErrorType.SaveChangesFailure, suffix, exception);
    }
    static queryFailure(errorContext, exception) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.DatabaseQueryFailure);
        const suffix = `A database failure occurred while querying ${errorCode.nameOfEntity}.`;
        return new DatabaseError(errorCode.code, this.formatDescription(errorContext, suffix), DatabaseErrorType.QueryFailure, suffix, exception);
    }
    static concurrencyFailure(errorContext, exception) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.DatabaseConcurrencyFailure);
        const suffix = `A concurrency conflict occurred while processing ${errorCode.nameOfEntity}. The entity was modified or deleted by another process.`;
        return new DatabaseError(errorCode.code, this.formatDescription(errorContext, suffix), DatabaseErrorType.ConcurrencyFailure, suffix, exception);
    }
    static unexpectedFailure(errorContext, exception) {
        const errorCode = ErrorCode_1.ErrorCode.for(errorContext, ErrorCode_1.ErrorReasonCode.DatabaseUnexpectedFailure);
        const suffix = `An unexpected infrastructure failure occurred while performing ${errorContext.operation} for entity ${errorCode.nameOfEntity}.`;
        return new DatabaseError(errorCode.code, this.formatDescription(errorContext, suffix), DatabaseErrorType.UnexpectedFailure, suffix, exception);
    }
}
exports.DatabaseError = DatabaseError;
