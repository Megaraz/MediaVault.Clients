/**
 * API-authoritative rating policy. The backend accepts values from zero through
 * five, in half-star increments, for media entries and seasons.
 */
export declare const MINIMUM_RATING = 0;
export declare const MAXIMUM_RATING = 5;
export declare const RATING_STEP = 0.5;
export declare const RATING_VALUES: readonly [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
export declare function isValidRating(value: number): boolean;
//# sourceMappingURL=rating.d.ts.map