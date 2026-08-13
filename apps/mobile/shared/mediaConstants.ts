import { MediaType, StatusType } from '../types/dtos/MediaEntryBase';

export const statusSections = [
  { type: StatusType.OnGoing, title: 'On Going' },
  { type: StatusType.Completed, title: 'Completed' },
  { type: StatusType.CaughtUp, title: 'Caught Up' },
  { type: StatusType.Dropped, title: 'Dropped' },
  { type: StatusType.Backlog, title: 'Backlog' },
];

export const mediaTypeOptions = [
  { value: MediaType.All, label: 'All Media' },
  { value: MediaType.Movie, label: 'Movies' },
  { value: MediaType.Series, label: 'TV Series' },
  { value: MediaType.Book, label: 'Books' },
  { value: MediaType.Manga, label: 'Manga' },
  { value: MediaType.Game, label: 'Games' },
];
