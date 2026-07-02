import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DdysApiError,
  DdysNetworkError,
  DdysParseError,
  DdysTimeoutError,
  createDdysClient
} from '../src/index.js';

function createJsonResponse(body, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    async text() {
      return JSON.stringify(body);
    }
  };
}

function createMockFetch(body = { success: true, data: [] }, init = {}) {
  const calls = [];
  const fetch = async (url, options) => {
    calls.push({ url, options });
    return createJsonResponse(body, init);
  };
  fetch.calls = calls;
  return fetch;
}

test('builds GET URLs with normalized baseUrl, query, and perPage alias', async () => {
  const fetch = createMockFetch({
    success: true,
    data: [{ id: 1, title: 'A', slug: 'a', year: 2026, url: '/movie/a' }],
    meta: { total: 1, page: 1, per_page: 12, total_pages: 1 }
  });
  const client = createDdysClient({
    baseUrl: 'https://example.com/api/v1/',
    fetch
  });

  const result = await client.movies.list({ type: 'movie', page: 1, perPage: 12, genre: '' });

  assert.equal(result.data[0].title, 'A');
  assert.equal(fetch.calls.length, 1);
  assert.equal(fetch.calls[0].url, 'https://example.com/api/v1/movies?type=movie&page=1&per_page=12');
  assert.equal(fetch.calls[0].options.method, 'GET');
});

test('encodes path segments for slug endpoints', async () => {
  const fetch = createMockFetch({ success: true, data: { id: 1, title: 'A', slug: 'a b', year: 2026, url: '/movie/a-b' } });
  const client = createDdysClient({ fetch });

  await client.movies.detail('a b');

  assert.equal(fetch.calls[0].url, 'https://ddys.io/api/v1/movies/a%20b');
});

test('adds authorization only for authenticated endpoints', async () => {
  const fetch = createMockFetch({ success: true, data: { id: 1, username: 'u' } });
  const client = createDdysClient({ fetch, apiKey: 'ddys_test_key_12345678901234567890' });

  await client.me();

  assert.equal(fetch.calls[0].options.headers.Authorization, 'Bearer ddys_test_key_12345678901234567890');
});

test('throws before authenticated calls when api key is missing', async () => {
  const fetch = createMockFetch();
  const client = createDdysClient({ fetch });

  await assert.rejects(
    () => client.requests.create({ title: 'A' }),
    (error) => error instanceof DdysApiError && error.status === 401 && /API key/.test(error.message)
  );
  assert.equal(fetch.calls.length, 0);
});

test('turns API error envelopes into DdysApiError', async () => {
  const fetch = createMockFetch({ success: false, message: 'Movie not found' }, { ok: false, status: 404 });
  const client = createDdysClient({ fetch });

  await assert.rejects(
    () => client.movies.detail('missing'),
    (error) => error instanceof DdysApiError && error.status === 404 && error.message === 'Movie not found'
  );
});

test('turns invalid JSON into DdysParseError', async () => {
  const fetch = async () => ({
    ok: true,
    status: 200,
    async text() {
      return 'not json';
    }
  });
  const client = createDdysClient({ fetch });

  await assert.rejects(
    () => client.latest(),
    (error) => error instanceof DdysParseError
  );
});

test('turns network failures into DdysNetworkError', async () => {
  const client = createDdysClient({
    fetch: async () => {
      throw new Error('socket closed');
    }
  });

  await assert.rejects(
    () => client.latest(),
    (error) => error instanceof DdysNetworkError && /socket closed/.test(error.message)
  );
});

test('turns timeout aborts into DdysTimeoutError', async () => {
  const client = createDdysClient({
    timeoutMs: 10,
    fetch: async (_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(options.signal.reason));
    })
  });

  await assert.rejects(
    () => client.latest(),
    (error) => error instanceof DdysTimeoutError
  );
});

test('maps public endpoint groups', async () => {
  const fetch = createMockFetch({ success: true, data: [], meta: { total: 0, page: 1, per_page: 20, total_pages: 1 } });
  const client = createDdysClient({ fetch });

  await client.search({ q: 'star', type: 'movie' });
  await client.suggest('star');
  await client.hot();
  await client.latest({ limit: 5 });
  await client.calendar({ year: 2026, month: 7 });
  await client.dictionaries.types();
  await client.dictionaries.genres();
  await client.dictionaries.regions();
  await client.collections.list();
  await client.collections.detail('best');
  await client.shares.list();
  await client.shares.detail(1);
  await client.requests.list();
  await client.activities.list({ type: 'share' });
  await client.users.profile('diduan');

  const paths = fetch.calls.map((call) => new URL(call.url).pathname);
  assert.deepEqual(paths, [
    '/api/v1/search',
    '/api/v1/suggest',
    '/api/v1/hot',
    '/api/v1/latest',
    '/api/v1/calendar',
    '/api/v1/types',
    '/api/v1/genres',
    '/api/v1/regions',
    '/api/v1/collections',
    '/api/v1/collections/best',
    '/api/v1/shares',
    '/api/v1/shares/1',
    '/api/v1/requests',
    '/api/v1/activities',
    '/api/v1/user/diduan'
  ]);
});

test('maps authenticated endpoint groups', async () => {
  const fetch = createMockFetch({ success: true, data: { ok: true } });
  const client = createDdysClient({ fetch, apiKey: 'ddys_test_key_12345678901234567890' });

  await client.comments.create({ target_type: 'movie', target_id: 1, content: 'nice' });
  await client.comments.delete(2);
  await client.reports.invalidResource({ resource_id: 3, movie_id: 1 });
  await client.follow.set({ username: 'alice', action: 'follow' });
  await client.follow.follow('bob');
  await client.follow.unfollow('bob');

  const methodsAndPaths = fetch.calls.map((call) => `${call.options.method} ${new URL(call.url).pathname}`);
  assert.deepEqual(methodsAndPaths, [
    'POST /api/v1/comments',
    'DELETE /api/v1/comments/2',
    'POST /api/v1/report',
    'POST /api/v1/follow',
    'POST /api/v1/follow',
    'POST /api/v1/follow'
  ]);
  assert.ok(fetch.calls.every((call) => call.options.headers.Authorization));
});

