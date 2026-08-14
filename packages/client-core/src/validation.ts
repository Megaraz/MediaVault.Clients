import type {
  MediaEntryCreateDto,
  MediaEntryUpdateDto,
  UserLoginDto,
  UserRegisterDto,
  UserUpdateDto,
} from '@mediavault/contracts';
import { success, validationFailure, type FieldError, type Result } from 'result-pattern-typescript';

export function validateUserLogin(dto: UserLoginDto | null | undefined): Result<void> {
  if (dto == null) return requiredObject();
  return requiredFields([
    ['usernameOrEmail', dto.usernameOrEmail, 'Username or email is required.'],
    ['password', dto.password, 'Password is required.'],
  ]);
}

export function validateUserRegistration(dto: UserRegisterDto | null | undefined): Result<void> {
  if (dto == null) return requiredObject();
  const errors = collectRequired([
    ['username', dto.username, 'Username is required.'],
    ['email', dto.email, 'Email is required.'],
    ['confirmEmail', dto.confirmEmail, 'Email confirmation is required.'],
    ['password', dto.password, 'Password is required.'],
    ['confirmPassword', dto.confirmPassword, 'Password confirmation is required.'],
  ]);

  if (isPresent(dto.email) && isPresent(dto.confirmEmail) && dto.email !== dto.confirmEmail) {
    errors.push({ field: 'confirmEmail', message: 'Email and confirmation must match.' });
  }
  if (isPresent(dto.password) && isPresent(dto.confirmPassword) && dto.password !== dto.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Password and confirmation must match.' });
  }
  return fromErrors(errors);
}

export function validateUserUpdate(dto: UserUpdateDto | null | undefined): Result<void> {
  if (dto == null) return requiredObject();
  return requiredFields([
    ['userName', dto.userName, 'Username is required.'],
    ['email', dto.email, 'Email is required.'],
  ]);
}

export function validateMediaEntry(
  dto: MediaEntryCreateDto | MediaEntryUpdateDto | null | undefined,
): Result<void> {
  if (dto == null) return requiredObject();
  return requiredFields([['title', dto.title, 'Title is required.']]);
}

type RequiredField = readonly [field: string, value: string | null | undefined, message: string];

function requiredFields(fields: readonly RequiredField[]): Result<void> {
  return fromErrors(collectRequired(fields));
}

function collectRequired(fields: readonly RequiredField[]): FieldError[] {
  return fields
    .filter(([, value]) => !isPresent(value))
    .map(([field, , message]) => ({ field, message }));
}

function isPresent(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function requiredObject(): Result<void> {
  return validationFailure([{ field: null, message: 'A value is required.' }]);
}

function fromErrors(errors: readonly FieldError[]): Result<void> {
  return errors.length === 0 ? success() : validationFailure(errors);
}
