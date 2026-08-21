export type SessionInvalidatedListener = () => void;

export class SessionTransitionCoordinator {
  private epoch = 0;
  private readonly listeners = new Set<SessionInvalidatedListener>();

  beginTransition(): number {
    this.epoch += 1;
    return this.epoch;
  }

  isCurrent(transition: number): boolean {
    return transition === this.epoch;
  }

  invalidate(): void {
    this.epoch += 1;
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: SessionInvalidatedListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
