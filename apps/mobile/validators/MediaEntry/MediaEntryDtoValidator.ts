import {
  isNull,
  isNullOrWhiteSpaceFromContext,
  type ErrorContext,
  type ValidationError,
} from 'result-pattern-typescript';
import type { MediaEntryCreateDto, MediaEntryUpdateDto } from '../../types/dtos/MediaEntryBase';
import { validationResult, type ValidationResult } from '../ValidationResult';

export class MediaEntryDtoValidator {
  public validateCreateDto(
    dto: MediaEntryCreateDto | null | undefined,
    errorContext: ErrorContext,
  ): ValidationResult {
    const nullCheck = isNull(dto, errorContext);
    if (nullCheck.failed) return validationResult([nullCheck.error]);
    if (dto === null || dto === undefined) return validationResult([]);

    return validationResult(this.validateTitle(dto.title, errorContext));
  }

  public validateUpdateDto(
    dto: MediaEntryUpdateDto | null | undefined,
    errorContext: ErrorContext,
  ): ValidationResult {
    const nullCheck = isNull(dto, errorContext);
    if (nullCheck.failed) return validationResult([nullCheck.error]);
    if (dto === null || dto === undefined) return validationResult([]);

    return validationResult(this.validateTitle(dto.title, {
      ...errorContext,
      fieldName: 'Title',
    }));
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

  private validateTitle(title: string | null | undefined, errorContext: ErrorContext): ValidationError[] {
    const titleCheck = isNullOrWhiteSpaceFromContext(title, {
      ...errorContext,
      fieldName: 'Title',
    });
    return titleCheck.failed ? [titleCheck.error] : [];
  }
}
