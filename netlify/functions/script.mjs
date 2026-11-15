import { getStore } from '@netlify/blobs';

const STORE_NAME = 'alpha-lua-scripts';
const responseHeaders = {
  'Content-Type': 'text/plain; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; sandbox",
  'Cache-Control': 'public, max-age=60, s-maxage=300',
  'Content-Disposition': 'inline; filename="script.txt"'
};

export default async (request) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed.', { status: 405, headers: { ...responseHeaders, Allow: 'GET, HEAD' } });
  }
  const id = new URL(request.url).searchParams.get('id');
  // IDs are generated as UUIDs; validate before using them as blob keys.
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return new Response('Script not found.', { status: 404, headers: responseHeaders });
  }

  try {
    const store = getStore(STORE_NAME);
    const script = await store.get(id, { type: 'text' });
    if (script === null) return new Response('Script not found.', { status: 404, headers: responseHeaders });
    return new Response(request.method === 'HEAD' ? null : script, { status: 200, headers: responseHeaders });
  } catch (error) {
    console.error('Script retrieval failed:', error);
    return new Response('Could not retrieve script.', { status: 500, headers: responseHeaders });
  }
};
