"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationParameters = void 0;
class PaginationParameters {
    pageNumber;
    pageSize;
    constructor(pageNumber, pageSize) {
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
    }
    static normalize(pageNumber, pageSize, maxPageSize = 100) {
        if (!Number.isSafeInteger(pageNumber) || !Number.isSafeInteger(pageSize)) {
            throw new RangeError("pageNumber and pageSize must be safe integers.");
        }
        if (!Number.isSafeInteger(maxPageSize) || maxPageSize < 1) {
            throw new RangeError("maxPageSize must be a positive safe integer.");
        }
        let normalizedPageNumber = pageNumber;
        let normalizedPageSize = pageSize;
        if (normalizedPageNumber < 1) {
            normalizedPageNumber = 1;
        }
        if (normalizedPageSize < 1) {
            normalizedPageSize = 1;
        }
        if (normalizedPageSize > maxPageSize) {
            normalizedPageSize = maxPageSize;
        }
        return new PaginationParameters(normalizedPageNumber, normalizedPageSize);
    }
}
exports.PaginationParameters = PaginationParameters;
