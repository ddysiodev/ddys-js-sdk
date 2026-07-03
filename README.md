# DDYS JavaScript SDK

[English](README.md) | [简体中文](README.zh-CN.md)

Official JavaScript SDK for the DDYS API.

Official website: [DDYS](https://ddys.io/)

This package is designed as the base layer for DDYS widgets, CMS plugins, static-site starters, bots, MCP servers, and custom integrations.

## Features

- Covers every documented `/api/v1` endpoint.
- Works with public read endpoints without an API key.
- Supports authenticated endpoints with `Authorization: Bearer ddys_xxx`.
- Includes TypeScript declarations.
- Ships ESM and CommonJS builds.
- Uses standard `fetch`.
- Has zero runtime dependencies.
- Supports custom API base URLs for Cloudflare Worker proxy deployments.
- Provides consistent error classes, timeout handling, optional GET retry, and pagination helpers.

## Install

```bash
npm install @ddysiodev/js-sdk
```

CDN URLs:

```text
https://cdn.jsdelivr.net/npm/@ddysiodev/js-sdk/dist/index.js
https://unpkg.com/@ddysiodev/js-sdk/dist/index.js
```

Public publishing:

```bash
npm publish --access public
```

## Quick Start

```js
import { createDdysClient } from '@ddysiodev/js-sdk';

const ddys = createDdysClient();

const latest = await ddys.latest({ limit: 12 });
const movie = await ddys.movies.detail('interstellar');
const sources = await ddys.movies.sources('interstellar');

console.log(latest, movie.title, sources.download);
```

## Authenticated Usage

Authenticated endpoints require a user API key generated at:

```text
https://ddys.io/user/profile
```

Use the key on the server side or inside your own Worker/API route:

```js
import { createDdysClient } from '@ddysiodev/js-sdk';

const ddys = createDdysClient({
  apiKey: process.env.DDYS_API_KEY
});

const request = await ddys.requests.create({
  title: 'Dune 2',
  year: 2024,
  type: 'movie',
  douban_id: '35652650'
});

console.log(request.url);
```

Public display features do not require an API key. For write endpoints, configure the key on your server or Worker.

## Custom API Base URL

Use `baseUrl` when your site routes requests through a cache proxy:

```js
const ddys = createDdysClient({
  baseUrl: 'https://example.com/ddys-api'
});
```

## API Methods

### Movies

```js
await ddys.movies.list({ type: 'movie', sort: 'rating', page: 1, per_page: 24 });
await ddys.movies.detail('interstellar');
await ddys.movies.sources('interstellar');
await ddys.movies.related('interstellar');
await ddys.movies.comments('interstellar', { page: 1, per_page: 20 });
```

### Discovery

```js
await ddys.search({ q: 'star', type: 'movie', per_page: 10 });
await ddys.suggest('star');
await ddys.hot();
await ddys.latest({ limit: 30 });
await ddys.calendar({ year: 2026, month: 7 });
```

### Dictionaries

```js
await ddys.dictionaries.types();
await ddys.dictionaries.genres();
await ddys.dictionaries.regions();
```

### Collections, Shares, Requests, Activities

```js
await ddys.collections.list();
await ddys.collections.detail('best-sci-fi');
await ddys.shares.list();
await ddys.shares.detail(1081);
await ddys.requests.list();
await ddys.activities.list({ type: 'share' });
```

### Users

```js
await ddys.users.profile('diduan');
await ddys.me();
```

### Comments, Reports, Follow

```js
await ddys.comments.create({
  target_type: 'movie',
  target_id: 4786,
  content: 'Great movie'
});

await ddys.comments.delete(12345);

await ddys.reports.invalidResource({
  movie_id: 4786,
  resource_id: 1002
});

await ddys.follow.follow('diduan');
await ddys.follow.unfollow('diduan');
```

## Pagination

Paginated methods return:

```js
const result = await ddys.movies.list({ page: 1, per_page: 24 });

console.log(result.data);
console.log(result.meta.total);
console.log(result.meta.total_pages);
```

`perPage` is also accepted as an alias for `per_page`.

## Low-Level Request

Use `request()` for advanced cases. It returns the full API envelope.

```js
const envelope = await ddys.request('/movies', {
  query: { page: 1, per_page: 3 }
});

console.log(envelope.success, envelope.data, envelope.meta);
```

## Error Handling

```js
import { DdysApiError } from '@ddysiodev/js-sdk';

try {
  await ddys.movies.detail('missing');
} catch (error) {
  if (error instanceof DdysApiError) {
    console.error(error.status, error.message, error.endpoint);
  }
}
```

Error classes:

- `DdysApiError`
- `DdysTimeoutError`
- `DdysNetworkError`
- `DdysParseError`

## Runtime Support

- Node.js `>=22`
- Modern browsers
- Cloudflare Workers
- Vercel Edge / Netlify Edge style runtimes

If a runtime does not provide global `fetch`, pass one:

```js
const ddys = createDdysClient({ fetch: customFetch });
```

## Development

This project intentionally has no runtime dependencies and can build/test with Node only.

```bash
node scripts/build.mjs
node --test test/*.test.mjs
```

When npm is available:

```bash
npm test
```

Live smoke tests are opt-in:

```bash
DDYS_LIVE_TEST=1 node test/live-smoke.mjs
```

Authenticated live smoke tests also need:

```bash
DDYS_API_KEY=ddys_xxx
```
