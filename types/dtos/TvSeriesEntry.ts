import type { MediaEntryDetailedDto, MediaEntryCreateDto, MediaEntryUpdateDto } from './MediaEntryBase';
import type { Season } from './Season';

export interface TvSeriesEntryDetailedDto extends MediaEntryDetailedDto {
  numberOfSeasons: number;
  numberOfEpisodes: number;
  totalWatchedEpisodes: number;
  backdropImageUrl: string | null;
  firstAirDate: string | null;
  lastAirDate: string | null;
  airingStatus: string | null;
  seasons?: Season[] | null;
}

export interface TvSeriesEntryCreateDto extends MediaEntryCreateDto {
  numberOfSeasons: number;
  numberOfEpisodes: number;
  totalWatchedEpisodes: number;
  backdropImageUrl: string | null;
  firstAirDate: string | null;
  lastAirDate: string | null;
  airingStatus: string | null;
  seasons?: Season[] | null;
}

export interface TvSeriesEntryUpdateDto extends MediaEntryUpdateDto {
  numberOfSeasons: number;
  numberOfEpisodes: number;
  totalWatchedEpisodes: number;
  backdropImageUrl: string | null;
  firstAirDate: string | null;
  lastAirDate: string | null;
  airingStatus: string | null;
  seasons?: Season[] | null;
}
