import { describe, it, expect } from "vitest";
import { decodeShare, encodeShare } from "../lib/share";

describe("share links (?run=)", () => {
  it("round-trips a minimal payload without api keys", () => {
    const payload = {
      v: 1 as const,
      lang: "es" as const,
      preset: "founder" as const,
      original_input: "idea messy",
      prompt: "ROLE LANE: founder\nPROMPT...",
      score: 0.92,
      report_markdown: "# report",
    };
    const encoded = encodeShare(payload);
    expect(encoded).not.toContain("sk-");
    const decoded = decodeShare(encoded);
    expect(decoded.prompt).toContain("ROLE LANE");
    expect(decoded.score).toBeCloseTo(0.92);
  });

  it("rejects oversized payloads", () => {
    expect(() => decodeShare("a".repeat(12001))).toThrow();
  });

  it("rejects invalid payloads", () => {
    expect(() =>
      encodeShare({
        v: 1 as const,
        lang: "es" as const,
        preset: "founder" as const,
        original_input: "x",
        prompt: "",
        score: 0.5,
        report_markdown: "",
      })
    ).toThrow();
  });
});
