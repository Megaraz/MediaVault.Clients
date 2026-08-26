import { MAXIMUM_RATING, RATING_STEP, isValidRating } from '@mediavault/client-core';

type StarRatingProps = {
  rating: number;
  onChange: (newRating: number) => void;
  labelledBy?: string;
};

function displayRating(rating: number) {
  return isValidRating(rating) ? rating : 0;
}

export default function StarRating({
  rating,
  onChange,
  labelledBy,
}: StarRatingProps) {
  const normalizedRating = displayRating(rating);

  return (
    <div
      className="flex items-center gap-1 text-amber-400"
      role="group"
      aria-labelledby={labelledBy}
      aria-label={`Rating: ${normalizedRating.toFixed(1)} out of ${MAXIMUM_RATING.toFixed(1)} stars`}
    >
      {Array.from({ length: MAXIMUM_RATING }, (_, i) => {
        const starValue = i + 1;
        const fillWidth = Math.max(
          0,
          Math.min((normalizedRating - i) * 100, 100),
        );

        return (
          <button
            key={starValue}
            className="relative hover:scale-110 transition-transform"
            type="button"
            aria-label={`Set rating to ${starValue} stars`}
            aria-pressed={normalizedRating === starValue || normalizedRating === starValue - RATING_STEP}
            onClick={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              const isHalfStar = event.clientX - bounds.left < bounds.width / 2;
              onChange(isHalfStar ? starValue - 0.5 : starValue);
            }}
          >
            <span className="relative block text-3xl leading-none">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">
                star
              </span>
              <span
                className="pointer-events-none absolute inset-0 overflow-hidden text-amber-400"
                style={{ width: `${fillWidth}%` }}
              >
                <span className="material-symbols-outlined">star</span>
              </span>
            </span>
          </button>
        );
      })}
      <span className="ml-3 text-sm font-medium text-slate-500 dark:text-slate-400">
        {normalizedRating > 0
          ? `${normalizedRating.toFixed(1)} / ${MAXIMUM_RATING.toFixed(1)}`
          : "Not rated"}
      </span>
      <button
        className="ml-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        type="button"
        onClick={() => onChange(0)}
      >
        Clear
      </button>
    </div>
  );
}
