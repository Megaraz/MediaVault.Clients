import {
  DatabaseError,
  Error as ResultErrorFactory,
  OperationType,
  Result,
  ResultOf,
} from 'result-pattern-typescript/legacy';

export function errorContext(
  serviceName: string,
  methodName: string,
  operation: OperationType,
  entityName: string,
  fieldName?: string,
) {
  return {
    layer: 'Infrastructure',
    serviceName,
    methodName,
    operation,
    entityName,
    fieldName,
  };
}

export function notFound<T>(context: ReturnType<typeof errorContext>): ResultOf<T> {
  return ResultOf.failure<T>(ResultErrorFactory.notFound(context));
}

export function unauthorized<T>(
  context: ReturnType<typeof errorContext>,
  message: string,
): ResultOf<T> {
  return ResultOf.failure<T>(ResultErrorFactory.unauthorized(context), message);
}

export function cancelled<T>(context: ReturnType<typeof errorContext>): ResultOf<T> {
  return ResultOf.failure<T>(ResultErrorFactory.cancelled(context));
}

export function queryFailure<T>(
  context: ReturnType<typeof errorContext>,
  exception: unknown,
): ResultOf<T> {
  return ResultOf.failure<T>(DatabaseError.queryFailure(context, exception));
}

export function saveFailure<T>(
  context: ReturnType<typeof errorContext>,
  exception: unknown,
): ResultOf<T> {
  return ResultOf.failure<T>(DatabaseError.saveChangesFailure(context, exception));
}

export function saveFailureResult(
  context: ReturnType<typeof errorContext>,
  exception: unknown,
): Result {
  return Result.failure(DatabaseError.saveChangesFailure(context, exception));
}

export function unexpectedFailureResult(
  context: ReturnType<typeof errorContext>,
  exception: unknown,
): Result {
  return Result.failure(DatabaseError.unexpectedFailure(context, exception));
}

export function isUniqueConstraintError(exception: unknown): boolean {
  const message = exception instanceof Error ? exception.message : String(exception);
  return /unique constraint|constraint failed/i.test(message);
}

export function isOperationCancelled(exception: unknown): boolean {
  return exception instanceof Error && exception.name === 'AbortError';
}

export function cancelledResult(context: ReturnType<typeof errorContext>): Result {
  return Result.failure(ResultErrorFactory.cancelled(context));
}
