export interface MediaEntryDetailedDto {
  id: string;
  idExternal: string | null;
  userId: string;
  status: number;
  title: string;
  rating: number;
  overview: string | null;
  review: string | null;
  genres: string[] | null;
  releaseDate: string | null;
  imageUrl: string | null;
  mediaType: number;
  createdAtUtc: string;
}

export interface MediaEntryCreateDto {
  idExternal?: string | null;
  status: number;
  title: string;
  overview?: string | null;
  rating: number;
  review?: string | null;
  genres?: string[] | null;
  releaseDate?: string | null;
  imageUrl?: string | null;
}

export interface MediaEntryUpdateDto {
  idExternal?: string | null;
  status: number;
  title: string;
  overview?: string | null;
  rating: number;
  review?: string | null;
  genres?: string[] | null;
  releaseDate?: string | null;
  imageUrl?: string | null;
}

export interface MediaEntryMinimalDto {
  id: string;
  title: string;
  status: number;
  genres?: string[] | null;
  releaseDate?: string | null;
  mediaType: number;
  rating: number;
  imageUrl: string | null;
  createdAtUtc: string;
}

export type MediaEntrySearchRequestDto = {
  query: string;
};

export const StatusLabels: Record<number, string> = {
  0: 'OnGoing',
  1: 'Completed',
  2: 'Backlog',
  3: 'Dropped',
  4: 'Caught Up',
};

export const MediaTypeLabels: Record<number, string> = {
  0: 'Movie',
  1: 'Series',
  2: 'Book',
  3: 'Manga',
  4: 'Game',
};

export const StatusType = {
  OnGoing: 0,
  Completed: 1,
  Backlog: 2,
  Dropped: 3,
  CaughtUp: 4,
} as const;

export const MediaType = {
  All: -1,
  Movie: 0,
  Series: 1,
  Book: 2,
  Manga: 3,
  Game: 4,
} as const;
