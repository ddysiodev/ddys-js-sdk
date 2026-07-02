import { createDdysClient } from '@ddysiodev/js-sdk';

export async function GET() {
  const ddys = createDdysClient({
    apiKey: process.env.DDYS_API_KEY
  });

  const latest = await ddys.latest({ limit: 12 });

  return Response.json({
    success: true,
    data: latest
  });
}
