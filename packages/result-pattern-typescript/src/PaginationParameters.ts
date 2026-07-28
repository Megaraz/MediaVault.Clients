export class PaginationParameters {
  public readonly pageNumber: number;
  public readonly pageSize: number;

  private constructor(pageNumber: number, pageSize: number) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }

  public static normalize(pageNumber: number, pageSize: number, maxPageSize = 100): PaginationParameters {
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
