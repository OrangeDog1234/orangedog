/**
 * Orange Dog – Cloudflare Pages worker (advanced mode).
 * It serves index.html, adds safety + speed headers, hides this README,
 * and (optional) hands out voice-call relay passwords without showing them to everyone.
 */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  // voice calls need the microphone; nothing else does
  'Permissions-Policy': 'microphone=(self), camera=(), geolocation=(), payment=()',
};
const HIDDEN = new Set(['/readme.md', '/_worker.js', '/wrangler.toml']);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    if (HIDDEN.has(path)) return new Response('Not found', { status: 404 });

    // Optional: voice-call relay (TURN) passwords. Set METERED_URL in the Cloudflare settings
    // and paste https://YOUR-SITE/api/ice into Admin Abuse → Voice call relay.
    if (path === '/api/ice') return ice(request, env, ctx);

    let res;
    try {
      res = await env.ASSETS.fetch(request);
    } catch (e) {
      return new Response('Orange Dog is having trouble loading. Please refresh in a moment.', { status: 503 });
    }
    // anything unknown (like /chat or a typo) still opens the website
    if (res.status === 404 && request.method === 'GET' && !path.includes('.')) {
      res = await env.ASSETS.fetch(new Request(new URL('/', url), request));
    }

    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
    const type = out.headers.get('content-type') || '';
    if (type.includes('text/html')) {
      // always check for a new version (cheap: unchanged pages come back as "304 not modified")
      out.headers.set('Cache-Control', 'no-cache');
    }
    return out;
  },
};

async function ice(request, env, ctx) {
  const headers = { 'content-type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': new URL(request.url).origin };
  if (!env.METERED_URL) return new Response(JSON.stringify({ error: 'METERED_URL is not set' }), { status: 404, headers });
  const cache = caches.default, key = new Request(new URL('/api/ice-cache', request.url));
  let hit = await cache.match(key);
  if (!hit) {
    const r = await fetch(env.METERED_URL);
    if (!r.ok) return new Response(JSON.stringify({ error: 'relay service said ' + r.status }), { status: 502, headers });
    const body = await r.text();
    hit = new Response(body, { headers: { 'content-type': 'application/json', 'Cache-Control': 'max-age=3600' } });
    ctx.waitUntil(cache.put(key, hit.clone()));
  }
  return new Response(hit.body, { headers });
}
