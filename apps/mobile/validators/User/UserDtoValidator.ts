import {
  doesNotMatch,
  isNull,
  requiredFieldsAreNullOrWhiteSpace,
  type ErrorContext,
  type ValidationError,
} from 'result-pattern-typescript';
import type { UserLoginDto, UserRegisterDto, UserUpdateDto } from '../../types/dtos/User';
import { validationResult, type ValidationResult } from '../ValidationResult';

export class UserDtoValidator {
  public validateLoginDto(
    dto: UserLoginDto | null | undefined,
    errorContext: ErrorContext,
  ): ValidationResult {
    const nullCheck = isNull(dto, errorContext);
    if (nullCheck.failed) return validationResult([nullCheck.error]);
    if (dto === null || dto === undefined) return validationResult([]);

    const requiredCheck = requiredFieldsAreNullOrWhiteSpace(
      [
        { fieldName: 'Username or Email', value: dto.userNameOrEmail },
        { fieldName: 'Password', value: dto.password },
      ],
      errorContext,
    );
    return validationResult(requiredCheck.errors);
  }

  public validateCreateDto(
    dto: UserRegisterDto | null | undefined,
    errorContext: ErrorContext,
  ): ValidationResult {
    const nullCheck = isNull(dto, errorContext);
    if (nullCheck.failed) return validationResult([nullCheck.error]);
    if (dto === null || dto === undefined) return validationResult([]);

    const errors: ValidationError[] = [];
    const requiredCheck = requiredFieldsAreNullOrWhiteSpace(
      [
        { fieldName: 'Username', value: dto.username },
        { fieldName: 'Email', value: dto.email },
        { fieldName: 'ConfirmEmail', value: dto.confirmEmail },
        { fieldName: 'Password', value: dto.password },
        { fieldName: 'ConfirmPassword', value: dto.confirmPassword },
      ],
      errorContext,
    );
    errors.push(...requiredCheck.errors);

    if (dto.email.trim() && dto.confirmEmail.trim()) {
      const emailCheck = doesNotMatch(
        dto.email,
        dto.confirmEmail,
        'Email',
        'ConfirmEmail',
        errorContext,
      );
      if (emailCheck.failed) errors.push(emailCheck.error);
    }

    if (dto.password.trim() && dto.confirmPassword.trim()) {
      const passwordCheck = doesNotMatch(
        dto.password,
        dto.confirmPassword,
        'Password',
        'ConfirmPassword',
        errorContext,
      );
      if (passwordCheck.failed) errors.push(passwordCheck.error);
    }

    return validationResult(errors);
  }

  public validateUpdateDto(
    dto: UserUpdateDto | null | undefined,
    errorContext: ErrorContext,
  ): ValidationResult {
    const nullCheck = isNull(dto, errorContext);
    if (nullCheck.failed) return validationResult([nullCheck.error]);
    if (dto === null || dto === undefined) return validationResult([]);

    const requiredCheck = requiredFieldsAreNullOrWhiteSpace(
      [
        { fieldName: 'UserName', value: dto.userName },
        { fieldName: 'Email', value: dto.email },
      ],
      errorContext,
    );
    return validationResult(requiredCheck.errors);
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
