import { MediaType, Status } from "@mediavault/contracts";

// This filter-only sentinel is intentionally web-local; it is never sent to
// the API and is not part of the shared MediaType enum.
export const ALL_MEDIA_TYPE = -1;

// Labels and section ordering are presentation policy, not API contracts.
export const StatusLabels: Record<number, string> = {
  [Status.Ongoing]: "OnGoing",
  [Status.Completed]: "Completed",
  [Status.Backlog]: "Backlog",
  [Status.Dropped]: "Dropped",
  [Status.CaughtUp]: "Caught Up",
};

export const MediaTypeLabels: Record<number, string> = {
  [MediaType.Movie]: "Movie",
  [MediaType.TvSeries]: "Series",
  [MediaType.Book]: "Book",
  [MediaType.Manga]: "Manga",
  [MediaType.Game]: "Game",
};

// Sidebar navigation sections for filtering by media type.
// ALL_MEDIA_TYPE (-1) shows every type; the rest filter to a single type.
export const mediaSections = [
  { type: ALL_MEDIA_TYPE, title: "All" },
  { type: MediaType.Game, title: "Games" },
  { type: MediaType.Book, title: "Books" },
  { type: MediaType.Movie, title: "Movies" },
  { type: MediaType.TvSeries, title: "Series" },
  { type: MediaType.Manga, title: "Manga" },
];

// Status sections rendered on the Dashboard.
// Order here controls the visual order of the sections on screen.
export const statusSections = [
  { type: Status.Ongoing, title: "On Going" },
  { type: Status.CaughtUp, title: "Caught Up" },
  { type: Status.Completed, title: "Completed" },
  { type: Status.Backlog, title: "Backlog" },
  { type: Status.Dropped, title: "Dropped" },
];
