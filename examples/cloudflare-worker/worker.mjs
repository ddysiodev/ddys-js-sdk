import { createDdysClient } from '../../dist/index.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ddys = createDdysClient({
      apiKey: env.DDYS_API_KEY,
      baseUrl: env.DDYS_API_BASE_URL || 'https://ddys.io/api/v1'
    });

    if (url.pathname === '/latest') {
      const data = await ddys.latest({ limit: 12 });
      return Response.json({ success: true, data });
    }

    if (url.pathname === '/search') {
      const q = url.searchParams.get('q') || '';
      const data = await ddys.search({ q, type: 'movie', per_page: 10 });
      return Response.json({ success: true, ...data });
    }

    return Response.json({ success: false, message: 'Not found' }, { status: 404 });
  }
};

