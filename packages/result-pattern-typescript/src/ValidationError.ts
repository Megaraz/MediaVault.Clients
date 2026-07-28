import { ErrorReasonCode, ErrorCode, ErrorContext } from "./ErrorCode";
import { ErrorType, ResultError } from "./Error";

export enum ValidationErrorType {
  Custom = 0,
  Required = 1,
  InvalidFormat = 2,
  OutOfRange = 3,
  NonMatchingValues = 4,
  AlreadyExists = 5,
  TooShort = 6,
  TooLong = 7
}

export class ValidationError extends ResultError {
  public readonly validationErrorType: ValidationErrorType;
  public readonly fieldName?: string;

  private constructor(
    code: string,
    description: string,
    type: ValidationErrorType,
    userMessage: string,
    fieldName?: string
  ) {
    super(code, description, ErrorType.Validation, userMessage);
    this.validationErrorType = type;
    this.fieldName = fieldName;
  }

  public static alreadyExists(errorContext: ErrorContext): ValidationError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.ValidationAlreadyExists);
    const fieldName = errorContext.fieldName ?? "";
    const suffix = `A ${errorContext.entityName} with that ${fieldName} already exists, please choose a different ${fieldName}.`;
    return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.AlreadyExists, suffix, errorContext.fieldName);
  }

  public static invalidFormat(errorContext: ErrorContext, expectedFormat: string): ValidationError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.ValidationInvalidFormat);
    const suffix = `The field '${errorContext.fieldName ?? ""}' has an invalid format. Expected format: ${expectedFormat}.`;
    return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.InvalidFormat, suffix, errorContext.fieldName);
  }

  public static required(errorContext: ErrorContext): ValidationError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.ValidationRequired);
    const suffix =
      errorContext.fieldName && errorContext.fieldName.trim().length > 0
        ? `A value for the field '${errorContext.fieldName}' is required and cannot be null or empty.`
        : `A value for the entity '${errorContext.entityName}' is required and cannot be null or empty.`;
    return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.Required, suffix, errorContext.fieldName);
  }

  public static tooLong(errorContext: ErrorContext, range: string): ValidationError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.ValidationTooLong);
    const suffix = `The field '${errorContext.fieldName ?? ""}' is too long. Expected maximum length: ${range}.`;
    return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.TooLong, suffix, errorContext.fieldName);
  }

  public static outOfRange(errorContext: ErrorContext, range: string): ValidationError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.ValidationOutOfRange);
    const suffix = `The field '${errorContext.fieldName ?? ""}' is out of range. Expected range: ${range}.`;
    return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.OutOfRange, suffix, errorContext.fieldName);
  }

  public static tooShort(errorContext: ErrorContext, range: string): ValidationError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.ValidationTooShort);
    const suffix = `The field '${errorContext.fieldName ?? ""}' is too short. Expected minimum length: ${range}.`;
    return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.TooShort, suffix, errorContext.fieldName);
  }

  public static nonMatchingValues(errorContext: ErrorContext, confirmFieldName?: string): ValidationError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.ValidationNonMatchingValues);
    const suffix =
      errorContext.fieldName &&
      errorContext.fieldName.trim().length > 0 &&
      confirmFieldName &&
      confirmFieldName.trim().length > 0
        ? `The values for '${errorContext.fieldName}' and '${confirmFieldName}' do not match.`
        : "The provided values do not match.";

    return new ValidationError(
      errorCode.code,
      this.formatDescription(errorContext, suffix),
      ValidationErrorType.NonMatchingValues,
      suffix,
      confirmFieldName ?? errorContext.fieldName
    );
  }

  public static custom(errorContext: ErrorContext): ValidationError {
    const errorCode = ErrorCode.for(errorContext, ErrorReasonCode.Custom);
    const suffix = "A custom validation error occurred.";
    return new ValidationError(errorCode.code, this.formatDescription(errorContext, suffix), ValidationErrorType.Custom, suffix, errorContext.fieldName);
  }
}
