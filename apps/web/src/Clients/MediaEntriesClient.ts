import {
    MediaType,
    type BookEntryDetailedDto,
    type GameEntryDetailedDto,
    type MangaEntryDetailedDto,
    type MediaEntryMinimalDto,
    type MovieEntryDetailedDto,
    type SearchRequestDto,
    type TvSeriesEntryDetailedDto,
} from "@mediavault/contracts";
import {
    deleteMediaEntryOperation,
    mediaEntriesOperation,
    mediaEntryByIdOperation,
    searchMediaEntriesOperation,
} from "@mediavault/client-core";
import { executeWebOperation } from "./apiFetch";

export default class MediaEntriesClient {
    async searchMediaEntries(
        request: SearchRequestDto,
        page: number = 1,
        pageSize: number = 10,
        signal?: AbortSignal,
    ): Promise<MediaEntryMinimalDto[]> {
        return executeWebOperation(searchMediaEntriesOperation(request, page, pageSize), signal);
    }

    async getMediaEntries(
        pageNumber = 1,
        pageSize = 25,
        signal?: AbortSignal,
    ): Promise<MediaEntryMinimalDto[]> {
        return executeWebOperation(mediaEntriesOperation(pageNumber, pageSize), signal);
    }

    async getMangaById(entryId: string, signal?: AbortSignal): Promise<MangaEntryDetailedDto> {
        return executeWebOperation(mediaEntryByIdOperation(MediaType.Manga, entryId), signal);
    }

    async getTvSeriesById(entryId: string, signal?: AbortSignal): Promise<TvSeriesEntryDetailedDto> {
        return executeWebOperation(mediaEntryByIdOperation(MediaType.TvSeries, entryId), signal);
    }

    async getMovieById(entryId: string, signal?: AbortSignal): Promise<MovieEntryDetailedDto> {
        return executeWebOperation(mediaEntryByIdOperation(MediaType.Movie, entryId), signal);
    }

    async getGameById(entryId: string, signal?: AbortSignal): Promise<GameEntryDetailedDto> {
        return executeWebOperation(mediaEntryByIdOperation(MediaType.Game, entryId), signal);
    }

    async getBookById(entryId: string, signal?: AbortSignal): Promise<BookEntryDetailedDto> {
        return executeWebOperation(mediaEntryByIdOperation(MediaType.Book, entryId), signal);
    }

    async deleteMediaEntry(entryId: string, signal?: AbortSignal): Promise<void> {
        await executeWebOperation(deleteMediaEntryOperation(entryId), signal);
    }
}
