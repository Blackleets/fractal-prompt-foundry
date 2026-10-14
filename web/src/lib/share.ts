import { z } from "zod";
import type { LanguageCode, UserPresetId } from "./types";

const ShareSchema = z.object({
  v: z.literal(1),
  lang: z.string(),
  preset: z.string(),
  original_input: z.string().max(20000),
  prompt: z.string().min(1).max(50000),
  score: z.number().min(0).max(1),
  report_markdown: z.string().max(20000),
});

export type SharePayload = z.infer<typeof ShareSchema> & {
  lang: LanguageCode;
  preset: UserPresetId;
};

function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShare(payload: SharePayload): string {
  ShareSchema.parse(payload);
  return toBase64Url(JSON.stringify(payload));
}

export function decodeShare(s: string): SharePayload {
  if (!s || s.length > 12000) throw new Error("Share link too long");
  const json = fromBase64Url(s);
  if (json.length > 100000) throw new Error("Share payload too large");
  const parsed = ShareSchema.parse(JSON.parse(json));
  return parsed as SharePayload;
}

export function buildShareUrl(payload: SharePayload): string {
  const encoded = encodeShare(payload);
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?run=${encoded}`;
}

export function readShareFromLocation(): SharePayload | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("run");
    if (!raw) return null;
    return decodeShare(raw);
  } catch {
    return null;
  }
}

export function clearShareFromUrl() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("run");
    window.history.replaceState({}, "", url.pathname + url.hash);
  } catch {
    // noop
  }
}
