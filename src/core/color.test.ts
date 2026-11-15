import { describe, expect, it } from "vitest";

import { backdropColor, contrastRatio, parseHex, pickAccent, readableTextOn, toHex } from "./color";

describe("colour helpers", () => {
  it("parses and prints hex", () => {
    expect(parseHex("#f60")).toEqual({ r: 255, g: 102, b: 0 });
    expect(parseHex("F2542DFF")).toEqual({ r: 242, g: 84, b: 45 });
    expect(parseHex("rgb(0,0,0)")).toBeNull();
    expect(toHex({ r: 242, g: 84, b: 45 })).toBe("#f2542d");
  });

  it("chooses readable text", () => {
    expect(readableTextOn("#ffffff")).toBe("#000000");
    expect(readableTextOn("#101010")).toBe("#ffffff");
    expect(readableTextOn("#F2542D")).toBe("#000000");
  });

  it("picks the most colourful candidate and makes it legible under white text", () => {
    const accent = pickAccent(["#f5f5f5", "#111111", "#e0a030", "#888888"])!;
    const rgb = parseHex(accent)!;
    expect(rgb.r).toBeGreaterThan(rgb.b);
    expect(contrastRatio(rgb, { r: 255, g: 255, b: 255 })).toBeGreaterThanOrEqual(4.5);
    expect(pickAccent([null, "nope"])).toBeNull();
  });

  it("derives backdrops for each scheme", () => {
    expect(backdropColor("#ff0000", true)).toBe("#a60000");
    expect(backdropColor("nope", false)).toBe("#f2f2f7");
  });
});
