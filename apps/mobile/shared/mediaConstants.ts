import { MediaType, Status } from '@mediavault/contracts';

// This filter-only sentinel is intentionally Android-local; it is never sent
// to the API and is not part of the shared MediaType enum.
export const ALL_MEDIA_TYPE = -1;

// Labels and section ordering are presentation policy, not API contracts.
export const StatusLabels: Record<number, string> = {
  [Status.Ongoing]: 'OnGoing',
  [Status.Completed]: 'Completed',
  [Status.Backlog]: 'Backlog',
  [Status.Dropped]: 'Dropped',
  [Status.CaughtUp]: 'Caught Up',
};

export const MediaTypeLabels: Record<number, string> = {
  [MediaType.Movie]: 'Movie',
  [MediaType.TvSeries]: 'Series',
  [MediaType.Book]: 'Book',
  [MediaType.Manga]: 'Manga',
  [MediaType.Game]: 'Game',
};

export const statusSections = [
  { type: Status.Ongoing, title: 'On Going' },
  { type: Status.Completed, title: 'Completed' },
  { type: Status.CaughtUp, title: 'Caught Up' },
  { type: Status.Dropped, title: 'Dropped' },
  { type: Status.Backlog, title: 'Backlog' },
];

export const mediaTypeOptions = [
  { value: ALL_MEDIA_TYPE, label: 'All Media' },
  { value: MediaType.Movie, label: 'Movies' },
  { value: MediaType.TvSeries, label: 'TV Series' },
  { value: MediaType.Book, label: 'Books' },
  { value: MediaType.Manga, label: 'Manga' },
  { value: MediaType.Game, label: 'Games' },
];
