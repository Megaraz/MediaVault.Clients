"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NETWORK_ERROR_MESSAGE = exports.CANCELLED_MESSAGE = exports.VALIDATION_ERROR_MESSAGE = exports.GENERIC_ERROR_MESSAGE = void 0;
exports.success = success;
exports.failure = failure;
exports.validationFailure = validationFailure;
exports.unexpectedFailure = unexpectedFailure;
exports.cancelled = cancelled;
exports.networkFailure = networkFailure;
exports.map = map;
exports.mapAsync = mapAsync;
exports.flatMap = flatMap;
exports.match = match;
exports.valueOr = valueOr;
exports.errorsByField = errorsByField;
exports.createFieldError = createFieldError;
exports.isPublicErrorCode = isPublicErrorCode;
exports.isSafeMessage = isSafeMessage;
exports.GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
exports.VALIDATION_ERROR_MESSAGE = "Please check the highlighted fields.";
exports.CANCELLED_MESSAGE = "The operation was cancelled.";
exports.NETWORK_ERROR_MESSAGE = "Unable to reach the server. Check your connection and try again.";
const PUBLIC_CODE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const PUBLIC_FIELD = /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/;
const MAX_MESSAGE_LENGTH = 500;
function success(...args) {
    if (args.length === 0) {
        return Object.freeze({ ok: true, value: undefined });
    }
    const [value] = args;
    if (value === null || value === undefined) {
        throw new TypeError("A successful result requires a value.");
    }
    return Object.freeze({ ok: true, value });
}
function failure(input) {
    const error = createError(input);
    return freezeFailure(error, []);
}
function validationFailure(errors, message = exports.VALIDATION_ERROR_MESSAGE) {
    if (errors.length === 0) {
        throw new TypeError("A validation failure requires at least one field error.");
    }
    const validationErrors = Object.freeze(errors.map((error) => createFieldError(error.field, error.message)));
    const resultError = createResultError("validation", "Validation.Failed", message);
    return freezeFailure(resultError, validationErrors);
}
function unexpectedFailure() {
    return failure({ kind: "failure", code: "Client.Unexpected", message: exports.GENERIC_ERROR_MESSAGE });
}
function cancelled() {
    return failure({ kind: "cancelled", code: "Client.Cancelled", message: exports.CANCELLED_MESSAGE });
}
function networkFailure() {
    return failure({ kind: "network", code: "Client.Network", message: exports.NETWORK_ERROR_MESSAGE });
}
function map(result, transform) {
    return result.ok ? success(transform(result.value)) : result;
}
async function mapAsync(result, transform) {
    return result.ok ? success(await transform(result.value)) : result;
}
function flatMap(result, transform) {
    return result.ok ? transform(result.value) : result;
}
function match(result, matcher) {
    return result.ok
        ? matcher.success(result.value)
        : matcher.failure(result.error, result.validationErrors);
}
function valueOr(result, fallback) {
    return result.ok ? result.value : fallback;
}
function errorsByField(result) {
    if (result.ok || result.validationErrors.length === 0) {
        return Object.freeze({});
    }
    const grouped = Object.create(null);
    for (const error of result.validationErrors) {
        if (error.field === null)
            continue;
        (grouped[error.field] ??= []).push(error.message);
    }
    return Object.freeze(Object.fromEntries(Object.entries(grouped).map(([field, messages]) => [field, Object.freeze(messages)])));
}
function createFieldError(field, message) {
    const normalizedField = field === null ? null : field.trim();
    if (normalizedField !== null && !PUBLIC_FIELD.test(normalizedField)) {
        throw new TypeError("A field name must be a safe public property path.");
    }
    return Object.freeze({ field: normalizedField, message: validateMessage(message) });
}
function isPublicErrorCode(value) {
    return typeof value === "string" && PUBLIC_CODE.test(value);
}
function isSafeMessage(value) {
    if (typeof value !== "string")
        return false;
    const normalized = value.trim();
    return normalized.length > 0 && normalized.length <= MAX_MESSAGE_LENGTH && !/[\u0000-\u001f\u007f]/.test(normalized);
}
function createError(input) {
    return createResultError(input.kind, input.code, input.message);
}
function createResultError(kind, code, message) {
    if (!isPublicErrorCode(code)) {
        throw new TypeError("An error code must be a short public identifier.");
    }
    return Object.freeze({ kind, code, message: validateMessage(message) });
}
function validateMessage(message) {
    if (!isSafeMessage(message)) {
        throw new TypeError("A user message must be non-empty, short, and free of control characters.");
    }
    return message.trim();
}
function freezeFailure(error, validationErrors) {
    const frozenErrors = Object.freeze([...validationErrors]);
    return Object.freeze({ ok: false, error, validationErrors: frozenErrors });
}
