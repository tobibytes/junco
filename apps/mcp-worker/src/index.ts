import { handle } from "./handler";

export interface Env {
  /** 60 requests per minute per IP (wrangler.jsonc `ratelimits`). */
  RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  /** Registry to read. Default https://junco.madebytobi.com/r. */
  REGISTRY_URL?: string;
}

const CACHE_SECONDS = 300;

/** Fetches registry files through the Cache API, so the docs site sees at most one request per file per 5 minutes per location. */
function cachedFetch(ctx: ExecutionContext): typeof fetch {
  return async (input, init) => {
    const request = new Request(input, init);
    if (request.method !== "GET") return fetch(request);
    const cache = caches.default;
    const hit = await cache.match(request);
    if (hit) return hit;
    const res = await fetch(request);
    if (!res.ok) return res;
    const stored = new Response(res.body, res);
    stored.headers.set("cache-control", `public, max-age=${CACHE_SECONDS}`);
    ctx.waitUntil(cache.put(request, stored.clone()));
    return stored;
  };
}

export default {
  fetch(request, env, ctx) {
    return handle(request, {
      registryFetch: cachedFetch(ctx),
      registryUrl: env.REGISTRY_URL,
      rateLimit: env.RATE_LIMITER ? async (key) => (await env.RATE_LIMITER!.limit({ key })).success : undefined,
    });
  },
} satisfies ExportedHandler<Env>;
