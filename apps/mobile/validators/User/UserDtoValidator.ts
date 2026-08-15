import {
  validateUserLogin,
  validateUserRegistration,
  validateUserUpdate,
} from '@mediavault/client-core';
import {
  type ErrorContext,
} from 'result-pattern-typescript/legacy';
import type { UserLoginDto, UserRegisterDto, UserUpdateDto } from '@mediavault/contracts';
import { validationResultFromCore, type ValidationResult } from '../ValidationResult';

export class UserDtoValidator {
  public validateLoginDto(
    dto: UserLoginDto | null | undefined,
    errorContext: ErrorContext,
  ): ValidationResult {
    void errorContext;
    return validationResultFromCore(validateUserLogin(dto));
  }

  public validateCreateDto(
    dto: UserRegisterDto | null | undefined,
    errorContext: ErrorContext,
  ): ValidationResult {
    void errorContext;
    return validationResultFromCore(validateUserRegistration(dto));
  }

  public validateUpdateDto(
    dto: UserUpdateDto | null | undefined,
    errorContext: ErrorContext,
  ): ValidationResult {
    void errorContext;
    return validationResultFromCore(validateUserUpdate(dto));
  }

  public isValidLoginDto(dto: UserLoginDto | null | undefined, errorContext: ErrorContext): boolean {
    return this.validateLoginDto(dto, errorContext).isValid;
  }

  public isValidCreateDto(dto: UserRegisterDto | null | undefined, errorContext: ErrorContext): boolean {
    return this.validateCreateDto(dto, errorContext).isValid;
  }

  public isValidUpdateDto(dto: UserUpdateDto | null | undefined, errorContext: ErrorContext): boolean {
    return this.validateUpdateDto(dto, errorContext).isValid;
  }
}
