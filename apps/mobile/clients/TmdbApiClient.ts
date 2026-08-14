import { apiFetch } from '../shared/apiFetch';
import type {
  SearchRequestDto,
  TmdbMovieDetailedDto,
  TmdbSearchResultDto,
  TmdbTvSeriesDetailedDto,
} from '@mediavault/contracts';

const API_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_VAULT_API_URL || 'http://localhost:5210';

export default class TmdbApiClient {
  private baseUrl = `${API_BASE_URL}/tmdbapi`;

  async searchMovies(request: SearchRequestDto, page = 1): Promise<TmdbSearchResultDto[]> {
    const params = new URLSearchParams({ page: page.toString() });
    const response = await apiFetch(`${this.baseUrl}/movie/search?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to search movies: ' + await response.text());
    return response.json();
  }

  async getMovieById(id: number): Promise<TmdbMovieDetailedDto> {
    const response = await apiFetch(`${this.baseUrl}/movie/${id}`);
    if (!response.ok) throw new Error('Failed to fetch movie: ' + await response.text());
    return response.json();
  }

  async searchTvSeries(request: SearchRequestDto, page = 1): Promise<TmdbSearchResultDto[]> {
    const params = new URLSearchParams({ page: page.toString() });
    const response = await apiFetch(`${this.baseUrl}/tv/search?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
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
