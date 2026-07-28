import { ErrorReasonCode, ErrorCode, ErrorContext } from "./ErrorCode";
import { ErrorType, ResultError } from "./Error";

export enum DatabaseErrorType {
  Custom = 0,
  SaveChangesFailure = 1,
  ConcurrencyFailure = 2,
  QueryFailure = 3,
  UnexpectedFailure = 4
}

export class DatabaseError extends ResultError {
  public readonly databaseErrorType: DatabaseErrorType;

  private constructor(
    code: string,
    description: string,
    type: DatabaseErrorType,
    userMessage: string,
    exception?: unknown
  ) {
    super(code, description, ErrorType.Database, userMessage, exception);
    this.databaseErrorType = type;
  }

  public static saveChangesFailure(errorContext: ErrorContext, exception: unknown): DatabaseError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.DatabaseSaveChangesFailure);
    const suffix = `A database failure occurred while saving changes for ${errorCode.nameOfEntity}.`;
    return new DatabaseError(errorCode.code, this.formatDescription(errorContext, suffix), DatabaseErrorType.SaveChangesFailure, suffix, exception);
  }

  public static queryFailure(errorContext: ErrorContext, exception: unknown): DatabaseError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.DatabaseQueryFailure);
    const suffix = `A database failure occurred while querying ${errorCode.nameOfEntity}.`;
    return new DatabaseError(errorCode.code, this.formatDescription(errorContext, suffix), DatabaseErrorType.QueryFailure, suffix, exception);
  }

  public static concurrencyFailure(errorContext: ErrorContext, exception: unknown): DatabaseError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.DatabaseConcurrencyFailure);
    const suffix = `A concurrency conflict occurred while processing ${errorCode.nameOfEntity}. The entity was modified or deleted by another process.`;
    return new DatabaseError(errorCode.code, this.formatDescription(errorContext, suffix), DatabaseErrorType.ConcurrencyFailure, suffix, exception);
  }

  public static unexpectedFailure(errorContext: ErrorContext, exception: unknown): DatabaseError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.DatabaseUnexpectedFailure);
    const suffix = `An unexpected infrastructure failure occurred while performing ${errorContext.operation} for entity ${errorCode.nameOfEntity}.`;
    return new DatabaseError(errorCode.code, this.formatDescription(errorContext, suffix), DatabaseErrorType.UnexpectedFailure, suffix, exception);
  }
}
