const assert = require('node:assert/strict');
const test = require('node:test');

async function core() {
  return import('../dist/index.js');
}

test('builds authenticated operations through injected capabilities', async () => {
  const { currentUserOperation, executeOperation } = await core();
  let request;
  const result = await executeOperation(currentUserOperation(), {
    baseUrl: 'https://api.example.invalid/',
    accessToken: { getAccessToken: async () => 'test.jwt.token' },
    transport: {
      send: async (value) => {
        request = value;
        return new Response(JSON.stringify({
          id: 'user-id', username: 'user', email: 'user@example.invalid', createdAtUtc: '2026-08-14T00:00:00Z',
        }), { status: 200 });
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(request.url, 'https://api.example.invalid/auth/me');
  assert.equal(request.headers.Authorization, 'Bearer test.jwt.token');
});

test('public auth operations never request or attach a token', async () => {
  const { executeOperation, loginOperation } = await core();
  let tokenReads = 0;
  let request;
  await executeOperation(loginOperation({ usernameOrEmail: 'user', password: 'password' }), {
    baseUrl: '',
    accessToken: { getAccessToken: () => { tokenReads += 1; return 'secret'; } },
    transport: {
      send: async (value) => {
        request = value;
        return new Response(JSON.stringify({
          user: { id: 'id', username: 'user', email: 'user@example.invalid', createdAtUtc: 'date' }, token: 'token',
        }), { status: 200 });
      },
    },
  });

  assert.equal(tokenReads, 0);
  assert.equal(request.headers.Authorization, undefined);
  assert.equal(request.url, '/auth/login');
});

test('accepts the API empty success response for registration', async () => {
  const { executeOperation, registerOperation } = await core();
  let request;
  const result = await executeOperation(registerOperation({
    username: 'new-user', email: 'new@example.invalid', password: 'password',
  }), {
    baseUrl: '',
    accessToken: { getAccessToken: () => { throw new Error('registration must be public'); } },
    transport: {
      send: async (value) => {
        request = value;
        return new Response(null, { status: 204 });
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(request.url, '/auth/register');
  assert.equal(request.headers.Authorization, undefined);
  assert.equal(request.body, JSON.stringify({
    username: 'new-user', email: 'new@example.invalid', password: 'password',
  }));
});

test('builds deterministic routes, query strings, and JSON bodies', async () => {
  const { executeOperation, searchRawgGamesOperation } = await core();
  let request;
  await executeOperation(searchRawgGamesOperation(
    { query: 'dune' }, 2, 8, { searchExact: true, ordering: '-rating' },
  ), {
    baseUrl: 'http://10.0.2.2:5210',
    accessToken: { getAccessToken: () => null },
    transport: {
      send: async (value) => {
        request = value;
        return new Response('[]', { status: 200 });
      },
    },
  });

  assert.equal(request.url, 'http://10.0.2.2:5210/rawgapi/search?page=2&pageSize=8&searchExact=true&ordering=-rating');
  assert.equal(request.body, JSON.stringify({ query: 'dune' }));
  assert.equal(request.headers['Content-Type'], 'application/json');
});

test('maps safe HTTP failures and cancellation through ResultPattern v2', async () => {
  const { currentUserOperation, executeOperation } = await core();
  const failure = await executeOperation(currentUserOperation(), {
    baseUrl: '',
    accessToken: { getAccessToken: () => null },
    transport: { send: async () => new Response('server details', { status: 500 }) },
  });
  assert.deepEqual(failure, {
    ok: false,
    error: { kind: 'failure', code: 'Http.500', message: 'Something went wrong. Please try again.' },
    validationErrors: [],
  });

  const cancellation = await executeOperation(currentUserOperation(), {
    baseUrl: '',
    accessToken: { getAccessToken: () => null },
    transport: { send: async () => { throw new DOMException('stopped', 'AbortError'); } },
  });
  assert.equal(cancellation.ok, false);
  assert.equal(cancellation.error.kind, 'cancelled');
});

test('notifies the platform only for authenticated 401 responses', async () => {
  const { currentUserOperation, executeOperation, loginOperation } = await core();
  const unauthorizedRequests = [];
  const capabilities = {
    baseUrl: '',
    accessToken: { getAccessToken: () => 'expired-token' },
    transport: { send: async () => new Response(null, { status: 401 }) },
    onUnauthorized: async (request) => { unauthorizedRequests.push(request); },
  };

  await executeOperation(currentUserOperation(), capabilities);
  await executeOperation(
    loginOperation({ usernameOrEmail: 'user', password: 'password' }),
    capabilities,
  );

  assert.equal(unauthorizedRequests.length, 1);
  assert.equal(unauthorizedRequests[0].headers.Authorization, 'Bearer expired-token');
});

test('invalidates stale authentication transitions deterministically', async () => {
  const { SessionTransitionCoordinator } = await core();
  const coordinator = new SessionTransitionCoordinator();
  let invalidations = 0;
  const unsubscribe = coordinator.subscribe(() => { invalidations += 1; });

  const restoration = coordinator.beginTransition();
  const login = coordinator.beginTransition();
  assert.equal(coordinator.isCurrent(restoration), false);
  assert.equal(coordinator.isCurrent(login), true);

  coordinator.invalidate();
  assert.equal(coordinator.isCurrent(login), false);
  assert.equal(invalidations, 1);

  unsubscribe();
  coordinator.invalidate();
  assert.equal(invalidations, 1);
});

test('preserves expected not-found and provider rate-limit failures', async () => {
  const { executeOperation, rawgGameByIdOperation, userByIdOperation } = await core();
  const capabilities = (response) => ({
    baseUrl: '',
    accessToken: { getAccessToken: () => null },
    transport: { send: async () => response },
  });

  const missing = await executeOperation(
    userByIdOperation('missing-id'),
    capabilities(new Response(JSON.stringify({ message: 'User not found.', code: 'User.NotFound' }), { status: 404 })),
  );
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.error, { kind: 'not-found', code: 'User.NotFound', message: 'User not found.' });

  const throttled = await executeOperation(
    rawgGameByIdOperation(42),
    capabilities(new Response(JSON.stringify({ message: 'Try again later.', code: 'Provider.RateLimited' }), { status: 429 })),
  );
  assert.equal(throttled.ok, false);
  assert.deepEqual(throttled.error, {
    kind: 'rate-limited', code: 'Provider.RateLimited', message: 'Try again later.',
  });
});

test('validates shared DTOs with field-safe ResultPattern failures', async () => {
  const { validateMediaEntry, validateUserRegistration } = await core();
  const title = validateMediaEntry({ status: 2, title: '  ', rating: 0 });
  assert.equal(title.ok, false);
  assert.deepEqual(title.validationErrors, [{ field: 'title', message: 'Title is required.' }]);

  const registration = validateUserRegistration({
    username: 'user', email: 'a@example.invalid', confirmEmail: 'b@example.invalid',
    password: 'password', confirmPassword: 'different',
  });
  assert.equal(registration.ok, false);
  assert.deepEqual(registration.validationErrors.map((error) => error.field), ['confirmEmail', 'confirmPassword']);
});

test('normalizes provider DTOs without UI or persistence types', async () => {
  const { mapTmdbTvSeriesMetadata } = await core();
  const metadata = mapTmdbTvSeriesMetadata({
    tmdbBackdropPath: '/backdrop.jpg', tmdbFirstAirDate: '2020-01-01',
    tmdbGenres: [{ tmdbGenreId: 1, tmdbGenreName: 'Drama' }, { tmdbGenreId: 2, tmdbGenreName: null }],
    tmdbTvSeriesId: 42, tmdbLastAirDate: null, tmdbName: 'Series', tmdbNumberOfEpisodes: 8,
    tmdbNumberOfSeasons: 1, tmdbOverview: 'Overview', tmdbPosterPath: '/poster.jpg',
    tmdbSeasons: [{ tmdbAirDate: null, tmdbEpisodeCount: 8, tmdbName: 'Season 1', tmdbOverview: null,
      tmdbPosterPath: null, tmdbSeasonNumber: 1 }], tmdbStatus: 'Ended',
  });

  assert.equal(metadata.externalId, '42');
  assert.deepEqual(metadata.genres, ['Drama']);
  assert.deepEqual(metadata.seasons, [{
    seasonNumber: 1, name: 'Season 1', overview: null, imageUrl: null, airDate: null, episodes: 8,
  }]);
  assert.equal(Object.isFrozen(metadata), true);
});
