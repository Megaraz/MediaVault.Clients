"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHttpResponseToResult = mapHttpResponseToResult;
exports.mapHttpResponseToResultWithoutValue = mapHttpResponseToResultWithoutValue;
const HttpError_1 = require("./HttpError");
const Result_1 = require("./Result");
async function mapHttpResponseToResult(response, errorContext) {
    if (!response) {
        return Result_1.ResultOf.failure(HttpError_1.HttpError.transportFailure(errorContext));
    }
    if (!response.ok) {
        const failureMessage = await getFailureMessage(response);
        return createHttpFailureResultOf(response.status, response.statusText, errorContext, failureMessage);
    }
    const responseBody = await readResponseBody(response);
    if (!responseBody || responseBody.trim().length === 0) {
        return Result_1.ResultOf.failure(HttpError_1.HttpError.malformedResponse(errorContext, undefined, `The external service returned ${response.status} (${response.statusText}) without the expected response body.`));
    }
    if (!hasJsonContentType(response)) {
        return Result_1.ResultOf.failure(HttpError_1.HttpError.malformedResponse(errorContext, undefined, `The external service returned ${response.status} (${response.statusText}) with unsupported content type '${response.headers.get("content-type") ?? "unknown"}'.`));
    }
    try {
        const value = JSON.parse(responseBody);
        if (value === null) {
            return Result_1.ResultOf.failure(HttpError_1.HttpError.malformedResponse(errorContext, undefined, `The external service returned ${response.status} (${response.statusText}) with an empty or invalid JSON body.`));
        }
        return Result_1.ResultOf.success(value);
    }
    catch (exception) {
        return Result_1.ResultOf.failure(HttpError_1.HttpError.malformedResponse(errorContext, exception, "The external service returned malformed JSON."));
    }
}
async function mapHttpResponseToResultWithoutValue(response, errorContext) {
    if (!response) {
        return Result_1.Result.failure(HttpError_1.HttpError.transportFailure(errorContext));
    }
    if (response.ok) {
        return Result_1.Result.success();
    }
    const failureMessage = await getFailureMessage(response);
    return createHttpFailureResult(response.status, response.statusText, errorContext, failureMessage);
}
function createHttpFailureResultOf(statusCode, statusText, errorContext, callerMessage) {
    return Result_1.ResultOf.failure(mapHttpError(statusCode, statusText, errorContext, callerMessage));
}
function createHttpFailureResult(statusCode, statusText, errorContext, callerMessage) {
    return Result_1.Result.failure(mapHttpError(statusCode, statusText, errorContext, callerMessage));
}
function mapHttpError(statusCode, statusText, errorContext, callerMessage) {
    switch (statusCode) {
        case 404:
            return HttpError_1.HttpError.notFound(errorContext, callerMessage);
        case 400:
            return HttpError_1.HttpError.badRequest(errorContext, callerMessage);
        case 422:
            return HttpError_1.HttpError.unprocessableContent(errorContext, callerMessage);
        case 409:
            return HttpError_1.HttpError.conflict(errorContext, callerMessage);
        case 401:
            return HttpError_1.HttpError.unauthorizedAccess(errorContext, callerMessage);
        case 403:
            return HttpError_1.HttpError.forbidden(errorContext, callerMessage);
        case 500:
            return HttpError_1.HttpError.internalServerError(errorContext, callerMessage);
        case 429:
            return HttpError_1.HttpError.tooManyRequests(errorContext, callerMessage);
        default:
            return HttpError_1.HttpError.unexpectedStatusCode(errorContext, statusCode, statusText);
    }
}
async function getFailureMessage(response) {
    const responseMessage = await tryGetResponseMessage(response);
    return buildFailureMessage(responseMessage, getDefaultFailureMessage(response.status), response.statusText);
}
function buildFailureMessage(responseMessage, defaultMessage, reasonPhrase) {
    return firstNonEmpty(responseMessage, defaultMessage, reasonPhrase, "An error occurred while calling the external service.");
}
function getDefaultFailureMessage(statusCode) {
    switch (statusCode) {
        case 400:
            return "The external service rejected the request.";
        case 401:
            return "The external service requires authentication.";
        case 403:
            return "The external service refused the request.";
        case 404:
            return "The requested resource was not found in the external service.";
        case 409:
            return "The external service reported a conflict.";
        case 422:
            return "The external service could not process the request.";
        case 500:
            return "The external service encountered an internal server error.";
        case 429:
            return "The external service has rate-limited this request.";
        default:
            return `The external service returned an unexpected HTTP status code ${statusCode}.`;
    }
}
function hasJsonContentType(response) {
    const mediaType = response.headers.get("content-type");
    return !mediaType || mediaType.trim().length === 0 || mediaType.toLowerCase().includes("json");
}
async function readResponseBody(response) {
    const text = await response.text();
    return text.length > 0 ? text : null;
}
async function tryGetResponseMessage(response) {
    const responseBody = await readResponseBody(response);
    if (!responseBody || responseBody.trim().length === 0) {
        return null;
    }
    try {
        const body = JSON.parse(responseBody);
        if (typeof body !== "object" || body === null || Array.isArray(body)) {
            return responseBody.trim();
        }
        for (const key of ["message", "detail", "title", "error", "error_description"]) {
            const value = body[key];
            if (typeof value === "string" && value.trim().length > 0) {
                return value;
            }
        }
        const errors = extractErrors(body["errors"]);
        if (errors && errors.trim().length > 0) {
            return errors;
        }
    }
    catch {
        return responseBody.trim();
    }
    return responseBody.trim();
}
function extractErrors(errors) {
    if (Array.isArray(errors)) {
        const messages = errors.filter((x) => typeof x === "string" && x.trim().length > 0);
        return messages.join(" ");
    }
    if (errors && typeof errors === "object") {
        const objectValues = Object.values(errors);
        const messages = [];
        for (const item of objectValues) {
            if (Array.isArray(item)) {
                for (const value of item) {
                    if (typeof value === "string" && value.trim().length > 0) {
                        messages.push(value);
                    }
                }
            }
        }
        return messages.join(" ");
    }
    return null;
}
function firstNonEmpty(...values) {
    for (const value of values) {
        if (value && value.trim().length > 0) {
            return value;
        }
    }
    return "An error occurred while calling the external service.";
}
