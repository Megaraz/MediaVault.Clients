"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotValidId = isNotValidId;
exports.isNull = isNull;
exports.requiredFieldsAreNullOrWhiteSpace = requiredFieldsAreNullOrWhiteSpace;
exports.isNullOrWhiteSpace = isNullOrWhiteSpace;
exports.isNullOrWhiteSpaceFromContext = isNullOrWhiteSpaceFromContext;
exports.isTooLow = isTooLow;
exports.doesNotMatch = doesNotMatch;
const ValidationError_1 = require("./ValidationError");
const Validator_1 = require("./Validator");
function isNotValidId(id, errorContext) {
    if (!errorContext) {
        throw new Error("errorContext cannot be null.");
    }
    if (!(0, Validator_1.isValidId)(id)) {
        const fieldName = errorContext.fieldName && errorContext.fieldName.trim().length > 0
            ? errorContext.fieldName
            : "id";
        return {
            failed: true,
            error: ValidationError_1.ValidationError.required({ ...errorContext, fieldName })
        };
    }
    return { failed: false };
}
function isNull(value, errorContext) {
    if (!errorContext) {
        throw new Error("errorContext cannot be null.");
    }
    if (value === null || value === undefined) {
        return { failed: true, error: ValidationError_1.ValidationError.required(errorContext) };
    }
    return { failed: false };
}
function requiredFieldsAreNullOrWhiteSpace(requiredValues, errorContext) {
    if (!requiredValues) {
        throw new Error("requiredValues cannot be null.");
    }
    if (!errorContext) {
        throw new Error("errorContext cannot be null.");
    }
    const errors = [];
    for (const item of requiredValues) {
        const result = isNullOrWhiteSpace(item.value ?? null, item.fieldName, errorContext);
        if (result.failed && result.error) {
            errors.push(result.error);
        }
    }
    return { failed: errors.length > 0, errors };
}
function isNullOrWhiteSpace(value, fieldName, errorContext) {
    if (!errorContext) {
        throw new Error("errorContext cannot be null.");
    }
    if (value === null || value === undefined || value.trim().length === 0) {
        const resolvedFieldName = fieldName && fieldName.trim().length > 0
            ? fieldName
            : errorContext.fieldName && errorContext.fieldName.trim().length > 0
                ? errorContext.fieldName
                : "value";
        return {
            failed: true,
            error: ValidationError_1.ValidationError.required({ ...errorContext, fieldName: resolvedFieldName })
        };
    }
    return { failed: false };
}
function isNullOrWhiteSpaceFromContext(value, errorContext) {
    if (!errorContext) {
        throw new Error("errorContext cannot be null.");
    }
    if (value === null || value === undefined || value.trim().length === 0) {
        return { failed: true, error: ValidationError_1.ValidationError.required(errorContext) };
    }
    return { failed: false };
}
function isTooLow(value, minValue, errorContext) {
    if (!errorContext) {
        throw new Error("errorContext cannot be null.");
    }
    if (!Number.isSafeInteger(value) || !Number.isSafeInteger(minValue)) {
        throw new RangeError("value and minValue must be safe integers.");
    }
    if (value < minValue) {
        return { failed: true, error: ValidationError_1.ValidationError.outOfRange(errorContext, `>= ${minValue}`) };
    }
    return { failed: false };
}
function doesNotMatch(value1, value2, fieldName, confirmFieldName, errorContext) {
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
            error: ValidationError_1.ValidationError.nonMatchingValues({ ...errorContext, fieldName }, confirmFieldName)
        };
    }
    return { failed: false };
}
