import { describe, expect, it, vi } from "vitest";

import { projectRaw } from "./__fixtures__/project";
import { ApiError, createAlbumsClient, createRateLimiter, parseProjectInput, projectPageUrl } from "./client";

describe("parseProjectInput", () => {
  it.each([
    ["benj", "benj"],
    ["  benj  ", "benj"],
    ["@benj", "benj"],
    ["https://1001albumsgenerator.com/benj", "benj"],
    ["1001albumsgenerator.com/benj?ref=share", "benj"],
    ["https://www.1001albumsgenerator.com/benj/", "benj"],
    ["https://1001albumsgenerator.com/api/v1/projects/benj", "benj"],
    ["https://1001albumsgenerator.com/my%20project", "my project"],
    ["two words", "two words"],
  ])("%j -> %j", (input, expected) => {
    expect(parseProjectInput(input)).toBe(expected);
  });

  it.each(["", "   ", "https://1001albumsgenerator.com/groups", "a/b", "name?x=1"])("rejects %j", (input) => {
    expect(parseProjectInput(input)).toBeNull();
  });

  it("builds the project page URL", () => {
    expect(projectPageUrl("my project")).toBe("https://1001albumsgenerator.com/my%20project");
  });
});

describe("createRateLimiter", () => {
  it("lets `limit` requests through per window and queues the rest", async () => {
    let clock = 0;
    const waits: number[] = [];
    const limiter = createRateLimiter({
      limit: 3,
      windowMs: 60_000,
      now: () => clock,
      sleep: async (ms) => {
        waits.push(ms);
        clock += ms;
      },
    });

    const granted: number[] = [];
    const take = async () => {
      await limiter.acquire();
      granted.push(clock);
    };
    await take();
    clock = 10_000;
    await take();
    clock = 20_000;
    await take();
    // Two more queued at once: the 4th waits for the first slot (t=0) to
    // expire, the 5th for the second (t=10s).
    await Promise.all([take(), take()]);

    expect(granted).toEqual([0, 10_000, 20_000, 60_000, 70_000]);
    expect(waits).toEqual([40_000, 10_000]);
  });

  it("does not block the queue when a waiting caller aborts", async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => 0, sleep: async () => {} });
    await limiter.acquire();
    const controller = new AbortController();
    controller.abort(new Error("cancelled"));
    await expect(limiter.acquire(controller.signal)).rejects.toThrow("cancelled");
  });
});

const response = (status: number, body: unknown, headers: Record<string, string> = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
  json: async () => {
    if (body instanceof Error) throw body;
    return body;
  },
});

const unlimited = { acquire: async () => {} };

describe("createAlbumsClient", () => {
  it("fetches and normalizes a project", async () => {
    const fetch = vi.fn(async () => response(200, projectRaw));
    const client = createAlbumsClient({ fetch, limiter: unlimited });
    const project = await client.getProject("liner test");
    expect(fetch).toHaveBeenCalledWith(
      "https://1001albumsgenerator.com/api/v1/projects/liner%20test",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
    expect(project.history).toHaveLength(4);
  });

  it.each([
    [response(404, {}), "not-found"],
    [response(429, {}, { "retry-after": "30" }), "rate-limited"],
    [response(503, {}), "server"],
    [response(200, new SyntaxError("Unexpected token <")), "invalid-response"],
    [response(200, { error: "Project not found" }), "invalid-response"],
  ])("maps failures to ApiError kinds (%#)", async (res, kind) => {
    const client = createAlbumsClient({ fetch: async () => res, limiter: unlimited });
    const error = await client.getProject("x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe(kind);
    if (kind === "rate-limited") expect((error as ApiError).retryAfterMs).toBe(30_000);
  });

  it("reports network failures as network errors", async () => {
    const client = createAlbumsClient({
      fetch: async () => {
        throw new TypeError("Network request failed");
      },
      limiter: unlimited,
    });
    await expect(client.getAlbumStats()).rejects.toMatchObject({ kind: "network" });
  });
});
