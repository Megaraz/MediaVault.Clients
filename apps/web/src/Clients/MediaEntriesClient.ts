// ─────────────────────────────────────────────────────────────
// MediaEntriesClient.ts
//
// Handles the shared (type-agnostic) API operations:
//   - GET all entries
//   - GET entry by ID
//   - POST search
//   - DELETE
//
// Create and update are intentionally NOT here because they are
// type-specific — each media type has its own endpoint and DTO.
// See MovieEntriesClient, GameEntriesClient etc. for those.
//
// Shared API contracts are imported directly from @mediavault/contracts by
// callers. This client owns only request execution and response handling.
// ─────────────────────────────────────────────────────────────
import type {
    BookEntryDetailedDto,
    GameEntryDetailedDto,
    MangaEntryDetailedDto,
    MediaEntryDetailedDto,
    MediaEntryMinimalDto,
    MovieEntryDetailedDto,
    SearchRequestDto,
    TvSeriesEntryDetailedDto,
} from "@mediavault/contracts";
import { apiFetch } from "./apiFetch";


export default class MediaEntriesClient {
    private baseUrl = "/mediaentries";

    async searchMediaEntries(
        request: SearchRequestDto,
        page: number = 1,
        pageSize: number = 10
    ): Promise<MediaEntryMinimalDto[]> {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("pageSize", pageSize.toString());

        const response = await apiFetch(`${this.baseUrl}/search?${params}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to search media entries: " + errorMessage);
        }

        return response.json();
    }

    async getMediaEntries(pageNumber = 1, pageSize = 25): Promise<MediaEntryMinimalDto[]> {
        const response = await apiFetch(
            `${this.baseUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to fetch media entries: " + errorMessage);
        }
        return response.json();
    }

    async getMangaById(entryId: string): Promise<MangaEntryDetailedDto> {
        const response = await apiFetch(`${this.baseUrl}/manga/${entryId}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to fetch media entry: " + errorMessage);
        }
        return response.json();
    }
    async getTvSeriesById(entryId: string): Promise<TvSeriesEntryDetailedDto> {
        const response = await apiFetch(`${this.baseUrl}/tv-series/${entryId}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to fetch media entry: " + errorMessage);
        }
        return response.json();
    }
    async getMovieById(entryId: string): Promise<MovieEntryDetailedDto> {
        const response = await apiFetch(`${this.baseUrl}/movies/${entryId}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to fetch media entry: " + errorMessage);
        }
        return response.json();
    }
    async getGameById(entryId: string): Promise<GameEntryDetailedDto> {
        const response = await apiFetch(`${this.baseUrl}/games/${entryId}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to fetch media entry: " + errorMessage);
        }
        return response.json();
    }

    async getBookById(entryId: string): Promise<BookEntryDetailedDto> {
        const response = await apiFetch(`${this.baseUrl}/books/${entryId}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to fetch media entry: " + errorMessage);
        }
        return response.json();
    }

    async getMediaEntryById(entryId: string): Promise<MediaEntryDetailedDto> {
        const response = await apiFetch(`${this.baseUrl}/${entryId}`);
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to fetch media entry: " + errorMessage);
        }
        return response.json();
    }

    async deleteMediaEntry(entryId: string): Promise<void> {
        const response = await apiFetch(`${this.baseUrl}/${entryId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error("Failed to delete media entry: " + errorMessage);
        }
    }

}
