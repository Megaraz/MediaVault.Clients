import type { ValidationError } from 'result-pattern-typescript/legacy';

export interface ValidationResult {
  readonly isValid: boolean;
  readonly validationErrors: readonly ValidationError[];
}

export function validationResult(validationErrors: readonly ValidationError[]): ValidationResult {
  return {
    isValid: validationErrors.length === 0,
    validationErrors,
  };
}
