export function createPagedResponse(items, pageNumber, pageSize, totalCount) {
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
export class PagedRequestCoordinator {
    nextId = 0;
    currentId = 0;
    activeKeys = new Map();
    begin(key) {
        if (this.activeKeys.has(key))
            return null;
        const ticket = Object.freeze({ id: ++this.nextId, key });
        this.currentId = ticket.id;
        this.activeKeys.set(key, ticket.id);
        return ticket;
    }
    isCurrent(ticket) {
        return ticket.id === this.currentId;
    }
    complete(ticket) {
        if (this.activeKeys.get(ticket.key) === ticket.id) {
            this.activeKeys.delete(ticket.key);
        }
    }
    invalidate() {
        this.currentId = ++this.nextId;
        this.activeKeys.clear();
    }
}
