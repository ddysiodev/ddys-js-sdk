import { createDdysClient } from '../src/index.js';

if (process.env.DDYS_LIVE_TEST !== '1') {
  console.log('Set DDYS_LIVE_TEST=1 to run live smoke tests.');
  process.exit(0);
}

const client = createDdysClient({
  apiKey: process.env.DDYS_API_KEY || '',
  timeoutMs: 15000
});

const types = await client.dictionaries.types();
console.log(`types: ${types.length}`);

const latest = await client.latest({ limit: 1 });
console.log(`latest: ${latest.length}`);

const search = await client.search({ q: '星际', type: 'movie', per_page: 1 });
console.log(`search: ${search.data.length}`);

if (process.env.DDYS_API_KEY) {
  const me = await client.me();
  console.log(`me: ${me.username}`);
}
