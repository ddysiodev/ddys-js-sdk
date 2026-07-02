# Method Reference

Base URL defaults to:

```text
https://ddys.io/api/v1
```

## Public Methods

| SDK method | HTTP API |
| --- | --- |
| `movies.list(params)` | `GET /movies` |
| `movies.detail(slug)` | `GET /movies/{slug}` |
| `movies.sources(slug)` | `GET /movies/{slug}/sources` |
| `movies.related(slug)` | `GET /movies/{slug}/related` |
| `movies.comments(slug, params)` | `GET /movies/{slug}/comments` |
| `search(params)` | `GET /search` |
| `suggest(q)` | `GET /suggest` |
| `hot()` | `GET /hot` |
| `latest(params)` | `GET /latest` |
| `calendar(params)` | `GET /calendar` |
| `dictionaries.types()` | `GET /types` |
| `dictionaries.genres()` | `GET /genres` |
| `dictionaries.regions()` | `GET /regions` |
| `collections.list(params)` | `GET /collections` |
| `collections.detail(slug, params)` | `GET /collections/{slug}` |
| `shares.list(params)` | `GET /shares` |
| `shares.detail(id)` | `GET /shares/{id}` |
| `requests.list(params)` | `GET /requests` |
| `activities.list(params)` | `GET /activities` |
| `users.profile(username)` | `GET /user/{username}` |

## Authenticated Methods

| SDK method | HTTP API |
| --- | --- |
| `me()` | `GET /me` |
| `requests.create(input)` | `POST /requests` |
| `comments.create(input)` | `POST /comments` |
| `comments.delete(id)` | `DELETE /comments/{id}` |
| `reports.invalidResource(input)` | `POST /report` |
| `follow.set(input)` | `POST /follow` |
| `follow.follow(username)` | `POST /follow` |
| `follow.unfollow(username)` | `POST /follow` |

## Pagination

List endpoints accept `page` and `per_page`. The SDK also accepts `perPage` and converts it to `per_page`.

Paginated methods return:

```ts
{
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }
}
```

