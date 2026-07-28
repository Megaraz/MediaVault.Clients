import { ErrorContext } from "./ErrorCode";
import { ResultError } from "./Error";
export declare enum DatabaseErrorType {
    Custom = 0,
    SaveChangesFailure = 1,
    ConcurrencyFailure = 2,
    QueryFailure = 3,
    UnexpectedFailure = 4
}
export declare class DatabaseError extends ResultError {
    readonly databaseErrorType: DatabaseErrorType;
    private constructor();
    static saveChangesFailure(errorContext: ErrorContext, exception: unknown): DatabaseError;
    static queryFailure(errorContext: ErrorContext, exception: unknown): DatabaseError;
    static concurrencyFailure(errorContext: ErrorContext, exception: unknown): DatabaseError;
    static unexpectedFailure(errorContext: ErrorContext, exception: unknown): DatabaseError;
}
