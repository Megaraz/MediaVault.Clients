// ─────────────────────────────────────────────────────────────
// MediaEntryForm.tsx
//
// Renders the input fields inside the create/edit modal.
// It is a "controlled component" — it does not manage its own state.
// The parent (MediaEntryModal) owns the form data and passes it down.
//
// Flow:
//   1. If no media type is selected yet (mediaType < 0), only the type
//      picker is shown so the user picks a type first.
//   2. Once a type is selected, the full form renders including
//      type-specific fields at the bottom (e.g. runtime for movies).
// ─────────────────────────────────────────────────────────────
import {
  MediaType,
} from "@mediavault/contracts";
import { ALL_MEDIA_TYPE, MediaTypeLabels, StatusLabels } from "../../Shared/mediaConstants";
import type { SelectOptionItem } from "../../Components/Shared/SelectOption";
import InputText from "../../Components/Shared/InputText";
import SelectOption from "../../Components/Shared/SelectOption";
import StarRating from "../../Components/Shared/StarRating";
import TitleSearchInput from "./TitleSearchInput";
import type { SearchResult } from "./TitleSearchInput";
import SeasonSection, { type SeasonFormData } from "./SeasonSection";

// All form fields in a single flat object.
// Type-specific fields (runtimeMinutes, author, etc.) are always present
// but only rendered and populated when the matching media type is selected.
export type MediaEntryFormData = {
  idExternal?: string | null;
  title?: string;
  imageUrl?: string;
  backdropUrl?: string;
  mediaType: number;
  status: number;
  rating: number;
  review: string;
  releaseDate?: string;
  genres: string[];
  overview?: string;
  // Movie-specific
  runtimeMinutes?: string;
  // TV Series-specific
  numberOfEpisodes?: string;
  totalWatchedEpisodes?: string; // How many the user has watched so far
  backdropImageUrl?: string | null;
  firstAirDate?: string | null;
  lastAirDate?: string | null;
  numberOfSeasons?: string;
  airingStatus?: string | null;
  seasons?: SeasonFormData[];
  // Game-specific
  metacriticRating?: number;
  hoursPlayed?: string;
  platforms?: string;
  website?: string;
  // Book / Manga-specific
  author?: string;
};

type MediaEntryFormValue = string | number | string[] | null;

type MediaEntryFormProps = {
  formData: MediaEntryFormData;
  onChange: (
    field: keyof MediaEntryFormData,
    value: MediaEntryFormValue,
  ) => void;
  onSeasonsChange: (seasons: SeasonFormData[]) => void;
  onSelectResult: (result: SearchResult) => void;
  isEditMode: boolean;
};

// Build dropdown option lists once (outside the component) so they
// are not recreated on every render.
const mediaTypeOptions: SelectOptionItem[] = [
  { value: ALL_MEDIA_TYPE, label: "-- Select Type of Media --" },
  ...Object.entries(MediaTypeLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  })),
];

const statusOptions: SelectOptionItem[] = Object.entries(StatusLabels).map(
  ([value, label]) => ({ value: Number(value), label }),
);

export default function MediaEntryForm({
  formData,
  onChange,
  onSeasonsChange,
  onSelectResult,
  isEditMode,
}: MediaEntryFormProps) {
  // Step 1: if no type chosen yet, only show the type selector.
  // mediaType -1 is the "not selected" sentinel set in buildInitialFormData.
  if (formData.mediaType < 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="material-symbols-outlined text-5xl text-primary">category</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            What are you adding?
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose a media type to get started
          </p>
        </div>
        <div className="w-full max-w-xs">
          <label htmlFor="entry-media-type" className="sr-only">Media type</label>
          <SelectOption
            id="entry-media-type"
            options={mediaTypeOptions}
            value={formData.mediaType}
            onChange={(val) => onChange("mediaType", Number(val))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── LEFT COLUMN: user-entered data ─────────────────────── */}
      <div className="flex flex-col gap-5">
        {/* Title */}
        <div>
          <label htmlFor="entry-title" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Entry Title
          </label>
          <TitleSearchInput
            id="entry-title"
            placeholder="e.g. Elden Ring, The Great Gatsby"
            titleInputValue={formData.title}
            onChange={(value) => onChange("title", value)}
            mediaType={formData.mediaType}
            isEditMode={isEditMode}
            onSelectResult={(result) => {
              onChange("idExternal", result.idExternal);
              onSelectResult(result);
              onChange("title", result.title);
              if (result.coverImageUrl)
                onChange("imageUrl", result.coverImageUrl);
            }}
          />
        </div>

        {/* Media Type + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="entry-media-type" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Media Type
            </label>
            <SelectOption
              id="entry-media-type"
              options={mediaTypeOptions}
              value={formData.mediaType}
              onChange={(val) => onChange("mediaType", Number(val))}
            />
          </div>
          <div>
            <label htmlFor="entry-status" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Status
            </label>
            <SelectOption
              id="entry-status"
              options={statusOptions}
              value={formData.status}
              onChange={(val) => onChange("status", Number(val))}
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <p id="entry-rating-label" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Rating
          </p>
          <StarRating
            rating={formData.rating}
            onChange={(val) => onChange("rating", val)}
            labelledBy="entry-rating-label"
          />
        </div>

        {/* Review */}
        <div>
          <label htmlFor="entry-review" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Your Review
          </label>
          <textarea
            id="entry-review"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
            placeholder="Write your thoughts here..."
            rows={6}
            value={formData.review}
            onChange={(e) => onChange("review", e.target.value)}
          />
        </div>
      </div>

      {/* ── RIGHT COLUMN: API metadata ──────────────────────────── */}
      <div className="flex flex-col gap-5">
        {/* Image URL */}
        <div>
          <label htmlFor="entry-image-url" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Image URL
          </label>
          <InputText
            id="entry-image-url"
            type="url"
            value={formData.imageUrl}
            placeholder="https://example.com/cover.jpg"
            onChange={(value) => onChange("imageUrl", value)}
          />
        </div>

        {/* Movie-specific fields */}
        {formData.mediaType === MediaType.Movie && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="entry-runtime" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Runtime (minutes)
                </label>
                <InputText
                  id="entry-runtime"
                  type="number"
                  value={formData.runtimeMinutes}
                  placeholder="e.g. 148"
                  onChange={(val) => onChange("runtimeMinutes", val)}
                />
              </div>
              <div>
                <label htmlFor="entry-release-date" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Release Date
                </label>
                <InputText
                  id="entry-release-date"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(val) => onChange("releaseDate", val)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="entry-genres" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Genres
              </label>
              <InputText
                id="entry-genres"
                value={formData.genres.join(", ")}
                placeholder="e.g. Action, Drama"
                onChange={(val) => onChange("genres", val)}
              />
            </div>
            <div>
              <label htmlFor="entry-overview" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Overview
              </label>
              <textarea
                id="entry-overview"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                placeholder="Short description of the movie..."
                rows={4}
                value={formData.overview ?? ""}
                onChange={(e) => onChange("overview", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="entry-backdrop-url" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Backdrop URL
              </label>
              <InputText
                id="entry-backdrop-url"
                type="url"
                value={formData.backdropUrl}
                placeholder="https://example.com/backdrop.jpg"
                onChange={(val) => onChange("backdropUrl", val)}
              />
            </div>
          </>
        )}

        {/* TV Series-specific fields */}
        {formData.mediaType === MediaType.TvSeries && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="entry-number-of-seasons" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Number of Seasons
                </label>
                <InputText
                  id="entry-number-of-seasons"
                  type="number"
                  value={formData.numberOfSeasons}
                  placeholder="e.g. 3"
                  onChange={(val) => onChange("numberOfSeasons", val)}
                />
              </div>
              <div>
                <label htmlFor="entry-number-of-episodes" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Total Episodes
                </label>
                <InputText
                  id="entry-number-of-episodes"
                  type="number"
                  value={formData.numberOfEpisodes}
                  placeholder="e.g. 24"
                  onChange={(val) => onChange("numberOfEpisodes", val)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="entry-series-genres" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Genres
              </label>
              <InputText
                id="entry-series-genres"
                value={formData.genres.join(", ")}
                placeholder="e.g. Drama, Thriller"
                onChange={(val) => onChange("genres", val)}
              />
            </div>
            <div>
              <label htmlFor="entry-watched-episodes" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Episodes Watched
              </label>
              <InputText
                id="entry-watched-episodes"
                type="number"
                value={formData.totalWatchedEpisodes}
                placeholder="e.g. 12"
                onChange={(val) => onChange("totalWatchedEpisodes", val)}
              />
            </div>
          </>
        )}

        {/* Game-specific fields */}
        {formData.mediaType === MediaType.Game && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="entry-hours-played" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Hours Played
                </label>
                <InputText
                  id="entry-hours-played"
                  type="number"
                  value={formData.hoursPlayed}
                  placeholder="e.g. 80"
                  onChange={(val) => onChange("hoursPlayed", val)}
                />
              </div>
              <div>
                <label htmlFor="entry-metacritic-rating" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Metacritic Rating
                </label>
                <InputText
                  id="entry-metacritic-rating"
                  type="number"
                  value={formData.metacriticRating?.toString()}
                  placeholder="e.g. 87"
                  onChange={(val) => onChange("metacriticRating", Number(val))}
                />
              </div>
            </div>
            <div>
              <label htmlFor="entry-game-release-date" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Release Date
              </label>
              <InputText
                id="entry-game-release-date"
                type="date"
                value={formData.releaseDate}
                onChange={(val) => onChange("releaseDate", val)}
              />
            </div>
            <div>
              <label htmlFor="entry-platforms" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Platforms
              </label>
              <InputText
                id="entry-platforms"
                value={formData.platforms}
                placeholder="e.g. PC, PlayStation 5"
                onChange={(val) => onChange("platforms", val)}
              />
            </div>
            <div>
              <label htmlFor="entry-game-overview" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Overview
              </label>
              <textarea
                id="entry-game-overview"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                placeholder="Short description of the game..."
                rows={4}
                value={formData.overview ?? ""}
                onChange={(e) => onChange("overview", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="entry-website" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Website
              </label>
              <InputText
                id="entry-website"
                type="url"
                value={formData.website}
                placeholder="https://example.com"
                onChange={(val) => onChange("website", val)}
              />
            </div>
          </>
        )}

        {/* Book / Manga-specific fields */}
        {(formData.mediaType === MediaType.Book ||
          formData.mediaType === MediaType.Manga) && (
          <div>
            <label htmlFor="entry-author" className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Author
            </label>
            <InputText
              id="entry-author"
              value={formData.author}
              placeholder="e.g. Kentaro Miura"
              onChange={(val) => onChange("author", val)}
            />
          </div>
        )}
      </div>

      {/* ── FULL WIDTH: Seasons section (TV Series only) ─────────── */}
      {formData.mediaType === MediaType.TvSeries && (
        <div className="col-span-full">
          <p className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Seasons
          </p>
          <SeasonSection
            seasons={formData.seasons ?? []}
            onSeasonsChange={onSeasonsChange}
          />
        </div>
      )}
    </div>
  );
}
