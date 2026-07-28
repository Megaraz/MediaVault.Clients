"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHttpResponse = toHttpResponse;
exports.toNoContentResponse = toNoContentResponse;
exports.toCreatedResponse = toCreatedResponse;
const Error_1 = require("./Error");
const HttpError_1 = require("./HttpError");
const Result_1 = require("./Result");
function mapFailure(result) {
    const primaryError = result.primaryError;
    const message = result.message;
    const validationErrorItems = result.validationErrors.map((x) => ({
        field: x.fieldName,
        message: x.userMessage
    }));
    const [statusCode, body] = buildFailureResponse(message, primaryError, validationErrorItems);
    return { statusCode, body };
}
function buildFailureResponse(message, primaryError, validationErrorItems) {
    switch (primaryError.type) {
        case Error_1.ErrorType.Validation:
            return [422, { message, validationErrors: validationErrorItems }];
        case Error_1.ErrorType.NotFound:
            return [404, { message, code: primaryError.code }];
        case Error_1.ErrorType.Conflict:
            return [409, { message, code: primaryError.code }];
        case Error_1.ErrorType.Unauthorized:
            return [401, { message, code: primaryError.code }];
        case Error_1.ErrorType.Forbidden:
            return [403, { message, code: primaryError.code }];
        case Error_1.ErrorType.Failure:
        case Error_1.ErrorType.Database:
            return [500, { message, code: primaryError.code }];
        case Error_1.ErrorType.Cancelled:
            return [503, { message, code: primaryError.code }];
        case Error_1.ErrorType.HttpError:
            return mapHttpErrorFailure(message, primaryError);
        default:
            return [400, { message, code: primaryError.code }];
    }
}
function mapHttpErrorFailure(message, error) {
    if (!(error instanceof HttpError_1.HttpError)) {
        return [502, { message, code: error.code }];
    }
    let statusCode = 502;
    switch (error.httpErrorType) {
        case HttpError_1.HttpErrorType.BadRequest:
            statusCode = 400;
            break;
        case HttpError_1.HttpErrorType.Unauthorized:
            statusCode = 401;
            break;
        case HttpError_1.HttpErrorType.Forbidden:
            statusCode = 403;
            break;
        case HttpError_1.HttpErrorType.NotFound:
            statusCode = 404;
            break;
        case HttpError_1.HttpErrorType.Conflict:
            statusCode = 409;
            break;
        case HttpError_1.HttpErrorType.UnprocessableContent:
            statusCode = 422;
            break;
        case HttpError_1.HttpErrorType.TooManyRequests:
            statusCode = 429;
            break;
        case HttpError_1.HttpErrorType.InternalServerError:
        case HttpError_1.HttpErrorType.MalformedResponse:
        case HttpError_1.HttpErrorType.UnexpectedStatusCode:
            statusCode = 502;
            break;
        case HttpError_1.HttpErrorType.TransportFailure:
            statusCode = 503;
            break;
        default:
            statusCode = 502;
            break;
    }
    return [statusCode, { message, code: error.code }];
}
function toHttpResponse(result) {
    if (result.isSuccess) {
        if (result instanceof Result_1.ResultOf) {
            return { statusCode: 200, body: result.value };
        }
        return { statusCode: 200 };
    }
    return mapFailure(result);
}
function toNoContentResponse(result) {
    if (result.isSuccess) {
        return { statusCode: 204 };
    }
    return mapFailure(result);
}
function toCreatedResponse(result, location) {
    if (result.isSuccess) {
        return { statusCode: 201, body: result.value, location };
    }
    return mapFailure(result);
}
