export class Rating {
  public readonly value: number;

  constructor(value: number) {
    const clamped = Math.min(5, Math.max(0, value));
    this.value = Math.round(clamped * 2) / 2;
  }

  public valueOf(): number {
    return this.value;
  }
}
