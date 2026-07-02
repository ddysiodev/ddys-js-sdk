import { createDdysClient } from '../../dist/index.js';

const ddys = createDdysClient();

const latest = await ddys.latest({ limit: 5 });
console.log('Latest movies:');
for (const movie of latest) {
  console.log(`- ${movie.title} (${movie.year}) ${movie.url}`);
}

const search = await ddys.search({ q: '星际', type: 'movie', per_page: 3 });
console.log(`Search results: ${search.meta.total}`);

