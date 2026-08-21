export class SessionTransitionCoordinator {
    epoch = 0;
    listeners = new Set();
    beginTransition() {
        this.epoch += 1;
        return this.epoch;
    }
    isCurrent(transition) {
        return transition === this.epoch;
    }
    invalidate() {
        this.epoch += 1;
        this.listeners.forEach((listener) => listener());
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}
