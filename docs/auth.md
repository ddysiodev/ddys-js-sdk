# Authentication

Public read endpoints do not require an API key.

Authenticated endpoints require:

```http
Authorization: Bearer ddys_your_api_key_here
```

Generate a DDYS user API key at:

```text
https://ddys.io/user/profile
```

## Recommended Usage

Use API keys only on the server side:

```js
const ddys = createDdysClient({
  apiKey: process.env.DDYS_API_KEY
});
```

Safe places:

- Node.js backend
- Next.js route handler
- Cloudflare Worker
- CMS plugin backend
- Bot service

For authenticated operations, configure the API key in a server-side service, Worker, CMS backend, or bot process.
