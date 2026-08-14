import type { Status } from './enums.js';

interface SeasonFields {
  tvSeriesId: string;
  idExternal: string | null;
  name: string | null;
  overview: string | null;
  imageUrl: string | null;
  seasonNumber: number;
  airDate: string | null;
  watchedEpisodes: number;
  episodes: number;
  status: Status;
  rating: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SeasonDetailedDto extends SeasonFields {
  id: string;
}

export interface SeasonMinimalDto extends SeasonFields {
  id: string;
}

export type SeasonCreateDto = SeasonFields;

export interface SeasonUpdateDto extends SeasonFields {
  id: string;
}
