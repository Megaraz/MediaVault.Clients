import type { IHasSeasons } from './IHasSeasons';
import type { MediaEntry } from './MediaEntry';
import type { Season } from './Season';

export interface TvSeriesEntry extends MediaEntry, IHasSeasons {
  backdropImageUrl: string | null;
  lastAirDate: string | null;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  airingStatus: string | null;
  totalWatchedEpisodes: number;
  seasons: Season[];
}
