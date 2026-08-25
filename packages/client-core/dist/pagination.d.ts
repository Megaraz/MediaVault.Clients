import type { PagedResponseDto } from '@mediavault/contracts';
export declare function createPagedResponse<T>(items: T[], pageNumber: number, pageSize: number, totalCount: number): PagedResponseDto<T>;
export interface PagedRequestTicket {
    readonly id: number;
    readonly key: string;
}
export declare class PagedRequestCoordinator {
    private nextId;
    private currentId;
    private readonly activeKeys;
    begin(key: string): PagedRequestTicket | null;
    isCurrent(ticket: PagedRequestTicket): boolean;
    complete(ticket: PagedRequestTicket): void;
    invalidate(): void;
}
//# sourceMappingURL=pagination.d.ts.map