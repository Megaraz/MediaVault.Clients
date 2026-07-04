import type { Rating } from './Rating';
import type { TvSeriesEntry } from './TvSeriesEntry';

export interface Season {
  id: string;
  tvSeriesEntryId: string;
  tvSeriesEntry: TvSeriesEntry;
  idExternal: string | null;
  name: string | null;
  overview: string | null;
  imageUrl: string | null;
  seasonNumber: number;
  airDate: string | null;
  watchedEpisodes: number;
  episodes: number;
  status: number;
  rating: Rating;
  createdAtUtc: string;
  updatedAtUtc: string;
}
