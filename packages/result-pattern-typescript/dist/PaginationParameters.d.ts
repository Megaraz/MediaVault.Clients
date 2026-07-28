export declare class PaginationParameters {
    readonly pageNumber: number;
    readonly pageSize: number;
    private constructor();
    static normalize(pageNumber: number, pageSize: number, maxPageSize?: number): PaginationParameters;
}
