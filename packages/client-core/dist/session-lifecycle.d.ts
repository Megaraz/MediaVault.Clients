export type SessionInvalidatedListener = () => void;
export declare class SessionTransitionCoordinator {
    private epoch;
    private readonly listeners;
    beginTransition(): number;
    isCurrent(transition: number): boolean;
    invalidate(): void;
    subscribe(listener: SessionInvalidatedListener): () => void;
}
//# sourceMappingURL=session-lifecycle.d.ts.map