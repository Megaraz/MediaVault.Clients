import { apiFetch } from '../shared/apiFetch';
import type { MediaEntrySearchResultDto } from '../types/dtos/MediaEntryBase';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export interface TmdbMovieDetailedDto {
  tmdbBackdropPath?: string;
  tmdbReleaseDate?: string;
  tmdbGenres: TmdbGenreDto[];
  tmdbMovieId: number;
  tmdbOverview?: string;
  tmdbPosterPath?: string;
  tmdbTitle?: string;
  tmdbRunTimeMinutes?: number;
}

export interface TmdbTvSeriesDetailedDto {
  tmdbBackdropPath?: string | null;
  tmdbFirstAirDate?: string | null;
  tmdbGenres?: TmdbGenreDto[] | null;
  tmdbTvSeriesId: number;
  tmdbLastAirDate?: string | null;
  tmdbName?: string | null;
  tmdbNumberOfEpisodes: number;
  tmdbNumberOfSeasons: number;
  tmdbOverview?: string | null;
  tmdbPosterPath?: string | null;
  tmdbSeasons?: TmdbSeasonDto[] | null;
  tmdbStatus?: string | null;
}

export interface TmdbSeasonDto {
  tmdbAirDate?: string | null;
  tmdbEpisodeCount: number;
  tmdbName?: string | null;
  tmdbOverview?: string | null;
  tmdbPosterPath?: string | null;
  tmdbSeasonNumber: number;
}

export interface TmdbGenreDto {
  tmdbGenreId: number;
  tmdbGenreName?: string;
}

export default class TmdbApiClient {
  private baseUrl = `${API_BASE_URL}/tmdbapi`;

  async searchMovies(query: string, page = 1): Promise<MediaEntrySearchResultDto[]> {
    const params = new URLSearchParams({ page: page.toString() });
    const response = await apiFetch(`${this.baseUrl}/movie/search?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Failed to search movies: ' + await response.text());
    return response.json();
  }

  async getMovieById(id: number): Promise<TmdbMovieDetailedDto> {
    const response = await apiFetch(`${this.baseUrl}/movie/${id}`);
    if (!response.ok) throw new Error('Failed to fetch movie: ' + await response.text());
    return response.json();
  }

  async searchTvSeries(query: string, page = 1): Promise<MediaEntrySearchResultDto[]> {
    const params = new URLSearchParams({ page: page.toString() });
    const response = await apiFetch(`${this.baseUrl}/tv/search?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) throw new Error('Failed to search TV series: ' + await response.text());
    return response.json();
  }

  async getTvSeriesById(id: number): Promise<TmdbTvSeriesDetailedDto> {
    const response = await apiFetch(`${this.baseUrl}/tv/${id}`);
    if (!response.ok) throw new Error('Failed to fetch TV series: ' + await response.text());
    return response.json();
  }
}
