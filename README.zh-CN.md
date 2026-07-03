# DDYS JavaScript SDK

[English](README.md) | [简体中文](README.zh-CN.md)

低端影视 API 官方 JavaScript SDK。

官网：[低端影视](https://ddys.io/)

这个包是 DDYS 开放生态的基础库，后续官方 Widgets、CMS 插件、静态站模板、Bot、MCP Server 和第三方应用都可以基于它调用 API。

## 功能特点

- 覆盖当前文档中的全部 `/api/v1` 接口。
- 公开读取接口无需 API Key。
- 支持需要鉴权的接口：`Authorization: Bearer ddys_xxx`。
- 自带 TypeScript 类型声明。
- 同时提供 ESM 和 CommonJS 构建。
- 使用标准 `fetch`。
- 零运行时依赖。
- 支持自定义 API Base URL，方便配合 Cloudflare Worker 缓存代理。
- 统一错误类、超时处理、可选 GET 重试和分页返回结构。

## 安装

```bash
npm install @ddysiodev/js-sdk
```

CDN 地址：

```text
https://cdn.jsdelivr.net/npm/@ddysiodev/js-sdk/dist/index.js
https://unpkg.com/@ddysiodev/js-sdk/dist/index.js
```

## 快速开始

```js
import { createDdysClient } from '@ddysiodev/js-sdk';

const ddys = createDdysClient();

const latest = await ddys.latest({ limit: 12 });
const movie = await ddys.movies.detail('interstellar');
const sources = await ddys.movies.sources('interstellar');

console.log(latest, movie.title, sources.download);
```

## 鉴权接口

评论、求片、举报、关注、当前用户资料等接口需要用户 API Key。

API Key 在这里生成：

```text
https://ddys.io/user/profile
```

服务端使用示例：

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

公开展示类功能无需 API Key；如需调用写接口，建议在服务端或 Worker 中配置用户 API Key。

## 自定义 API 地址

如果你通过自己的 Worker 做缓存代理，可以这样配置：

```js
const ddys = createDdysClient({
  baseUrl: 'https://example.com/ddys-api'
});
```

## 方法列表

### 影片

```js
await ddys.movies.list({ type: 'movie', sort: 'rating', page: 1, per_page: 24 });
await ddys.movies.detail('interstellar');
await ddys.movies.sources('interstellar');
await ddys.movies.related('interstellar');
await ddys.movies.comments('interstellar', { page: 1, per_page: 20 });
```

### 搜索与发现

```js
await ddys.search({ q: '星际', type: 'movie', per_page: 10 });
await ddys.suggest('星际');
await ddys.hot();
await ddys.latest({ limit: 30 });
await ddys.calendar({ year: 2026, month: 7 });
```

### 字典

```js
await ddys.dictionaries.types();
await ddys.dictionaries.genres();
await ddys.dictionaries.regions();
```

### 片单、分享、求片、动态

```js
await ddys.collections.list();
await ddys.collections.detail('best-sci-fi');
await ddys.shares.list();
await ddys.shares.detail(1081);
await ddys.requests.list();
await ddys.activities.list({ type: 'share' });
```

### 用户

```js
await ddys.users.profile('diduan');
await ddys.me();
```

### 评论、举报、关注

```js
await ddys.comments.create({
  target_type: 'movie',
  target_id: 4786,
  content: '好片'
});

await ddys.comments.delete(12345);

await ddys.reports.invalidResource({
  movie_id: 4786,
  resource_id: 1002
});

await ddys.follow.follow('diduan');
await ddys.follow.unfollow('diduan');
```

## 分页

分页接口返回：

```js
const result = await ddys.movies.list({ page: 1, per_page: 24 });

console.log(result.data);
console.log(result.meta.total);
console.log(result.meta.total_pages);
```

SDK 同时支持 `perPage`，会自动转换为 API 使用的 `per_page`。

## 底层 request

高级开发者可以直接使用 `request()`，它返回完整 API envelope：

```js
const envelope = await ddys.request('/movies', {
  query: { page: 1, per_page: 3 }
});

console.log(envelope.success, envelope.data, envelope.meta);
```

## 错误处理

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

错误类：

- `DdysApiError`
- `DdysTimeoutError`
- `DdysNetworkError`
- `DdysParseError`

## 运行环境

- Node.js `>=22`
- 现代浏览器
- Cloudflare Workers
- Vercel Edge / Netlify Edge 等运行时

如果运行时没有全局 `fetch`，可以手动传入：

```js
const ddys = createDdysClient({ fetch: customFetch });
```

## 开发

本项目零运行时依赖，可以只用 Node 构建和测试：

```bash
node scripts/build.mjs
node --test test/*.test.mjs
```

如果 npm 可用：

```bash
npm test
```

线上 smoke test 默认不运行：

```bash
DDYS_LIVE_TEST=1 node test/live-smoke.mjs
```

鉴权 smoke test 还需要：

```bash
DDYS_API_KEY=ddys_xxx
```
