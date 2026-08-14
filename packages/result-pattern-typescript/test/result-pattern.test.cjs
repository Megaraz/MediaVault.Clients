const assert = require("node:assert/strict");
const test = require("node:test");

const {
  CANCELLED_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  errorsByField,
  failure,
  flatMap,
  map,
  match,
  normalizePagination,
  resultFromRequestError,
  resultFromResponse,
  success,
  unexpectedFailure,
  validationFailure,
  valueOr,
} = require("../dist");

test("success is an immutable discriminated value", () => {
  const result = success({ id: 7 });
  assert.deepEqual(result, { ok: true, value: { id: 7 } });
  assert.equal(Object.isFrozen(result), true);
  assert.deepEqual(success(), { ok: true, value: undefined });
  assert.throws(() => success(null), /requires a value/);
});

test("failure retains only a stable public code and safe user message", () => {
  const result = failure({ kind: "not-found", code: "Get.MediaEntry.NotFound", message: "Entry not found." });
  assert.deepEqual(result, {
    ok: false,
    error: { kind: "not-found", code: "Get.MediaEntry.NotFound", message: "Entry not found." },
    validationErrors: [],
  });
  assert.equal("cause" in result.error, false);
  assert.equal("description" in result.error, false);
  assert.equal("stack" in result.error, false);
  assert.equal(Object.isFrozen(result.validationErrors), true);
  assert.throws(
    () => failure({ kind: "failure", code: "bad code with secret=abc", message: "No" }),
    /public identifier/,
  );
  assert.throws(
    () => failure({ kind: "failure", code: "Client.Bad", message: "unsafe\nmessage" }),
    /user message/,
  );
});

test("unexpected failures never accept or expose thrown diagnostics", () => {
  const result = unexpectedFailure(new Error("password=do-not-leak"));
  assert.equal(result.error.message, GENERIC_ERROR_MESSAGE);
  assert.doesNotMatch(JSON.stringify(result), /password|do-not-leak/);
});

test("validation failures copy and freeze field-safe errors", () => {
  const source = [{ field: "email", message: "Enter a valid email." }];
  const result = validationFailure(source);
  source.pop();
  assert.equal(result.ok, false);
  assert.equal(result.validationErrors.length, 1);
  assert.equal(Object.isFrozen(result.validationErrors), true);
  assert.deepEqual(errorsByField(result), { email: ["Enter a valid email."] });
  const prototypeNamedField = validationFailure([{ field: "constructor", message: "Invalid value." }]);
  assert.deepEqual(errorsByField(prototypeNamedField), { constructor: ["Invalid value."] });
  assert.throws(() => validationFailure([]), /at least one/);
  assert.throws(
    () => validationFailure([{ field: "../../token", message: "Invalid" }]),
    /safe public property path/,
  );
});

test("map, flatMap, match, and valueOr are render-friendly", () => {
  const result = map(success(2), (value) => value * 3);
  assert.equal(valueOr(result, 0), 6);
  assert.equal(flatMap(result, (value) => success(String(value))).value, "6");
  assert.equal(match(result, { success: (value) => `value:${value}`, failure: () => "error" }), "value:6");

  const failed = failure({ kind: "conflict", code: "Update.Entry.Conflict", message: "Try again." });
  assert.equal(map(failed, () => 99), failed);
  assert.equal(valueOr(failed, 4), 4);
});

test("pagination matches the reviewed .NET clamping contract", () => {
  assert.deepEqual(normalizePagination(0, 999, 100), { pageNumber: 1, pageSize: 100 });
  assert.throws(() => normalizePagination(1.5, 10), /safe integer/);
  assert.throws(() => normalizePagination(1, 10, 0), /at least 1/);
});

test("HTTP success parses JSON without retaining the Response", async () => {
  const response = new Response(JSON.stringify({ id: 12 }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
  const result = await resultFromResponse(response, { decode: (body) => body });
  assert.deepEqual(result, { ok: true, value: { id: 12 } });
  assert.equal("response" in result, false);
});

test("expected MediaVault errors preserve only validated public fields", async () => {
  const response = new Response(JSON.stringify({
    message: "Entry not found.",
    code: "Get.MediaEntry.NotFound",
    debug: "connection-string=secret",
  }), { status: 404 });
  const result = await resultFromResponse(response);
  assert.equal(result.error.kind, "not-found");
  assert.equal(result.error.code, "Get.MediaEntry.NotFound");
  assert.equal(result.error.message, "Entry not found.");
  assert.doesNotMatch(JSON.stringify(result), /connection-string|secret|debug/);
});

test("validation responses map safe field messages without inventing public codes", async () => {
  const response = new Response(JSON.stringify({
    message: "Please correct the form.",
    validationErrors: [{ field: "email", message: "Email is required." }],
  }), { status: 422 });
  const result = await resultFromResponse(response);
  assert.equal(result.error.kind, "validation");
  assert.equal(result.error.code, "Validation.Failed");
  assert.deepEqual(result.validationErrors, [{ field: "email", message: "Email is required." }]);
});

test("server failures never expose ProblemDetails diagnostics", async () => {
  const response = new Response(JSON.stringify({
    title: "An unexpected error occurred.",
    detail: "SQL failed for user@example.com",
    traceId: "private-trace-id",
  }), { status: 500 });
  const result = await resultFromResponse(response);
  assert.equal(result.error.message, GENERIC_ERROR_MESSAGE);
  assert.equal(result.error.code, "Http.500");
  assert.doesNotMatch(JSON.stringify(result), /SQL|example|trace/);
});

test("authentication failures ignore server-controlled messages", async () => {
  const response = new Response(JSON.stringify({ message: "token signature detail", code: "Auth.Raw" }), { status: 401 });
  const result = await resultFromResponse(response);
  assert.equal(result.error.message, "Please sign in to continue.");
  assert.doesNotMatch(JSON.stringify(result), /signature|Auth.Raw/);
});

test("malformed and oversized responses collapse to a generic failure", async () => {
  const malformed = await resultFromResponse(new Response("not-json", { status: 200 }));
  assert.equal(malformed.error.message, GENERIC_ERROR_MESSAGE);

  const oversized = await resultFromResponse(new Response(`"${"x".repeat(70_000)}"`, { status: 200 }));
  assert.equal(oversized.error.message, GENERIC_ERROR_MESSAGE);
});

test("request errors distinguish cancellation without keeping exceptions", () => {
  const cancelledResult = resultFromRequestError(new DOMException("secret reason", "AbortError"));
  assert.equal(cancelledResult.error.kind, "cancelled");
  assert.equal(cancelledResult.error.message, CANCELLED_MESSAGE);
  assert.doesNotMatch(JSON.stringify(cancelledResult), /secret/);

  const networkResult = resultFromRequestError(new Error("private host name"));
  assert.equal(networkResult.error.kind, "network");
  assert.doesNotMatch(JSON.stringify(networkResult), /private host/);
});

test("legacy entry point remains isolated for existing Android imports", () => {
  const legacy = require("../dist/legacy");
  assert.equal(typeof legacy.Result.success, "function");
  assert.equal("ErrorLogger" in legacy, false);
  assert.equal("HttpResultMapper" in legacy, false);
});
