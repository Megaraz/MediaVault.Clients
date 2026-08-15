import {
  validateMediaEntry,
} from '@mediavault/client-core';
import {
  type ErrorContext,
} from 'result-pattern-typescript/legacy';
import type { MediaEntryCreateDto, MediaEntryUpdateDto } from '@mediavault/contracts';
import { validationResultFromCore, type ValidationResult } from '../ValidationResult';

export class MediaEntryDtoValidator {
  public validateCreateDto(
    dto: MediaEntryCreateDto | null | undefined,
    errorContext: ErrorContext,
  ): ValidationResult {
    void errorContext;
    return validationResultFromCore(validateMediaEntry(dto));
  }

  public validateUpdateDto(
    dto: MediaEntryUpdateDto | null | undefined,
    errorContext: ErrorContext,
  ): ValidationResult {
    void errorContext;
    return validationResultFromCore(validateMediaEntry(dto));
  }

  public isValidCreateDto(
    dto: MediaEntryCreateDto | null | undefined,
    errorContext: ErrorContext,
  ): boolean {
    return this.validateCreateDto(dto, errorContext).isValid;
  }

  public isValidUpdateDto(
    dto: MediaEntryUpdateDto | null | undefined,
    errorContext: ErrorContext,
  ): boolean {
    return this.validateUpdateDto(dto, errorContext).isValid;
  }
}
