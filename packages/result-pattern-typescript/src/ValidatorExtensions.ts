import { ErrorContext } from "./ErrorCode";
import { ValidationError } from "./ValidationError";
import { isValidId } from "./Validator";

export type ValidationCheck =
  | { readonly failed: true; readonly error: ValidationError }
  | { readonly failed: false; readonly error?: never };

export interface ValidationCollectionCheck {
  readonly failed: boolean;
  readonly errors: readonly ValidationError[];
}

export function isNotValidId<TKey>(
  id: TKey,
  errorContext: ErrorContext
): ValidationCheck {
  if (!errorContext) {
    throw new Error("errorContext cannot be null.");
  }

  if (!isValidId(id)) {
    const fieldName =
      errorContext.fieldName && errorContext.fieldName.trim().length > 0
        ? errorContext.fieldName
        : "id";

    return {
      failed: true,
      error: ValidationError.required({ ...errorContext, fieldName })
    };
  }

  return { failed: false };
}

export function isNull<TValue>(
  value: TValue | null | undefined,
  errorContext: ErrorContext
): ValidationCheck {
  if (!errorContext) {
    throw new Error("errorContext cannot be null.");
  }

  if (value === null || value === undefined) {
    return { failed: true, error: ValidationError.required(errorContext) };
  }

  return { failed: false };
}

export function requiredFieldsAreNullOrWhiteSpace(
  requiredValues: ReadonlyArray<{ fieldName: string; value?: string | null }>,
  errorContext: ErrorContext
): ValidationCollectionCheck {
  if (!requiredValues) {
    throw new Error("requiredValues cannot be null.");
  }
  if (!errorContext) {
    throw new Error("errorContext cannot be null.");
  }

  const errors: ValidationError[] = [];

  for (const item of requiredValues) {
    const result = isNullOrWhiteSpace(item.value ?? null, item.fieldName, errorContext);
    if (result.failed && result.error) {
      errors.push(result.error);
    }
  }

  return { failed: errors.length > 0, errors };
}

export function isNullOrWhiteSpace(
  value: string | null | undefined,
  fieldName: string,
  errorContext: ErrorContext
): ValidationCheck {
  if (!errorContext) {
    throw new Error("errorContext cannot be null.");
  }

  if (value === null || value === undefined || value.trim().length === 0) {
    const resolvedFieldName =
      fieldName && fieldName.trim().length > 0
        ? fieldName
        : errorContext.fieldName && errorContext.fieldName.trim().length > 0
          ? errorContext.fieldName
          : "value";

    return {
      failed: true,
      error: ValidationError.required({ ...errorContext, fieldName: resolvedFieldName })
    };
  }

  return { failed: false };
}

export function isNullOrWhiteSpaceFromContext(
  value: string | null | undefined,
  errorContext: ErrorContext
): ValidationCheck {
  if (!errorContext) {
    throw new Error("errorContext cannot be null.");
  }

  if (value === null || value === undefined || value.trim().length === 0) {
    return { failed: true, error: ValidationError.required(errorContext) };
  }

  return { failed: false };
}

export function isTooLow(
  value: number,
  minValue: number,
  errorContext: ErrorContext
): ValidationCheck {
  if (!errorContext) {
    throw new Error("errorContext cannot be null.");
  }
  if (!Number.isSafeInteger(value) || !Number.isSafeInteger(minValue)) {
    throw new RangeError("value and minValue must be safe integers.");
  }

  if (value < minValue) {
    return { failed: true, error: ValidationError.outOfRange(errorContext, `>= ${minValue}`) };
  }

  return { failed: false };
}

export function doesNotMatch(
  value1: string,
  value2: string,
  fieldName: string,
  confirmFieldName: string,
  errorContext: ErrorContext
): ValidationCheck {
  if (!errorContext) {
    throw new Error("errorContext cannot be null.");
  }

  const value1Check = isNullOrWhiteSpace(value1, fieldName, errorContext);
  if (value1Check.failed) {
    return value1Check;
  }

  const value2Check = isNullOrWhiteSpace(value2, confirmFieldName, errorContext);
  if (value2Check.failed) {
    return value2Check;
  }

  if (value1 !== value2) {
    return {
      failed: true,
      error: ValidationError.nonMatchingValues({ ...errorContext, fieldName }, confirmFieldName)
    };
  }

  return { failed: false };
}
