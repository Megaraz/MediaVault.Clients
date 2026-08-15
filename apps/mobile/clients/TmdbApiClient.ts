import type {
  MediaEntryExternalSearchResultDto,
  SearchRequestDto,
  TmdbMovieDetailedDto,
  TmdbTvSeriesDetailedDto,
} from '@mediavault/contracts';
import {
  searchTmdbMoviesOperation,
  searchTmdbTvSeriesOperation,
  tmdbMovieByIdOperation,
  tmdbTvSeriesByIdOperation,
} from '@mediavault/client-core';
import { executeMobileOperation } from '../shared/apiFetch';

export default class TmdbApiClient {
  async searchMovies(request: SearchRequestDto, page = 1, signal?: AbortSignal): Promise<MediaEntryExternalSearchResultDto[]> {
    return executeMobileOperation(searchTmdbMoviesOperation(request, page), signal);
  }

  async getMovieById(id: number, signal?: AbortSignal): Promise<TmdbMovieDetailedDto> {
    return executeMobileOperation(tmdbMovieByIdOperation(id), signal);
  }

  async searchTvSeries(request: SearchRequestDto, page = 1, signal?: AbortSignal): Promise<MediaEntryExternalSearchResultDto[]> {
    return executeMobileOperation(searchTmdbTvSeriesOperation(request, page), signal);
  }

  async getTvSeriesById(id: number, signal?: AbortSignal): Promise<TmdbTvSeriesDetailedDto> {
    return executeMobileOperation(tmdbTvSeriesByIdOperation(id), signal);
  }
}
