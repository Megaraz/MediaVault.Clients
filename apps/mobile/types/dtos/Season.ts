export interface Season {
  seasonNumber: number;
  name: string | null;
  overview: string | null;
  imageUrl: string | null;
  airDate: string | null;
  episodes: number;
  watchedEpisodes: number;
  status: number;
  rating: number;
}
