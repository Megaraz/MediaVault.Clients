import {
  MediaType,
  Status,
  type ErrorResponseBody,
  type LoginResponseDto,
  type MediaEntryDetailedDto,
  type TvSeriesEntryCreateDto,
  type ValidationErrorResponseBody,
} from '../src/index.js';

const mediaTypeValue: MediaType = MediaType.Movie;
const statusValue: Status = Status.Ongoing;

const mediaEntry = {
  id: '00000000-0000-0000-0000-000000000001',
  idExternal: null,
  userId: '00000000-0000-0000-0000-000000000002',
  status: Status.Ongoing,
  title: 'Example',
  rating: 4.5,
  overview: null,
  review: null,
  genres: [],
  releaseDate: '2026-08-14',
  imageUrl: null,
  mediaType: MediaType.Movie,
  createdAtUtc: '2026-08-14T00:00:00Z',
} satisfies MediaEntryDetailedDto;

const createTvSeries = {
  status: Status.Backlog,
  title: 'Example series',
  rating: 0,
  seasons: [],
} satisfies TvSeriesEntryCreateDto;

const login = {
  user: {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'user',
    email: 'user@example.invalid',
    createdAtUtc: '2026-08-14T00:00:00Z',
  },
  token: 'test-token',
} satisfies LoginResponseDto;

const ordinaryError = { message: 'Not found.', code: 'not_found' } satisfies ErrorResponseBody;
const validationError = {
  message: 'Validation failed.',
  validationErrors: [{ field: 'title', message: 'A title is required.' }],
} satisfies ValidationErrorResponseBody;

void [mediaTypeValue, statusValue, mediaEntry, createTvSeries, login, ordinaryError, validationError];
