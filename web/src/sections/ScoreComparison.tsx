import { useState } from "react";
import { ArrowRight, Copy, Plus, RotateCw, Sparkles, TrendingUp } from "lucide-react";
import { getUiCopy } from "@/lib/content";
import type { LanguageCode } from "@/lib/types";

interface ScoreComparisonProps {
  baselineScore: number;
  currentScore: number;
  loopCount: number;
  language: LanguageCode;
  originalInput: string;
  championPrompt: string;
  isRunning: boolean;
  onRunAnotherLoop: () => void;
  onNewIdea: () => void;
}

function pct(score: number): number {
  return Math.round(score * 100);
}

function ScoreComparison({
  baselineScore,
  currentScore,
  loopCount,
  language,
  originalInput,
  championPrompt,
  isRunning,
  onRunAnotherLoop,
  onNewIdea,
}: ScoreComparisonProps) {
  const copy = getUiCopy(language);
  const delta = pct(currentScore) - pct(baselineScore);
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);

  const promptPreview = championPrompt.split("\n").filter(Boolean).slice(0, 4).join(" ");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(championPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="panel-command overflow-hidden">
      <div className="grid gap-px bg-[#111827] lg:grid-cols-[1.15fr_1fr]">
        <div className="bg-[#060b14] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#86efac]" />
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{copy.improvement}</p>
            </div>
            <span className="rounded-full border border-[#1f2937] bg-[#0b1120] px-3 py-1 font-mono text-xs text-[#cbd5e1]">
              {copy.loop} {loopCount}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#64748b]">{copy.baselineQuality}</p>
              <p className="font-mono text-3xl font-semibold text-[#94a3b8]">{pct(baselineScore)}</p>
            </div>
            <ArrowRight className="mb-2 h-5 w-5 text-[#475569]" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#64748b]">{copy.currentQuality}</p>
              <p className="score-gradient font-mono text-5xl font-bold leading-none">{pct(currentScore)}</p>
            </div>
            {delta > 0 && (
              <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-[#6c5ce7]/40 bg-[#1a1535]/45 px-2.5 py-1 text-xs font-medium text-[#c4b5fd]">
                <Sparkles className="h-3 w-3" />+{delta} {copy.points}
              </span>
            )}
          </div>

          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#0f172a]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#a78bfa] via-[#6c5ce7] to-[#00d2ff] transition-[width] duration-700 ease-out"
              style={{ width: `${pct(currentScore)}%` }}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={onRunAnotherLoop}
              disabled={isRunning}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isRunning
                  ? "cursor-not-allowed bg-[#0f172a] text-[#475569]"
                  : "fractal-gradient-bg text-white shadow-[0_0_28px_-12px_rgba(108,92,231,0.55)]"
              }`}
            >
              <RotateCw className="h-4 w-4" />
              {copy.runAnotherLoop}
            </button>
            <button
              onClick={onNewIdea}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-xl border border-[#1f2937] px-4 py-2.5 text-sm text-[#cbd5e1] transition hover:border-[#67e8f9] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {copy.newIdea}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-px bg-[#111827]">
          <div className="min-h-[104px] bg-[#060b14] p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#64748b]">{copy.yourIdea}</p>
            </div>
            <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-[#cbd5e1]">
              {originalInput.trim() || "--"}
            </p>
          </div>

          <div className="min-h-[104px] bg-[#060b14] p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#67e8f9]">{copy.winningPrompt}</p>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-lg border border-[#1f2937] px-2 py-1 text-[10px] text-[#94a3b8] hover:border-[#67e8f9]"
              >
                <Copy className="h-3 w-3" />
                {copied ? copy.copied : "Copy"}
              </button>
            </div>
            <p className="line-clamp-3 text-sm leading-6 text-[#f1f5f9]">{promptPreview || "--"}</p>
          </div>

          {originalInput.trim() && (
            <button
              onClick={() => setShowDiff(!showDiff)}
              className="bg-[#060b14] px-4 py-2 text-left text-[10px] uppercase tracking-[0.2em] text-[#67e8f9] hover:text-[#a5f3fc]"
            >
              {showDiff ? "Hide" : "Show"} side-by-side diff
            </button>
          )}

          {showDiff && originalInput.trim() && (
            <div className="grid grid-cols-2 gap-px bg-[#111827]">
              <div className="max-h-60 overflow-y-auto bg-[#060b14] p-3 font-mono text-[10px] leading-5 text-[#cbd5e1] whitespace-pre-wrap">
                {originalInput}
              </div>
              <div className="max-h-60 overflow-y-auto bg-[#082f49]/24 p-3 font-mono text-[10px] leading-5 text-[#f1f5f9] whitespace-pre-wrap">
                {championPrompt}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ScoreComparison;
