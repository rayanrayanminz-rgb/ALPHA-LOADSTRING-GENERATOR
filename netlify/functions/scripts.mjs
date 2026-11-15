import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';

const MAX_BYTES = 200 * 1024;
const STORE_NAME = 'alpha-lua-scripts';
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers: { ...headers, Allow: 'POST' } });
  }

  let payload;
  try { payload = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Request body must be valid JSON.' }), { status: 400, headers }); }

  if (!payload || typeof payload.script !== 'string') {
    return new Response(JSON.stringify({ error: 'A script string is required.' }), { status: 400, headers });
  }
  if (!payload.script.trim()) {
    return new Response(JSON.stringify({ error: 'Script cannot be empty.' }), { status: 400, headers });
  }
  if (Buffer.byteLength(payload.script, 'utf8') > MAX_BYTES) {
    return new Response(JSON.stringify({ error: 'Script exceeds the 200 KB limit.' }), { status: 413, headers });
  }

  try {
    const id = randomUUID();
    const store = getStore(STORE_NAME);
    // Persist the submitted bytes as text. No compilation or execution occurs.
    await store.set(id, payload.script, { metadata: { contentType: 'text/plain; charset=utf-8' } });
    const siteUrl = Netlify.env.get('URL') || new URL(request.url).origin;
    const url = new URL(`/s/${id}`, siteUrl).toString();
    return new Response(JSON.stringify({ url }), { status: 201, headers });
  } catch (error) {
    console.error('Script storage failed:', error);
    return new Response(JSON.stringify({ error: 'Could not store the script. Check Netlify Blobs configuration.' }), { status: 500, headers });
  }
};
