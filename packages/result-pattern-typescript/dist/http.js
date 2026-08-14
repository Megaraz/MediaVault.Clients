"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NETWORK_ERROR_MESSAGE = exports.GENERIC_ERROR_MESSAGE = exports.CANCELLED_MESSAGE = void 0;
exports.resultFromResponse = resultFromResponse;
exports.emptyResultFromResponse = emptyResultFromResponse;
exports.resultFromRequestError = resultFromRequestError;
const client_1 = require("./client");
Object.defineProperty(exports, "CANCELLED_MESSAGE", { enumerable: true, get: function () { return client_1.CANCELLED_MESSAGE; } });
Object.defineProperty(exports, "GENERIC_ERROR_MESSAGE", { enumerable: true, get: function () { return client_1.GENERIC_ERROR_MESSAGE; } });
Object.defineProperty(exports, "NETWORK_ERROR_MESSAGE", { enumerable: true, get: function () { return client_1.NETWORK_ERROR_MESSAGE; } });
const MAX_RESPONSE_BODY_LENGTH = 64 * 1024;
async function resultFromResponse(response, options = {}) {
    if (!response.ok)
        return failureFromResponse(response);
    const body = await readJson(response);
    if (!body.ok)
        return (0, client_1.unexpectedFailure)();
    try {
        const value = options.decode ? options.decode(body.value) : body.value;
        return (0, client_1.success)(value);
    }
    catch {
        return (0, client_1.unexpectedFailure)();
    }
}
async function emptyResultFromResponse(response) {
    return response.ok ? (0, client_1.success)() : failureFromResponse(response);
}
function resultFromRequestError(error) {
    if (isAbortError(error))
        return (0, client_1.cancelled)();
    return (0, client_1.networkFailure)();
}
async function failureFromResponse(response) {
    if (response.status === 422) {
        const body = await readJson(response);
        if (body.ok && isValidationBody(body.value)) {
            const errors = body.value.validationErrors.slice(0, 50).map((error) => ({
                field: safeField(error.field),
                message: error.message.trim(),
            }));
            const message = (0, client_1.isSafeMessage)(body.value.message) ? body.value.message.trim() : undefined;
            return (0, client_1.validationFailure)(errors, message);
        }
        return (0, client_1.failure)({ kind: "failure", code: "Validation.InvalidResponse", message: "Please review your input." });
    }
    const kind = kindForStatus(response.status);
    const fallback = messageForStatus(response.status);
    if (response.status >= 500 || response.status === 401 || response.status === 403) {
        return (0, client_1.failure)({ kind, code: `Http.${response.status}`, message: fallback });
    }
    const body = await readJson(response);
    if (body.ok && isErrorBody(body.value)) {
        return (0, client_1.failure)({ kind, code: body.value.code, message: body.value.message.trim() });
    }
    return (0, client_1.failure)({ kind, code: `Http.${response.status}`, message: fallback });
}
async function readJson(response) {
    try {
        const text = await response.text();
        if (text.length === 0 || text.length > MAX_RESPONSE_BODY_LENGTH)
            return { ok: false };
        return { ok: true, value: JSON.parse(text) };
    }
    catch {
        return { ok: false };
    }
}
function isErrorBody(value) {
    if (!isRecord(value))
        return false;
    return (0, client_1.isSafeMessage)(value.message) && (0, client_1.isPublicErrorCode)(value.code);
}
function isValidationBody(value) {
    if (!isRecord(value) || !Array.isArray(value.validationErrors) || value.validationErrors.length === 0)
        return false;
    if (value.message !== undefined && !(0, client_1.isSafeMessage)(value.message))
        return false;
    return value.validationErrors.every((item) => {
        if (!isRecord(item) || !(0, client_1.isSafeMessage)(item.message))
            return false;
        return item.field === undefined || item.field === null || safeField(item.field) !== null;
    });
}
function safeField(value) {
    if (typeof value !== "string")
        return null;
    const field = value.trim();
    return /^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(field) ? field : null;
}
function kindForStatus(status) {
    switch (status) {
        case 401: return "unauthorized";
        case 403: return "forbidden";
        case 404: return "not-found";
        case 409: return "conflict";
        case 429: return "rate-limited";
        default: return "failure";
    }
}
function messageForStatus(status) {
    switch (status) {
        case 401: return "Please sign in to continue.";
        case 403: return "You do not have permission to perform this action.";
        case 404: return "The requested item was not found.";
        case 409: return "The request conflicts with the current state.";
        case 429: return "Too many requests. Please wait and try again.";
        default: return client_1.GENERIC_ERROR_MESSAGE;
    }
}
function isAbortError(error) {
    return isRecord(error) && error.name === "AbortError";
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
