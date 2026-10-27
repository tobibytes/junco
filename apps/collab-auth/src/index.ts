import { Liveblocks } from "@liveblocks/node";

interface Env {
  LIVEBLOCKS_SECRET_KEY: string;
  ROOM_ID: string;
  ALLOWED_ORIGINS: string;
}

interface AuthRequest {
  room?: unknown;
  user?: {
    id?: unknown;
    name?: unknown;
    color?: unknown;
    avatarUrl?: unknown;
  };
}

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });

function allowedOrigin(env: Env, origin: string | null) {
  if (!origin) return null;
  return env.ALLOWED_ORIGINS.split(",").map((item) => item.trim()).find((item) => item === origin) ?? null;
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function safeText(value: unknown, fallback: string, maxLength: number) {
  return typeof value === "string" ? value.trim().replace(/\p{Cc}/gu, "").slice(0, maxLength) || fallback : fallback;
}

function safeColor(value: unknown) {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value) ? value : "#4263eb";
}

function safeAvatar(value: unknown) {
  if (typeof value !== "string" || value.length > 500) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      const origin = allowedOrigin(env, request.headers.get("Origin"));
      return json({ ok: true, service: "junco-collab-demo-auth" }, 200, origin ? corsHeaders(origin) : {});
    }
    if (url.pathname !== "/auth") return json({ error: "not_found" }, 404);

    const origin = allowedOrigin(env, request.headers.get("Origin"));
    if (!origin) return json({ error: "origin_not_allowed" }, 403);
    const headers = corsHeaders(origin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, { ...headers, Allow: "POST, OPTIONS" });
    const rawBody = await request.text();
    if (rawBody.length > 8_192) return json({ error: "request_too_large" }, 413, headers);
    let body: AuthRequest;
    try {
      body = JSON.parse(rawBody) as AuthRequest;
    } catch {
      return json({ error: "invalid_json" }, 400, headers);
    }
    if (body.room !== env.ROOM_ID) return json({ error: "room_not_allowed" }, 403, headers);

    const requestedId = safeText(body.user?.id, "", 80);
    if (!/^[a-zA-Z0-9:_-]{1,80}$/.test(requestedId)) return json({ error: "invalid_user" }, 400, headers);

    try {
      const liveblocks = new Liveblocks({ secret: env.LIVEBLOCKS_SECRET_KEY });
      const avatar = safeAvatar(body.user?.avatarUrl);
      const session = liveblocks.prepareSession(requestedId, {
        userInfo: {
          name: safeText(body.user?.name, "Guest", 80),
          color: safeColor(body.user?.color),
          ...(avatar ? { avatar } : {}),
        },
      });
      // This endpoint only serves the intentionally public, disposable docs demo room.
      session.allow(env.ROOM_ID, session.FULL_ACCESS);
      const { body: token, status } = await session.authorize();
      return new Response(token, { status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
    } catch {
      return json({ error: "authorization_failed" }, 502, headers);
    }
  },
} satisfies ExportedHandler<Env>;
