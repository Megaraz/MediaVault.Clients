import type { Rating } from './Rating';

export interface MediaEntry {
  id: string;
  ownerId: string;
  idExternal: string | null;
  status: number;
  title: string;
  rating: Rating;
  review: string | null;
  genres: string[];
  overview: string | null;
  releaseDate: string | null;
  imageUrl: string | null;
  mediaType: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}
