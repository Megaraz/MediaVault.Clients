const assert = require("node:assert/strict");
const test = require("node:test");

const {
  Error: ResultError,
  ErrorReasonCode,
  OperationType,
  PaginationParameters,
  Result,
  ResultOf,
  ValidationError,
  isNotValidId,
  isTooLow,
  toReasonCodePart
} = require("../dist");

const context = {
  layer: "Application",
  serviceName: "UsersService",
  methodName: "getById",
  operation: OperationType.Get,
  entityName: "User"
};

test("results preserve .NET success and failure invariants", () => {
  const success = Result.success();
  assert.equal(success.isSuccess, true);
  assert.equal(success.primaryError, ResultError.None);

  assert.throws(() => Result.failure(ResultError.None), /primary error/);

  const failure = ResultOf.failure(ResultError.notFound(context));
  assert.equal(failure.isFailure, true);
  assert.throws(() => failure.value, /Cannot access value/);
});

test("validation-error collections are copied and immutable", () => {
  const error = ValidationError.required({ ...context, fieldName: "email" });
  const source = [error];
  const result = Result.validationFailure(source);

  source.pop();
  assert.equal(result.validationErrors.length, 1);
  assert.throws(() => result.validationErrors.push(error), TypeError);
});

test("validation helpers return a usable failed discriminator", () => {
  const check = isNotValidId(0, context);
  assert.equal(check.failed, true);
  assert.equal(check.error.fieldName, "id");
  assert.equal(isNotValidId("00000000-0000-0000-0000-000000000000", context).failed, true);
  assert.throws(() => isTooLow(Number.NaN, 1, context), RangeError);
});

test("pagination accepts only values representable by the .NET integer API", () => {
  const normalized = PaginationParameters.normalize(0, 999);
  assert.equal(normalized.pageNumber, 1);
  assert.equal(normalized.pageSize, 100);
  assert.throws(() => PaginationParameters.normalize(1.5, 10), RangeError);
  assert.throws(() => PaginationParameters.normalize(1, 10, 0), RangeError);
});

test("error factories do not render missing fields as undefined", () => {
  const error = ValidationError.invalidFormat(context, "email");
  assert.match(error.userMessage, /field ''/);
  assert.doesNotMatch(error.userMessage, /undefined/);
});

test("the reason-code extension has a standalone module export", () => {
  assert.equal(toReasonCodePart(ErrorReasonCode.ValidationRequired), "Required");
  assert.equal(
    require("../dist/ErrorReasonCodeExtensions").toReasonCodePart(ErrorReasonCode.HttpNotFound),
    "NotFound"
  );
});
