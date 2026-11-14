import { InvalidResponseError, normalizeAlbumStats, normalizeProject } from "./normalize";
import type { AlbumStats, Project } from "./types";

export const SITE_URL = "https://1001albumsgenerator.com";
export const API_BASE_URL = `${SITE_URL}/api/v1`;

/**
 * The API allows roughly three requests per minute per client. Going over
 * returns 429s, so every request goes through one shared limiter and screens
 * lean on the persisted query cache rather than refetching.
 */
export const RATE_LIMIT = { limit: 3, windowMs: 60_000 } as const;

export type ApiErrorKind = "not-found" | "rate-limited" | "network" | "server" | "invalid-response";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  /** For "rate-limited": how long the server asked us to wait, if it said. */
  readonly retryAfterMs: number | undefined;

  constructor(kind: ApiErrorKind, message: string, options: { status?: number; retryAfterMs?: number; cause?: unknown } = {}) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = options.status;
    this.retryAfterMs = options.retryAfterMs;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export interface RateLimiter {
  /** Resolves once a request may be sent, waiting for a free slot if needed. */
  acquire(signal?: AbortSignal): Promise<void>;
}

/**
 * A sliding-window limiter: at most `limit` acquisitions in any `windowMs`.
 * Callers queue in order, so a burst of queries is spread out instead of
 * failing. `now` and `sleep` are injectable for tests.
 */
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
  sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)),
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}): RateLimiter {
  const stamps: number[] = [];
  let queue: Promise<void> = Promise.resolve();

  return {
    acquire(signal) {
      const turn = queue.then(async () => {
        for (;;) {
          if (signal?.aborted) throw signal.reason ?? new Error("Aborted");
          const t = now();
          while (stamps.length > 0 && t - stamps[0]! >= windowMs) stamps.shift();
          if (stamps.length < limit) {
            stamps.push(t);
            return;
          }
          await sleep(windowMs - (t - stamps[0]!));
        }
      });
      // A cancelled caller must not wedge everyone queued behind it.
      queue = turn.catch(() => undefined);
      return turn;
    },
  };
}

/**
 * Accepts what people actually paste: a bare project name, the project page
 * URL (with or without scheme/www), or an API URL. Returns the identifier, or
 * null if nothing usable is there.
 */
export function parseProjectInput(input: string): string | null {
  let text = input.trim();
  if (!text) return null;
  const match = text.match(/1001albumsgenerator\.com\/(?:api\/v1\/projects\/)?([^/?#\s]+)/i);
  if (match?.[1]) text = match[1];
  try {
    text = decodeURIComponent(text);
  } catch {
    // Leave malformed escapes as typed.
  }
  text = text.replace(/^@/, "").trim();
  if (!text || /[/?#]/.test(text)) return null;
  if (/^(api|groups|albums|info|faq|about)$/i.test(text)) return null;
  return text;
}

/** The project's page on the website, where ratings and reviews are written. */
export const projectPageUrl = (projectId: string) => `${SITE_URL}/${encodeURIComponent(projectId)}`;

function parseRetryAfter(header: string | null, now: number): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, date - now);
}

type FetchLike = (input: string, init?: { signal?: AbortSignal; headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
}>;

export interface AlbumsClient {
  getProject(projectId: string, options?: { signal?: AbortSignal }): Promise<Project>;
  getAlbumStats(options?: { signal?: AbortSignal }): Promise<AlbumStats>;
}

export function createAlbumsClient({
  fetch: fetchImpl = globalThis.fetch as unknown as FetchLike,
  baseUrl = API_BASE_URL,
  limiter = createRateLimiter(RATE_LIMIT),
}: { fetch?: FetchLike; baseUrl?: string; limiter?: RateLimiter } = {}): AlbumsClient {
  async function getJson(path: string, what: string, signal?: AbortSignal): Promise<unknown> {
    await limiter.acquire(signal);
    let response: Awaited<ReturnType<FetchLike>>;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, { signal, headers: { Accept: "application/json" } });
    } catch (cause) {
      if (signal?.aborted) throw cause;
      throw new ApiError("network", `Couldn't reach 1001 Albums Generator`, { cause });
    }
    if (response.status === 404) throw new ApiError("not-found", `${what} not found`, { status: 404 });
    if (response.status === 429) {
      throw new ApiError("rate-limited", "Too many requests, try again in a minute", {
        status: 429,
        retryAfterMs: parseRetryAfter(response.headers.get("retry-after"), Date.now()),
      });
    }
    if (!response.ok) {
      throw new ApiError("server", `1001 Albums Generator returned ${response.status}`, { status: response.status });
    }
    try {
      return await response.json();
    } catch (cause) {
      throw new ApiError("invalid-response", `${what} response wasn't valid JSON`, { cause });
    }
  }

  function parse<T>(fn: () => T): T {
    try {
      return fn();
    } catch (cause) {
      if (cause instanceof InvalidResponseError) throw new ApiError("invalid-response", cause.message, { cause });
      throw cause;
    }
  }

  return {
    async getProject(projectId, { signal } = {}) {
      const json = await getJson(`/projects/${encodeURIComponent(projectId)}`, "Project", signal);
      return parse(() => normalizeProject(json));
    },
    async getAlbumStats({ signal } = {}) {
      const json = await getJson("/albums/stats", "Album stats", signal);
      return parse(() => normalizeAlbumStats(json));
    },
  };
}
