import type {
    MediaEntryExternalSearchResultDto,
    SearchRequestDto,
    TmdbMovieDetailedDto,
    TmdbTvSeriesDetailedDto,
} from "@mediavault/contracts";
import {
    searchTmdbMoviesOperation,
    searchTmdbTvSeriesOperation,
    tmdbMovieByIdOperation,
    tmdbTvSeriesByIdOperation,
} from "@mediavault/client-core";
import { executeWebOperation } from "./apiFetch";

export default class TmdbApiClient {
    async searchMovies(
        request: SearchRequestDto,
        page: number = 1,
        signal?: AbortSignal,
    ): Promise<MediaEntryExternalSearchResultDto[]> {
        return executeWebOperation(searchTmdbMoviesOperation(request, page), signal);
    }

    async getMovieById(id: number, signal?: AbortSignal): Promise<TmdbMovieDetailedDto> {
        return executeWebOperation(tmdbMovieByIdOperation(id), signal);
    }

    async searchTvSeries(
        request: SearchRequestDto,
        page: number = 1,
        signal?: AbortSignal,
    ): Promise<MediaEntryExternalSearchResultDto[]> {
        return executeWebOperation(searchTmdbTvSeriesOperation(request, page), signal);
    }

    async getTvSeriesById(id: number, signal?: AbortSignal): Promise<TmdbTvSeriesDetailedDto> {
        return executeWebOperation(tmdbTvSeriesByIdOperation(id), signal);
    }
}
