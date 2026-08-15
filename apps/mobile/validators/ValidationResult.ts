import type { Result } from 'result-pattern-typescript';

export interface ValidationError {
  readonly userMessage: string;
}

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

export function validationResultFromCore(result: Result<void>): ValidationResult {
  return result.ok
    ? validationResult([])
    : validationResult(result.validationErrors.map((error) => ({ userMessage: error.message })));
}
