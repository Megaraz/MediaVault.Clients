export interface Pagination {
    readonly pageNumber: number;
    readonly pageSize: number;
}
export declare function normalizePagination(pageNumber: number, pageSize: number, maxPageSize?: number): Pagination;
