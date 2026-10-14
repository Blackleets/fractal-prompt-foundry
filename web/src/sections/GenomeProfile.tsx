import { useState } from "react";
import { BookOpen, Copy, Dna, Download, FileJson, GitBranch, Hash, ShieldCheck, Target, Terminal } from "lucide-react";
import { getUiCopy } from "@/lib/content";
import type { FoundryResult, GenomeProfile, LanguageCode } from "@/lib/types";

interface GenomeProfileProps {
  genome: GenomeProfile | null;
  bestPrompt: string | null;
  uniquenessThesis: string[];
  reportMarkdown: string;
  language: LanguageCode;
  isRunning: boolean;
  originalInput: string;
  result: FoundryResult | null;
}

function GenomeProfileSection({
  genome,
  bestPrompt,
  uniquenessThesis,
  reportMarkdown,
  language,
  isRunning,
  originalInput,
  result,
}: GenomeProfileProps) {
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = getUiCopy(language);

  const activeText = showReport ? reportMarkdown : bestPrompt ?? "";

  const handleCopy = async () => {
    if (!activeText) return;
    await navigator.clipboard.writeText(activeText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const handleCopySystemPrompt = async () => {
    if (!bestPrompt) return;
    await navigator.clipboard.writeText(buildSystemPrompt(bestPrompt));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadMarkdown = () => {
    downloadText("fractal-foundry-report.md", reportMarkdown || activeText, "text/markdown");
  };

  const downloadJson = () => {
    if (!result) return;
    downloadText(
      "fractal-foundry-result.json",
      JSON.stringify(result, null, 2),
      "application/json"
    );
  };

  if (!genome) {
    return (
      <div className="panel-elevated p-5">
        <p className="text-sm text-[#94a3b8]">
          {isRunning ? copy.resultsRunning : copy.resultsPending}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="panel-elevated p-5">
        <div className="mb-4 flex items-center gap-2">
          <Dna className="h-4 w-4 text-[#8bd7ff]" />
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">
            {copy.genomeProfile}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <GenomeCard icon={Hash} label="Genome ID" value={genome.genome_id} />
          <GenomeCard icon={GitBranch} label="Lineage" value={String(genome.lineage_depth)} />
          <GenomeCard icon={Target} label="Lane Mix" value={genome.lane_mix.join(" + ")} />
          <GenomeCard icon={BookOpen} label="Domain" value={String(genome.domain_saturation)} />
          <GenomeCard icon={Terminal} label="Imperative" value={String(genome.imperative_density)} />
          <GenomeCard icon={ShieldCheck} label="Control" value={String(genome.control_density)} />
          <GenomeCard icon={BookOpen} label="Bullets" value={String(genome.bullet_density)} />
          <GenomeCard icon={Target} label="Checksum" value={genome.prompt_checksum} />
        </div>
      </div>

      {uniquenessThesis.length > 0 && (
        <div className="panel-elevated p-5">
          <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">
            {copy.uniquenessThesis}
          </p>
          <div className="space-y-2">
            {uniquenessThesis.map((item) => (
              <div key={item} className="rounded-xl border border-[#1b2533] bg-[#0b111c]/75 px-4 py-3 text-sm text-[#e2e8f0]">
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel-elevated p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">
            {copy.championPrompt}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowReport(false)}
              className={toggleClass(!showReport)}
            >
              Prompt
            </button>
            <button
              onClick={() => setShowReport(true)}
              className={toggleClass(showReport)}
            >
              {copy.viewReport}
            </button>
            <button
              onClick={handleCopy}
              className="foundry-button-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
            >
              <Copy className="h-4 w-4" />
              {copied ? copy.copied : copy.copyReport}
            </button>
            <button
              onClick={handleCopySystemPrompt}
              className="foundry-button-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
            >
              <Copy className="h-4 w-4" />
              {copy.copySystemPrompt}
            </button>
            <button
              onClick={downloadMarkdown}
              className="foundry-button-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
            >
              <Download className="h-4 w-4" />
              {copy.downloadMarkdown}
            </button>
            <button
              onClick={downloadJson}
              className="foundry-button-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
            >
              <FileJson className="h-4 w-4" />
              {copy.downloadJson}
            </button>
          </div>
        </div>
        {originalInput.trim() && (
          <div className="mb-3 grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-xl border border-[#1b2533] bg-[#050a12] p-3">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-[#94a3b8]">
                {copy.originalBrief}
              </p>
              <p className="line-clamp-5 text-sm leading-6 text-[#e2e8f0]">
                {originalInput}
              </p>
            </div>
            <div className="rounded-xl border border-[#9ee6a8]/40 bg-[#9ee6a8]/10 p-3">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-[#9ee6a8]">
                {copy.optimizedPrompt}
              </p>
              <p className="text-sm leading-6 text-[#f8fafc]">
                {bestPrompt?.split("\n").slice(0, 3).join(" ") ?? ""}
              </p>
            </div>
          </div>
        )}
        <pre className="max-h-[460px] overflow-auto rounded-2xl border border-[#1b2533] bg-[#050a12]/90 p-4 font-mono text-xs leading-6 text-[#e5e7eb] whitespace-pre-wrap">
          {activeText}
        </pre>
      </div>
    </div>
  );
}

function GenomeCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#1b2533] bg-[#0b111c]/75 p-4">
      <div className="mb-2 flex items-center gap-2 text-[#9ca3af]">
        <Icon className="h-4 w-4 text-[#8bd7ff]" />
        <span className="text-[11px] uppercase tracking-[0.24em]">{label}</span>
      </div>
      <div className="break-words font-mono text-sm text-white">{value}</div>
    </div>
  );
}

function toggleClass(active: boolean): string {
  return active
    ? "rounded-xl border border-[#8bd7ff] bg-[#082f49]/55 px-3 py-2 text-sm text-white"
    : "foundry-button-secondary px-3 py-2 text-sm";
}

function buildSystemPrompt(prompt: string): string {
  return [
    "You are operating under the following optimized instruction set.",
    "Follow it exactly unless the user gives a newer direct instruction.",
    "",
    prompt,
  ].join("\n");
}

function downloadText(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default GenomeProfileSection;
