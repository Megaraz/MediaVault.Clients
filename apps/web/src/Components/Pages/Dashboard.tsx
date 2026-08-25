// ─────────────────────────────────────────────────────────────
// Dashboard.tsx
//
// The main page the user lands on after logging in.
// Responsible for:
//   - Fetching all media entries for the logged-in user
//   - Rendering them grouped by status (On Going, Completed, etc.)
//   - Opening the create/edit modal
//   - Routing create/update calls to the correct type-specific client
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect, useRef, useState } from "react";
import { PagedRequestCoordinator } from "@mediavault/client-core";
import {
  MediaType,
  Status,
  type MediaEntryDetailedDto,
  type MediaEntryMinimalDto,
  type SeasonCreateDto,
  type SeasonUpdateDto,
} from "@mediavault/contracts";
import MediaEntriesClient from "../../Clients/MediaEntriesClient";
import MovieEntriesClient from "../../Clients/MovieEntriesClient";
import TvSeriesEntriesClient from "../../Clients/TvSeriesEntriesClient";
import GameEntriesClient from "../../Clients/GameEntriesClient";
import BookEntriesClient from "../../Clients/BookEntriesClient";
import MangaEntriesClient from "../../Clients/MangaEntriesClient";
import type { MediaEntryFormData } from "../MediaEntry/MediaEntryForm";
import type { SeasonFormData } from "../MediaEntry/SeasonSection";
import MediaEntryModal from "../MediaEntry/MediaEntryModal";
import { useUser } from "../../Shared/useUser";
import MainHeader from "../Dashboard/MainHeader";
import Sidebar from "../Dashboard/Sidebar";
import EntriesSectionMain from "../Dashboard/EntriesSectionMain";
import EntriesSectionSub from "../Dashboard/EntriesSectionSub";
import { ALL_MEDIA_TYPE, statusSections } from "../../Shared/mediaConstants";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const DEFAULT_API_DATE = "0001-01-01T00:00:00.000Z";

// The API's season request fields are non-required CLR value types. Omitting
// them previously made the server use Guid.Empty/DateTime.MinValue; retain
// those defaults while satisfying the shared contract's explicit fields.
function toSeasonCreateDto(
  season: SeasonFormData,
  tvSeriesId: string,
): SeasonCreateDto {
  return {
    tvSeriesId,
    idExternal: season.idExternal ?? null,
    name: season.name || null,
    overview: season.overview || null,
    imageUrl: season.imageUrl || null,
    seasonNumber: parseInt(season.seasonNumber) || 0,
    airDate: season.airDate || null,
    watchedEpisodes: parseInt(season.watchedEpisodes) || 0,
    episodes: parseInt(season.episodes) || 0,
    status: season.status as Status,
    rating: season.rating,
    createdAtUtc: season.createdAtUtc ?? DEFAULT_API_DATE,
    updatedAtUtc: season.updatedAtUtc ?? DEFAULT_API_DATE,
  };
}

function toSeasonUpdateDto(
  season: SeasonFormData,
  entryId: string,
): SeasonUpdateDto {
  return {
    id: season.id ?? EMPTY_GUID,
    ...toSeasonCreateDto(season, season.tvSeriesId ?? entryId),
  };
}

export default function Dashboard() {
  const { currentUser, isAuthenticated } = useUser();
  const [entries, setEntries] = useState<MediaEntryMinimalDto[]>([]);
  // One shared client for type-agnostic operations (fetch all, fetch by id, delete, search).
  // Separate clients for create/update because each media type has its own endpoint.
  const [client] = useState(() => new MediaEntriesClient());
  const [movieClient] = useState(() => new MovieEntriesClient());
  const [tvSeriesClient] = useState(() => new TvSeriesEntriesClient());
  const [gameClient] = useState(() => new GameEntriesClient());
  const [bookClient] = useState(() => new BookEntriesClient());
  const [mangaClient] = useState(() => new MangaEntriesClient());
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const requestCoordinator = useRef(new PagedRequestCoordinator());
  const requestController = useRef<AbortController | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MediaEntryDetailedDto>();
  // The currently active media type filter driven by the sidebar.
  // -1 (the local ALL_MEDIA_TYPE sentinel) means show all types.
  const [mainMediaTypeFilter, setMainMediaTypeFilter] = useState<number>(
    ALL_MEDIA_TYPE,
  );

  const fetchMediaEntries = useCallback(async (requestedPage: number) => {
    if (!isAuthenticated || !currentUser) return;

    const ticket = requestCoordinator.current.begin(`library:${requestedPage}`);
    if (!ticket) return;

    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setLoading(true);
    setError(null);
    setPageNumber(requestedPage);
    try {
      const fetched = await client.getMediaEntries(requestedPage, 25, controller.signal);
      if (!requestCoordinator.current.isCurrent(ticket)) return;

      setEntries(fetched.items);
      setPageNumber(fetched.pageNumber);
      setTotalPages(fetched.totalPages);
    } catch (err) {
      if (requestCoordinator.current.isCurrent(ticket)) {
        setError((err as Error).message);
      }
    } finally {
      requestCoordinator.current.complete(ticket);
      if (requestCoordinator.current.isCurrent(ticket)) setLoading(false);
    }
  }, [client, currentUser, isAuthenticated]);

  useEffect(() => {
    const coordinator = requestCoordinator.current;
    void fetchMediaEntries(1);
    return () => {
      requestController.current?.abort();
      coordinator.invalidate();
    };
  }, [fetchMediaEntries]);

  const loadDetailedEntry = async (
    entry: Pick<MediaEntryMinimalDto, "id" | "mediaType">,
  ): Promise<MediaEntryDetailedDto> => {
    switch (entry.mediaType) {
      case MediaType.Movie:
        return client.getMovieById(entry.id);
      case MediaType.TvSeries:
        return client.getTvSeriesById(entry.id);
      case MediaType.Game:
        return client.getGameById(entry.id);
      case MediaType.Book:
        return client.getBookById(entry.id);
      case MediaType.Manga:
        return client.getMangaById(entry.id);
      default:
        throw new Error("Unknown media type: " + entry.mediaType);
    }
  };

  // Opens the modal pre-populated with the clicked entry's data.
  const onClickEntry = async (entry: MediaEntryMinimalDto) => {
    setError(null);
    setSelectedEntry(undefined);

    try {
      const detailedEntry = await loadDetailedEntry(entry);
      setSelectedEntry(detailedEntry);
      setShowPopup(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Opens the modal in create mode (no pre-populated entry).
  const onClickCreateEntry = () => {
    if (!currentUser) {
      setError(
        "Select a user from the Users API Test page before creating media entries.",
      );
      return;
    }
    setShowPopup(true);
  };

  // Handles both create (no entryId) and update (entryId provided).
  // Builds shared base fields, then adds type-specific fields and routes
  // to the correct client method based on formData.mediaType.
  const handleSubmitMediaEntry = async (
    formData: MediaEntryFormData,
    entryId?: string,
  ) => {
    if (!isAuthenticated || !currentUser) {
      setError(
        "Select a user from the Users API Test page before saving media entries.",
      );
      throw new Error(
        "Select a user from the Users API Test page before saving media entries.",
      );
    }

    // Fields shared by all media types.
    const baseFields = {
      idExternal: formData.idExternal ?? null,
      title: formData.title ?? "",
      status: formData.status as Status,
      rating: formData.rating,
      imageUrl: formData.imageUrl?.trim() || null,
      review: formData.review || null,
      overview: formData.overview || null,
      genres: formData.genres.map((genre) => genre.trim()).filter(Boolean),
      ...(formData.releaseDate ? { releaseDate: formData.releaseDate } : {}),
    };

    const gamePlatforms = formData.platforms
      ? formData.platforms
          .split(",")
          .map((platform) => platform.trim())
          .filter(Boolean)
      : undefined;

    setLoading(true);
    setError(null);
    try {
      if (entryId) {
        // ── UPDATE ──
        // After updating, re-fetch the full entry from the server to get
        // the latest data (including any server-side changes) and update local state.
        switch (formData.mediaType) {
          case MediaType.Movie:
            await movieClient.updateMovie(entryId, {
              ...baseFields,
              runtimeMinutes: Number(formData.runtimeMinutes) || 0,
            });
            break;
          case MediaType.TvSeries:
            await tvSeriesClient.updateTvSeries(entryId, {
              ...baseFields,
              numberOfSeasons: Number(formData.numberOfSeasons) || 0,
              numberOfEpisodes: Number(formData.numberOfEpisodes) || 0,
              totalWatchedEpisodes: Number(formData.totalWatchedEpisodes) || 0,
              backdropImageUrl: formData.backdropImageUrl ?? null,
              lastAirDate: formData.lastAirDate ?? null,
              airingStatus: formData.airingStatus ?? null,
              seasons: (formData.seasons ?? []).map((season) =>
                toSeasonUpdateDto(season, entryId),
              ),
            });
            break;
          case MediaType.Game:
            await gameClient.updateGame(entryId, {
              ...baseFields,
              hoursPlayed: Number(formData.hoursPlayed) || 0,
              metacriticRating: formData.metacriticRating ?? 0,
              website: formData.website?.trim() || undefined,
              platforms: gamePlatforms,
            });
            break;
          case MediaType.Book:
            await bookClient.updateBook(entryId, {
              ...baseFields,
              author: formData.author || null,
            });
            break;
          case MediaType.Manga:
            await mangaClient.updateManga(entryId, {
              ...baseFields,
              author: formData.author || null,
            });
            break;
          default:
            throw new Error("Unknown media type: " + formData.mediaType);
        }
        const fetched = await loadDetailedEntry({
          id: entryId,
          mediaType: formData.mediaType as MediaType,
        });
        setEntries((prev) => prev.map((e) => (e.id === entryId ? fetched : e)));
      } else {
        // ── CREATE ──
        // Add the new entry to local state immediately after the server confirms it.
        let created: MediaEntryDetailedDto;
        switch (formData.mediaType) {
          case MediaType.Movie:
            created = await movieClient.createMovie({
              ...baseFields,
              runtimeMinutes: Number(formData.runtimeMinutes) || 0,
            });
            break;
          case MediaType.TvSeries:
            created = await tvSeriesClient.createTvSeries({
              ...baseFields,
              numberOfSeasons: Number(formData.numberOfSeasons) || 0,
              numberOfEpisodes: Number(formData.numberOfEpisodes) || 0,
              totalWatchedEpisodes: Number(formData.totalWatchedEpisodes) || 0,
              backdropImageUrl: formData.backdropImageUrl ?? null,
              lastAirDate: formData.lastAirDate ?? null,
              airingStatus: formData.airingStatus ?? null,
              seasons: (formData.seasons ?? []).map((season) =>
                toSeasonCreateDto(season, EMPTY_GUID),
              ),
            });
            break;
          case MediaType.Game:
            created = await gameClient.createGame({
              ...baseFields,
              hoursPlayed: Number(formData.hoursPlayed) || 0,
              metacriticRating: formData.metacriticRating ?? 0,
              website: formData.website?.trim() || undefined,
              platforms: gamePlatforms,
            });
            break;
          case MediaType.Book:
            created = await bookClient.createBook({
              ...baseFields,
              author: formData.author || null,
            });
            break;
          case MediaType.Manga:
            created = await mangaClient.createManga({
              ...baseFields,
              author: formData.author || null,
            });
            break;
          default:
            throw new Error("Unknown media type: " + formData.mediaType);
        }
        setEntries((prev) => [...prev, created]);
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMediaEntry = async (entryId: string) => {
    if (!isAuthenticated || !currentUser) {
      setError(
        "Select a user from the Users API Test page before deleting media entries.",
      );
      throw new Error(
        "Select a user from the Users API Test page before deleting media entries.",
      );
    }

    setLoading(true);
    setError(null);
    try {
      await client.deleteMediaEntry(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetches the full detailed entry for a search result and opens the edit modal.
  const handleSelectSearchResult = async (minimalEntry: MediaEntryMinimalDto) => {
    setError(null);
    setSelectedEntry(undefined);

    try {
      const detailed = await loadDetailedEntry(minimalEntry);
      setSelectedEntry(detailed);
      setShowPopup(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onChangeMainMediaTypeFilter = (mediaType: number | undefined) => {
    setMainMediaTypeFilter(mediaType ?? ALL_MEDIA_TYPE);
  };

  const onCancel = () => {
    setShowPopup(false);
    setSelectedEntry(undefined);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow">
          {/* Media Entry Modal Popup Window */}
          {showPopup && (
            <MediaEntryModal
              key={selectedEntry?.id ?? "new-entry"}
              detailedEntry={selectedEntry}
              onCancel={onCancel}
              onSubmit={handleSubmitMediaEntry}
              onDelete={handleDeleteMediaEntry}
            />
          )}

          {/* Sidebar */}
          <Sidebar
            currentMainMediaTypeFilter={mainMediaTypeFilter}
            onChangeMediaTypeFilter={onChangeMainMediaTypeFilter}
          />

          {/* <!-- Main Content Area --> */}
          <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            {/* Main Header for Dashboard with search and add entry button */}
            <MainHeader
              onClickAddEntry={onClickCreateEntry}
              onSelectSearchResult={handleSelectSearchResult}
            />

            {/* Each section shows entries for one status value.
                Backlog gets a compact "list" view; all other statuses get the card grid. */}
            {isLoading && entries.length === 0 && (
              <div className="flex flex-1 items-center justify-center p-12" role="status">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                <span className="ml-3">Loading your library…</span>
              </div>
            )}

            {error && (
              <div className="m-8 rounded-lg border border-red-300 bg-red-50 p-5 text-red-900" role="alert">
                <p>We could not load your library. {error}</p>
                <button
                  type="button"
                  className="mt-3 rounded bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50"
                  disabled={isLoading}
                  onClick={() => void fetchMediaEntries(pageNumber)}
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !error && entries.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-400">video_library</span>
                <h2 className="mt-4 text-xl font-bold">Your library is empty</h2>
                <p className="mt-2 text-slate-500">Add your first entry to start building your collection.</p>
              </div>
            )}

            {entries.length > 0 && (
              <>
                {statusSections.map(({ type, title }) => {
                  const sectionEntriesByStatus = entries.filter(
                    (e) => e.status === type,
                  );

                  return type === Status.Backlog ? (
                    <EntriesSectionSub
                      key={type}
                      mediaEntries={sectionEntriesByStatus}
                      onClickEntry={onClickEntry}
                      statusSectionType={title}
                      currentMainMediaTypeFilter={mainMediaTypeFilter}
                    />
                  ) : (
                    <EntriesSectionMain
                      key={type}
                      mediaEntries={sectionEntriesByStatus}
                      onClickEntry={onClickEntry}
                      statusSectionType={title}
                      currentMainMediaTypeFilter={mainMediaTypeFilter}
                    />
                  );
                })}
              </>
            )}

            {!error && totalPages > 0 && (
              <nav className="flex items-center justify-center gap-4 p-8" aria-label="Library pages">
                <button
                  type="button"
                  className="rounded border border-slate-300 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                  disabled={isLoading || pageNumber <= 1}
                  onClick={() => void fetchMediaEntries(pageNumber - 1)}
                >
                  Previous
                </button>
                <span aria-live="polite">{isLoading ? "Loading page…" : `Page ${pageNumber} of ${totalPages}`}</span>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                  disabled={isLoading || pageNumber >= totalPages}
                  onClick={() => void fetchMediaEntries(pageNumber + 1)}
                >
                  Next
                </button>
              </nav>
            )}

            {/* <!-- Sticky Mobile Nav --> */}
            <div className="lg:hidden sticky bottom-0 z-20 w-full flex items-center justify-around p-3 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800">
              <button className="p-2 text-primary">
                <span className="material-symbols-outlined">dashboard</span>
              </button>
              <button className="p-2 text-slate-500">
                <span className="material-symbols-outlined">library_books</span>
              </button>
              <button className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white shadow-lg shadow-primary/30 -mt-8">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button className="p-2 text-slate-500">
                <span className="material-symbols-outlined">insights</span>
              </button>
              <button className="p-2 text-slate-500">
                <span className="material-symbols-outlined">person</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
