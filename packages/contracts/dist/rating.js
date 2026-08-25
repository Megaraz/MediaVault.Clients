/**
 * API-authoritative rating policy. The backend accepts values from zero through
 * five, in half-star increments, for media entries and seasons.
 */
export const MINIMUM_RATING = 0;
export const MAXIMUM_RATING = 5;
export const RATING_STEP = 0.5;
export const RATING_VALUES = Object.freeze([
    0,
    0.5,
    1,
    1.5,
    2,
    2.5,
    3,
    3.5,
    4,
    4.5,
    5,
]);
export function isValidRating(value) {
    return Number.isFinite(value)
        && value >= MINIMUM_RATING
        && value <= MAXIMUM_RATING
        && Number.isInteger(value / RATING_STEP);
}
