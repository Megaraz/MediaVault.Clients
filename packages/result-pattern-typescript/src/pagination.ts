export interface Pagination {
  readonly pageNumber: number;
  readonly pageSize: number;
}

export function normalizePagination(pageNumber: number, pageSize: number, maxPageSize = 100): Pagination {
  assertInteger(pageNumber, "pageNumber");
  assertInteger(pageSize, "pageSize");
  assertInteger(maxPageSize, "maxPageSize");
  if (maxPageSize < 1) throw new RangeError("maxPageSize must be at least 1.");

  return Object.freeze({
    pageNumber: Math.max(pageNumber, 1),
    pageSize: Math.min(Math.max(pageSize, 1), maxPageSize),
  });
}

function assertInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value)) throw new RangeError(`${name} must be a safe integer.`);
}
