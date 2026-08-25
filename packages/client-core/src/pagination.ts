import type { PagedResponseDto } from '@mediavault/contracts';

export function createPagedResponse<T>(
  items: T[],
  pageNumber: number,
  pageSize: number,
  totalCount: number,
): PagedResponseDto<T> {
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
  return {
    items,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPreviousPage: pageNumber > 1 && totalPages > 0,
  };
}

export interface PagedRequestTicket {
  readonly id: number;
  readonly key: string;
}

export class PagedRequestCoordinator {
  private nextId = 0;
  private currentId = 0;
  private readonly activeKeys = new Map<string, number>();

  public begin(key: string): PagedRequestTicket | null {
    if (this.activeKeys.has(key)) return null;

    const ticket = Object.freeze({ id: ++this.nextId, key });
    this.currentId = ticket.id;
    this.activeKeys.set(key, ticket.id);
    return ticket;
  }

  public isCurrent(ticket: PagedRequestTicket): boolean {
    return ticket.id === this.currentId;
  }

  public complete(ticket: PagedRequestTicket): void {
    if (this.activeKeys.get(ticket.key) === ticket.id) {
      this.activeKeys.delete(ticket.key);
    }
  }

  public invalidate(): void {
    this.currentId = ++this.nextId;
    this.activeKeys.clear();
  }
}
