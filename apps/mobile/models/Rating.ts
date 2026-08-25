import { isValidRating } from '@mediavault/client-core';

export class Rating {
  public readonly value: number;

  constructor(value: number) {
    if (!isValidRating(value)) {
      throw new RangeError('Rating must be between 0 and 5 in 0.5 increments.');
    }
    this.value = value;
  }

  public valueOf(): number {
    return this.value;
  }
}
