"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePagination = normalizePagination;
function normalizePagination(pageNumber, pageSize, maxPageSize = 100) {
    assertInteger(pageNumber, "pageNumber");
    assertInteger(pageSize, "pageSize");
    assertInteger(maxPageSize, "maxPageSize");
    if (maxPageSize < 1)
        throw new RangeError("maxPageSize must be at least 1.");
    return Object.freeze({
        pageNumber: Math.max(pageNumber, 1),
        pageSize: Math.min(Math.max(pageSize, 1), maxPageSize),
    });
}
function assertInteger(value, name) {
    if (!Number.isSafeInteger(value))
        throw new RangeError(`${name} must be a safe integer.`);
}
