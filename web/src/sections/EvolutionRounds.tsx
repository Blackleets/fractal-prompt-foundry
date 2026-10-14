import { useState } from "react";
import {
  ChevronDown,
  Dna,
  GitMerge,
  RotateCw,
  Sparkles,
  Sprout,
  Trophy,
} from "lucide-react";
import { getUiCopy } from "@/lib/content";
import type { ChangeType, LanguageCode, RoundDetail } from "@/lib/types";

interface EvolutionRoundsProps {
  rounds: RoundDetail[];
  totalRounds: number;
  currentRound: number;
  livePhase: number;
  isRunning: boolean;
  isComplete: boolean;
  language: LanguageCode;
}

function pct(score: number): number {
  return Math.round(score * 100);
}

function EvolutionRounds({
  rounds,
  totalRounds,
  currentRound,
  livePhase,
  isRunning,
  isComplete,
  language,
}: EvolutionRoundsProps) {
  const copy = getUiCopy(language);
  const phases = [
    copy.phaseGenerate,
    copy.phaseEvaluate,
    copy.phaseCritique,
    copy.phaseMutate,
    copy.phaseWinner,
  ];

  const showActiveCard = isRunning && currentRound > rounds.length;
  const isEmpty = !isRunning && rounds.length === 0;

  return (
    <section className="panel-command overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232040] bg-[#0c0a18]/95 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[#3d3560] bg-[#1a1535]/60 p-2">
            <Dna className="h-5 w-5 text-[#a78bfa]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{copy.evolutionTitle}</p>
            <p className="text-xs text-[#94a3b8]">{copy.evolutionHint}</p>
          </div>
        </div>
        {(isRunning || isComplete) && (
          <div className="rounded-full border border-[#1f2937] bg-[#0b1120] px-3 py-1 font-mono text-xs text-[#cbd5e1]">
            {copy.round} {Math.min(currentRound || rounds.length, totalRounds)}/{totalRounds}
          </div>
        )}
      </header>

      <div className="p-5">
        {isEmpty && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#1f2937] px-6 py-14 text-center">
            <div className="rounded-2xl border border-[#164e63] bg-[#082f49]/50 p-3">
              <Sparkles className="h-6 w-6 text-[#a78bfa]" />
            </div>
            <p className="max-w-sm text-sm text-[#94a3b8]">{copy.evolutionEmpty}</p>
          </div>
        )}

        {(rounds.length > 0 || showActiveCard) && (
          <div className="relative">
            {rounds.map((round, index) => {
              const hasNext = index < rounds.length - 1 || showActiveCard;
              return (
                <div key={round.round} className="relative flex gap-4 pb-4 last:pb-0">
                  <TimelineRail value={String(round.round)} connected={hasNext} live={false} />
                  <RoundCard
                    round={round}
                    phases={phases}
                    language={language}
                    isLatest={isComplete && index === rounds.length - 1}
                  />
                </div>
              );
            })}

            {showActiveCard && (
              <div className="relative flex gap-4">
                <TimelineRail value="" connected={false} live />
                <ActiveRoundCard
                  roundNumber={currentRound}
                  phases={phases}
                  livePhase={livePhase}
                  language={language}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TimelineRail({ value, connected, live }: { value: string; connected: boolean; live: boolean }) {
  return (
    <div className="relative flex w-9 flex-col items-center">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-sm font-semibold ${
          live
            ? "border-[#a78bfa] bg-[#1a1535]/60 text-[#e8e6f0]"
            : "border-[#3d3560] bg-[#0c0a18] text-[#a78bfa]"
        }`}
      >
        {live ? <RotateCw className="h-4 w-4 animate-spin text-[#a78bfa]" style={{ animationDuration: "2s" }} /> : value}
      </div>
      {connected && <div className="round-spine mt-1 w-[2px] flex-1" />}
    </div>
  );
}

function PhaseStepper({
  phases,
  activeIndex,
  done,
}: {
  phases: string[];
  activeIndex: number;
  done: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {phases.map((phase, index) => {
        const isActive = !done && index === activeIndex;
        const isPast = done || index < activeIndex;
        return (
          <span
            key={phase}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] transition-colors ${
              isActive
                ? "border-[#67e8f9] bg-[#082f49]/70 text-white"
                : isPast
                  ? "border-[#14532d] bg-[#052e16]/70 text-[#bbf7d0]"
                  : "border-[#1f2937] bg-[#0b1120] text-[#64748b]"
            }`}
            style={isActive ? { animation: "phasePulse 1.1s ease-in-out infinite" } : undefined}
          >
            {phase}
          </span>
        );
      })}
    </div>
  );
}

function RoundCard({
  round,
  phases,
  language,
  isLatest,
}: {
  round: RoundDetail;
  phases: string[];
  language: LanguageCode;
  isLatest: boolean;
}) {
  const copy = getUiCopy(language);
  const [open, setOpen] = useState(false);
  const delta = round.improvement_from_previous;

  return (
    <article
      className={`flex-1 rounded-2xl border p-4 ${
        isLatest
          ? "border-[#86efac]/45 bg-[#052e16]/45 shadow-[0_0_40px_-18px_rgba(34,197,94,0.4)]"
          : "border-[#1f2937] bg-[#060b14]"
      }`}
      style={{ animation: "roundReveal 0.45s ease-out both" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">
            {copy.round} {round.round}
          </p>
          <p className="text-xs text-[#94a3b8]">
            {round.candidates.length} {copy.candidates}
          </p>
        </div>
        <div className="text-right">
          <p className="score-gradient font-mono text-3xl font-bold leading-none">{pct(round.winner_score)}</p>
          {delta > 0 && (
            <p className="mt-1 text-xs font-medium text-[#bbf7d0]">
              +{Math.round(delta * 100)} {copy.points}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3">
        <PhaseStepper phases={phases} activeIndex={phases.length - 1} done />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#1f2937] bg-[#0b1120]/70 px-3 py-2">
        <Trophy className="h-3.5 w-3.5 shrink-0 text-[#f59e0b]" />
        <span className="font-mono text-xs text-white">{round.winner_id}</span>
        <ChangeBadge type={round.candidates.find((candidate) => candidate.is_winner)?.change_type ?? "seed"} language={language} />
        <span className="text-xs text-[#94a3b8]">- {round.winner_style}</span>
      </div>

      {round.best_critique.length > 0 && (
        <div className="mt-2 rounded-xl border border-[#1f2937] bg-[#0a0f17] px-3 py-2">
          <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-[#64748b]">{copy.critique}</p>
          <p className="text-xs leading-5 text-[#cbd5e1]">{round.best_critique[0]}</p>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#94a3b8] transition-colors hover:text-white"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        {open ? copy.hideCandidates : copy.showCandidates}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {round.candidates.map((candidate) => (
            <div
              key={candidate.candidate_id}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                candidate.is_winner
                  ? "border-[#86efac]/40 bg-[#052e16]/45"
                  : "border-[#1f2937] bg-[#0b1120]/55"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <ChangeBadge type={candidate.change_type} language={language} />
                <span className="truncate font-mono text-xs text-[#cbd5e1]">{candidate.candidate_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#0f172a]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#a78bfa] to-[#00d2ff]"
                    style={{ width: `${pct(candidate.score)}%` }}
                  />
                </div>
                <span className="w-7 text-right font-mono text-xs text-white">{pct(candidate.score)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function ActiveRoundCard({
  roundNumber,
  phases,
  livePhase,
  language,
}: {
  roundNumber: number;
  phases: string[];
  livePhase: number;
  language: LanguageCode;
}) {
  const copy = getUiCopy(language);
  return (
    <article
      className="flex-1 rounded-2xl border border-[#67e8f9]/50 bg-[#082f49]/35 p-4 shadow-[0_0_40px_-12px_rgba(56,189,248,0.4)]"
      style={{ animation: "roundReveal 0.45s ease-out both" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">
            {copy.round} {roundNumber}
          </p>
          <p className="text-xs text-[#bae6fd]">{phases[Math.min(livePhase, phases.length - 1)]}...</p>
        </div>
      </div>
      <div className="mt-3">
        <PhaseStepper phases={phases} activeIndex={livePhase} done={false} />
      </div>
    </article>
  );
}

function ChangeBadge({ type, language }: { type: ChangeType; language: LanguageCode }) {
  const copy = getUiCopy(language);
  const config: Record<ChangeType, { label: string; className: string; icon: typeof Sprout }> = {
    seed: { label: copy.changeSeed, className: "border-[#232040] bg-[#0c0a18] text-[#8b89a3]", icon: Sprout },
    elite: { label: copy.changeElite, className: "border-[#a78bfa]/40 bg-[#1a1535]/55 text-[#c4b5fd]", icon: Trophy },
    mutation: { label: copy.changeMutation, className: "border-[#00d2ff]/40 bg-[#002a38]/55 text-[#67e8f9]", icon: Sparkles },
    hybrid: { label: copy.changeHybrid, className: "border-[#6c5ce7]/40 bg-[#1a1535]/55 text-[#a78bfa]", icon: GitMerge },
  };
  const { label, className, icon: Icon } = config[type];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default EvolutionRounds;
