import { useState } from "react";
import { Check, Copy, Download, ExternalLink, FileJson, FileText, Link2 } from "lucide-react";
import { getUiCopy } from "@/lib/content";
import { buildShareUrl } from "@/lib/share";
import type { LanguageCode } from "@/lib/types";

interface ExportBarProps {
  championPrompt: string;
  originalInput: string;
  reportMarkdown: string;
  language: LanguageCode;
  score?: number;
  preset?: string;
}

export default function ExportBar({
  championPrompt,
  originalInput,
  reportMarkdown,
  language,
  score = 0.9,
  preset = "founder",
}: ExportBarProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const copy = getUiCopy(language);

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1200);
  };

  const download = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const openInChatGPT = () => {
    const encoded = encodeURIComponent(championPrompt);
    window.open(`https://chatgpt.com/?q=${encoded.slice(0, 2000)}`, "_blank", "noopener");
  };

  const openInClaude = () => {
    const encoded = encodeURIComponent(championPrompt);
    window.open(`https://claude.ai/new?q=${encoded.slice(0, 2000)}`, "_blank", "noopener");
  };

  const handleShare = async () => {
    try {
      const url = buildShareUrl({
        v: 1,
        lang: language,
        preset: (preset as "founder") ?? "founder",
        original_input: originalInput.slice(0, 20000),
        prompt: championPrompt.slice(0, 50000),
        score: Math.min(1, Math.max(0, score)),
        report_markdown: reportMarkdown.slice(0, 20000),
      });
      await navigator.clipboard.writeText(url);
      setCopiedType("share");
      setTimeout(() => setCopiedType(null), 1500);
    } catch {
      setCopiedType("share-error");
      setTimeout(() => setCopiedType(null), 1500);
    }
  };

  return (
    <div className="panel-elevated p-4">
      <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">Export & Open</p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCopy(championPrompt, "prompt")}
          className="foundry-button-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs"
        >
          {copiedType === "prompt" ? <Check className="h-3.5 w-3.5 text-[#00b894]" /> : <Copy className="h-3.5 w-3.5" />}
          {copiedType === "prompt" ? copy.copied : "Copy Prompt"}
        </button>

        <button
          onClick={() => download("prompt.md", championPrompt, "text/markdown")}
          className="foundry-button-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs"
        >
          <FileText className="h-3.5 w-3.5" />
          Download .md
        </button>

        <button
          onClick={() => download("prompt.txt", championPrompt, "text/plain")}
          className="foundry-button-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Download .txt
        </button>

        <button
          onClick={() => handleCopy(buildSystemPrompt(championPrompt), "system")}
          className="foundry-button-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs"
        >
          {copiedType === "system" ? <Check className="h-3.5 w-3.5 text-[#00b894]" /> : <Copy className="h-3.5 w-3.5" />}
          {copiedType === "system" ? copy.copied : "Copy as System Prompt"}
        </button>

        {originalInput.trim() && (
          <button
            onClick={() => handleCopy(diffText(originalInput, championPrompt), "diff")}
            className="foundry-button-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs"
          >
            {copiedType === "diff" ? <Check className="h-3.5 w-3.5 text-[#00b894]" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedType === "diff" ? copy.copied : "Copy Before/After"}
          </button>
        )}

        <button
          onClick={() => handleCopy(reportMarkdown, "report")}
          className="foundry-button-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs"
        >
          {copiedType === "report" ? <Check className="h-3.5 w-3.5 text-[#00b894]" /> : <FileJson className="h-3.5 w-3.5" />}
          {copiedType === "report" ? copy.copied : "Copy Report"}
        </button>

        <button
          onClick={() => void handleShare()}
          title="Copia un link ?run= con este campeón (sin API keys)"
          className="inline-flex items-center gap-2 rounded-xl border border-[#6C5CE7]/50 bg-[#6C5CE7]/15 px-4 py-2.5 text-xs text-[#C4B5FD] hover:bg-[#6C5CE7]/25"
        >
          {copiedType === "share" ? <Check className="h-3.5 w-3.5 text-[#00E6A0]" /> : <Link2 className="h-3.5 w-3.5" />}
          {copiedType === "share" ? "Link copiado" : copiedType === "share-error" ? "Link muy largo" : "Copy Share Link"}
        </button>
        <p className="w-full text-[11px] leading-4 text-[#6b6880]">
          El share link lleva solo prompt + reporte (nunca tu API key). Si es confidencial, usa Copy local en vez de Open-in.
        </p>

        <div className="w-px self-stretch bg-[#2d3436]" />

        <PlatformExportButton
          label="ChatGPT"
          bgClass="bg-[#1a1a2e] hover:bg-[#16213e] text-white"
          onClick={openInChatGPT}
          copyContent={formatChatGPT(championPrompt)}
          onCopied={setCopiedType}
          copiedType={copiedType}
          copyKey="chatgpt"
        />

        <PlatformExportButton
          label="Claude"
          bgClass="bg-[#2d1b00] hover:bg-[#3d2b10] text-[#d4a574]"
          onClick={openInClaude}
          copyContent={formatClaude(championPrompt)}
          onCopied={setCopiedType}
          copiedType={copiedType}
          copyKey="claude"
        />

        <PlatformExportButton
          label="Gemini"
          bgClass="bg-[#0b2b1d] hover:bg-[#0f3d2a] text-[#66bb8a]"
          onClick={() => {
            const encoded = encodeURIComponent(championPrompt);
            window.open(`https://gemini.google.com/?q=${encoded.slice(0, 2000)}`, "_blank", "noopener");
          }}
          copyContent={formatGemini(championPrompt)}
          onCopied={setCopiedType}
          copiedType={copiedType}
          copyKey="gemini"
        />
      </div>
    </div>
  );
}

function PlatformExportButton({
  label,
  bgClass,
  onClick,
  copyContent,
  onCopied,
  copiedType,
  copyKey,
}: {
  label: string;
  bgClass: string;
  onClick: () => void;
  copyContent: string;
  onCopied: (key: string | null) => void;
  copiedType: string | null;
  copyKey: string;
}) {
  return (
    <div className="flex rounded-xl border border-[#2d3436] overflow-hidden">
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-3 py-2.5 text-xs ${bgClass}`}
        title={`Open in ${label}`}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        {label}
      </button>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(copyContent);
          onCopied(copyKey);
          setTimeout(() => onCopied(null), 1200);
        }}
        className="inline-flex items-center gap-1.5 border-l border-[#2d3436] bg-[#17191c] px-3 py-2.5 text-xs text-[#94a3b8] hover:text-white"
        title={`Copy ${label}-formatted prompt`}
      >
        {copiedType === copyKey ? <Check className="h-3 w-3 text-[#00b894]" /> : <Copy className="h-3.5 w-3.5" />}
        {copiedType === copyKey ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function formatChatGPT(prompt: string): string {
  return `You are an AI assistant optimized with the following instructions:\n\n${prompt}\n\n---\nPaste this into ChatGPT's "Custom Instructions" or use as the first message in a new chat.`;
}

function formatClaude(prompt: string): string {
  return `You are operating under the following optimized instruction set:\n\n${prompt}\n\n---\nPaste this into Claude's "Custom Instructions" in Project Settings.`;
}

function formatGemini(prompt: string): string {
  return `You are following these optimized instructions:\n\n${prompt}\n\n---\nPaste this into Gemini's "Custom instructions" or use as a system prompt.`;
}

function buildSystemPrompt(prompt: string): string {
  return [
    "You are operating under the following optimized instruction set.",
    "Follow it exactly unless the user gives a newer direct instruction.",
    "",
    prompt,
  ].join("\n");
}

function diffText(before: string, after: string): string {
  return [
    "=== BEFORE (Original Input) ===",
    before,
    "",
    "=== AFTER (Optimized Prompt) ===",
    after,
    "",
    "--- Changes ---",
    `Original length: ${before.length} chars`,
    `Optimized length: ${after.length} chars`,
    `Delta: ${after.length - before.length >= 0 ? "+" : ""}${after.length - before.length} chars`,
  ].join("\n");
}
