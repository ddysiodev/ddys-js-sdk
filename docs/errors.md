# Error Handling

The SDK throws errors for:

- HTTP non-2xx responses
- DDYS `{ success: false }` envelopes
- network failures
- timeout aborts
- invalid JSON responses
- malformed API envelopes

## Error Classes

| Class | Meaning |
| --- | --- |
| `DdysApiError` | API, HTTP, validation, or generic SDK error |
| `DdysTimeoutError` | Request timed out |
| `DdysNetworkError` | Fetch/network layer failed |
| `DdysParseError` | Response could not be parsed or validated |

## Example

```js
try {
  await ddys.movies.detail('missing');
} catch (error) {
  console.error(error.name);
  console.error(error.status);
  console.error(error.message);
  console.error(error.endpoint);
}
```

The SDK does not include full API keys in errors.

