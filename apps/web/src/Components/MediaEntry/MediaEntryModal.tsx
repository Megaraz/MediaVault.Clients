// ─────────────────────────────────────────────────────────────
// MediaEntryModal.tsx
//
// The modal dialog used for both creating and editing a media entry.
// It owns the form state and handles the submit/delete flow.
//
// When opened for editing, detailedEntry is provided and the form
// is pre-populated from it (including type-specific fields).
// When opened for creating, detailedEntry is undefined.
//
// After a successful save or delete, a brief success screen is shown
// before the modal closes automatically.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  MediaType,
  type BookEntryDetailedDto,
  type GameEntryDetailedDto,
  type MangaEntryDetailedDto,
  type MediaEntryDetailedDto,
  type MovieEntryDetailedDto,
  type TvSeriesEntryDetailedDto,
} from "@mediavault/contracts";
import {
  mapRawgGameMetadata,
  mapTmdbMovieMetadata,
  mapTmdbTvSeriesMetadata,
} from "@mediavault/client-core";
import { ALL_MEDIA_TYPE } from "../../Shared/mediaConstants";
import DetailedHeader from "./DetailedHeader";
import MediaEntryForm from "./MediaEntryForm";
import type { MediaEntryFormData } from "./MediaEntryForm";
import type { SeasonFormData } from "./SeasonSection";
import FormFooter from "./FormFooter";
import ModalWindow from "../Shared/ModalWindow";
import type { SearchResult } from "./TitleSearchInput";
import TmdbApiClient from "../../Clients/TmdbApiClient";
import type { GoogleBooksSearchResult } from "../../Clients/GoogleBooksApiClient";
import RawgApiClient from "../../Clients/RawgApiClient";

// How long to show the success screen before closing the modal.
const SUCCESS_STATE_DELAY_MS = 1000;

type MediaEntryProps = {
  detailedEntry?: MediaEntryDetailedDto;
  onSubmit: (formData: MediaEntryFormData, entryId?: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onCancel: () => void;
};

type MediaEntryFormValue = string | number | string[] | null;

// Pre-populate form data from an existing entry when in edit mode.
// We cast the base entry to each specific sub-type to safely read
// type-specific fields — fields that don't exist will simply be undefined.
function buildInitialFormData(
  entry?: MediaEntryDetailedDto,
): MediaEntryFormData {
  const movie = entry as MovieEntryDetailedDto | undefined;
  const series = entry as TvSeriesEntryDetailedDto | undefined;
  const game = entry as GameEntryDetailedDto | undefined;
  const book = entry as BookEntryDetailedDto | undefined;
  const manga = entry as MangaEntryDetailedDto | undefined;

  return {
    idExternal: entry?.idExternal ?? null,
    title: entry?.title ?? "",
    imageUrl: entry?.imageUrl ?? "",
    backdropUrl: "",
    mediaType: entry?.mediaType ?? ALL_MEDIA_TYPE, // -1 = no type selected yet (new entry sentinel)
    status: entry?.status ?? 0,
    rating: entry?.rating ?? 0,
    review: entry?.review ?? "",
    releaseDate: formatDateForInput(entry?.releaseDate),
    genres: entry?.genres ?? [],
    overview: entry?.overview ?? "",
    runtimeMinutes: movie?.runtimeMinutes?.toString() ?? "",
    numberOfEpisodes: series?.numberOfEpisodes?.toString() ?? "",
    totalWatchedEpisodes: series?.totalWatchedEpisodes?.toString() ?? "",
    numberOfSeasons: series?.numberOfSeasons?.toString() ?? "",
    backdropImageUrl: series?.backdropImageUrl ?? null,
    lastAirDate: series?.lastAirDate ?? null,
    airingStatus: series?.airingStatus ?? null,
    seasons: series?.seasons?.map((s) => ({
      id: s.id,
      tvSeriesId: s.tvSeriesId,
      idExternal: s.idExternal,
      seasonNumber: s.seasonNumber.toString(),
      name: s.name ?? "",
      overview: s.overview ?? "",
      imageUrl: s.imageUrl ?? "",
      airDate: s.airDate ? s.airDate.split("T")[0] : "",
      episodes: s.episodes.toString(),
      watchedEpisodes: s.watchedEpisodes.toString(),
      status: s.status,
      rating: s.rating,
      createdAtUtc: s.createdAtUtc,
      updatedAtUtc: s.updatedAtUtc,
    })) ?? [],
    metacriticRating: game?.metacriticRating ?? 0,
    hoursPlayed: game?.hoursPlayed?.toString() ?? "",
    platforms: game?.platforms?.join(", ") ?? "",
    website: game?.website ?? "",
    author: book?.author ?? manga?.author ?? "",
  };
}

function formatDateForInput(value?: string | null): string {
  if (!value) {
    return "";
  }

  return value.includes("T") ? value.split("T")[0] : value;
}

function formatSubtitle(entry?: MediaEntryDetailedDto): string | undefined {
  if (!entry) return undefined;
  const date = new Date(entry.createdAtUtc);
  return `Created ${date.toLocaleDateString()}`;
}

function normalizeGenres(value: string | string[] | null): string[] {
  if (Array.isArray(value)) {
    return value.map((genre) => genre.trim()).filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean);
}

export default function MediaEntryModal({
  detailedEntry,
  onSubmit,
  onDelete,
  onCancel,
}: MediaEntryProps) {
  const [formData, setFormData] = useState<MediaEntryFormData>(
    buildInitialFormData(detailedEntry),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [deleteSuccessState, setDeleteSuccessState] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [rawgClient] = useState(() => new RawgApiClient());
  const [tmdbClient] = useState(() => new TmdbApiClient());

  // isEditMode = true when we opened the modal by clicking an existing entry.
  const isEditMode = detailedEntry != null && detailedEntry.id != null;
  // isBusy prevents closing the modal while an async operation is running.
  const isBusy = isSubmitting || showSuccessState || deleteSuccessState;

  const handleChange = (
    field: keyof MediaEntryFormData,
    value: MediaEntryFormValue,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "genres" ? normalizeGenres(value as string | string[] | null) : value,
    }));
  };

  const handleSeasonsChange = (seasons: SeasonFormData[]) => {
    setFormData((prev) => ({ ...prev, seasons }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccessState(false);
    setSubmitError(null);

    try {
      await onSubmit(formData, detailedEntry?.id);
      setIsSubmitting(false);
      setShowSuccessState(true);
      await new Promise((resolve) => {
        window.setTimeout(resolve, SUCCESS_STATE_DELAY_MS);
      });
      onCancel();
    } catch (err) {
      setSubmitError((err as Error).message || "Failed to save entry.");
      setIsSubmitting(false);
      setShowSuccessState(false);
    }
  };

  const handleDelete = async () => {
    if (detailedEntry) {
      setIsSubmitting(true);
      setShowSuccessState(false);
      setDeleteSuccessState(false);
      setSubmitError(null);

      try {
        await onDelete(detailedEntry.id);
        setIsSubmitting(false);
        setShowSuccessState(true);
        setDeleteSuccessState(true);
        await new Promise((resolve) => {
          window.setTimeout(resolve, SUCCESS_STATE_DELAY_MS);
        });
        onCancel();
      } catch (err) {
        setSubmitError((err as Error).message || "Failed to delete entry.");
        setDeleteSuccessState(false);
        setIsSubmitting(false);
        setShowSuccessState(false);
      }
    }
  };

  function isGoogleBooksResult(
    result: SearchResult,
  ): result is GoogleBooksSearchResult {
    return "author" in result;
  }

  const handleSelectResult = (result: SearchResult) => {
    if (
      formData.mediaType === MediaType.Book ||
      formData.mediaType === MediaType.Manga
    ) {
      if (isGoogleBooksResult(result)) {
        handleChange("author", result.author);
      }
    }

    if (formData.mediaType === MediaType.Game) {
      rawgClient.getGameById(Number(result.idExternal)).then((game) => {
        const metadata = mapRawgGameMetadata(game);
        if (metadata.overview) handleChange("overview", metadata.overview);
        if (metadata.releaseDate)
          handleChange("releaseDate", formatDateForInput(metadata.releaseDate));
        if (metadata.imageUrl)
          handleChange("backdropUrl", metadata.imageUrl);
        handleChange("metacriticRating", metadata.metacriticRating);
        handleChange("platforms", metadata.platforms.join(", "));
        handleChange("website", metadata.website ?? "");
      });
    }

    if (formData.mediaType === MediaType.Movie) {
      tmdbClient.getMovieById(Number(result.idExternal)).then((movie) => {
        const metadata = mapTmdbMovieMetadata(movie);
        if (metadata.runtimeMinutes)
          handleChange("runtimeMinutes", metadata.runtimeMinutes.toString());
        if (metadata.backdropImageUrl)
          handleChange("backdropUrl", metadata.backdropImageUrl);
        if (metadata.releaseDate)
          handleChange("releaseDate", formatDateForInput(metadata.releaseDate));
        handleChange("genres", [...metadata.genres]);
        if (metadata.overview) handleChange("overview", metadata.overview);
      });
    }

    if (formData.mediaType === MediaType.TvSeries) {
      tmdbClient.getTvSeriesById(Number(result.idExternal)).then((series) => {
        const metadata = mapTmdbTvSeriesMetadata(series);
        setFormData((prev) => ({
          ...prev,
          overview: metadata.overview ?? prev.overview,
          releaseDate: metadata.releaseDate
            ? formatDateForInput(metadata.releaseDate)
            : prev.releaseDate,
          firstAirDate: metadata.releaseDate ?? prev.firstAirDate,
          lastAirDate: metadata.lastAirDate ?? prev.lastAirDate,
          backdropImageUrl: metadata.backdropImageUrl ?? prev.backdropImageUrl,
          genres: [...metadata.genres],
          numberOfEpisodes: metadata.numberOfEpisodes.toString(),
          numberOfSeasons: metadata.numberOfSeasons.toString(),
          airingStatus: metadata.airingStatus ?? prev.airingStatus,
          seasons: metadata.seasons.map((season) => ({
            seasonNumber: season.seasonNumber.toString(),
            name: season.name ?? "",
            overview: season.overview ?? "",
            imageUrl: season.imageUrl ?? "",
            airDate: season.airDate ? formatDateForInput(season.airDate) : "",
            episodes: season.episodes.toString(),
            watchedEpisodes: "0",
            status: 0,
            rating: 0,
          })),
        }));
      });
    }
  };

  return (
    <ModalWindow
      onClose={isBusy ? () => undefined : onCancel}
      overlayClassName={
        showSuccessState
          ? "fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          : undefined
      }
      cardClassName={
        showSuccessState
          ? "relative w-full max-w-md rounded-2xl border border-slate-800 bg-background-dark px-10 py-12 text-center shadow-2xl"
          : undefined
      }
    >
      {showSuccessState ? (
        <>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary">
            <span className="material-symbols-outlined text-5xl">check</span>
          </div>
          <h2 className="mb-3 text-3xl font-black tracking-tight text-white">
            {deleteSuccessState
              ? "Entry Deleted"
              : isEditMode
                ? "Entry Updated"
                : "Entry Created"}
          </h2>
          <p className="mb-8 text-base leading-relaxed text-slate-300">
            {deleteSuccessState
              ? "The entry was deleted successfully. Returning you to the dashboard now."
              : isEditMode
                ? "The entry was updated successfully. Returning you to the dashboard now."
                : "The entry was created successfully. Returning you to the dashboard now."}
          </p>
          <div className="flex flex-col gap-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="success-progress-bar h-full rounded-full bg-primary" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Redirecting to Dashboard
            </p>
          </div>
        </>
      ) : (
        <>
          <DetailedHeader
            isEditMode={isEditMode}
            subtitle={formatSubtitle(detailedEntry)}
            onCancel={onCancel}
            imgUrl={formData.imageUrl || undefined}
          />

          <div className="overflow-y-auto flex-1 min-h-0">
            <form className="space-y-6 p-6" onSubmit={handleSubmit}>
              <MediaEntryForm
                formData={formData}
                onChange={handleChange}
                onSeasonsChange={handleSeasonsChange}
                isEditMode={isEditMode}
                onSelectResult={handleSelectResult}
              />
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {submitError}
                </div>
              )}

              <FormFooter
                isEditMode={isEditMode}
                onDelete={isEditMode ? handleDelete : undefined}
                onCancel={onCancel}
              />
            </form>
          </div>
        </>
      )}
    </ModalWindow>
  );
}
