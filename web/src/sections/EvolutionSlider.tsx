import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import type { RoundDetail } from "@/lib/types";

interface EvolutionSliderProps {
  rounds: RoundDetail[];
  language: "en" | "es" | "fr" | "de";
}

const UI = {
  en: { title: "Evolution Timeline", round: "Round", winner: "Winner", score: "Score" },
  es: { title: "Linea de Evolucion", round: "Ronda", winner: "Ganador", score: "Puntaje" },
  fr: { title: "Chronologie d'Evolution", round: "Round", winner: "Gagnant", score: "Score" },
  de: { title: "Evolutions-Zeitleiste", round: "Runde", winner: "Gewinner", score: "Wert" },
};

function highlightDiff(current: string, previous: string): { text: string; isNew: boolean }[] {
  const curWords = current.split(/(\s+)/);
  const prevSet = new Set(previous.split(/\s+/));
  return curWords.map((word) => ({
    text: word,
    isNew: word.trim().length > 0 && !prevSet.has(word),
  }));
}

export default function EvolutionSlider({ rounds, language }: EvolutionSliderProps) {
  const [roundIndex, setRoundIndex] = useState(rounds.length - 1);
  const u = UI[language] ?? UI.en;

  const currentRound = rounds[roundIndex];
  const previousPrompt = roundIndex > 0 ? rounds[roundIndex - 1].winner_prompt : "";

  const highlighted = useMemo(() => {
    if (!currentRound || !previousPrompt) return [];
    return highlightDiff(currentRound.winner_prompt, previousPrompt);
  }, [currentRound, previousPrompt]);

  if (rounds.length === 0) return null;

  return (
    <div className="panel-elevated p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#f59e0b]" />
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{u.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoundIndex(Math.max(0, roundIndex - 1))}
            disabled={roundIndex === 0}
            className="rounded-lg border border-[#2d3436] bg-[#17191c] p-1.5 text-[#94a3b8] hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-1.5">
            {rounds.map((_, i) => (
              <button
                key={i}
                onClick={() => setRoundIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === roundIndex
                    ? "w-6 bg-[#f59e0b]"
                    : i < roundIndex
                    ? "w-2 bg-[#f59e0b]/40"
                    : "w-2 bg-[#2d3436]"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setRoundIndex(Math.min(rounds.length - 1, roundIndex + 1))}
            disabled={roundIndex === rounds.length - 1}
            className="rounded-lg border border-[#2d3436] bg-[#17191c] p-1.5 text-[#94a3b8] hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Round info bar */}
      <div className="mb-4 flex items-center gap-4 rounded-xl border border-[#2d3436] bg-[#17191c] px-4 py-2.5">
        <span className="rounded bg-[#f59e0b]/15 px-2 py-0.5 font-mono text-[11px] text-[#fbbf24]">
          {u.round} {currentRound.round}
        </span>
        <span className="text-xs text-[#94a3b8]">
          {u.winner}: <span className="font-mono text-white">{currentRound.winner_id}</span>
        </span>
        <span className="text-xs text-[#94a3b8]">
          {u.score}: <span className="font-mono text-[#fbbf24]">{Math.round(currentRound.winner_score * 100)}</span>
        </span>
        {currentRound.improvement_from_previous > 0 && (
          <span className="ml-auto font-mono text-[11px] text-[#4ade80]">
            +{Math.round(currentRound.improvement_from_previous * 100)}
          </span>
        )}
      </div>

      {/* Prompt with animated diff */}
      <div className="relative max-h-[300px] overflow-auto rounded-2xl border border-[#2d3436] bg-[#0d0f10] p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={roundIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {previousPrompt && currentRound ? (
              <p className="font-mono text-[11px] leading-6 whitespace-pre-wrap">
                {highlighted.map((word, i) => (
                  <span
                    key={i}
                    className={
                      word.isNew
                        ? "rounded bg-[#4ade80]/15 px-0.5 text-[#4ade80]"
                        : "text-[#cbd5e1]"
                    }
                  >
                    {word.text}
                  </span>
                ))}
              </p>
            ) : (
              <p className="font-mono text-[11px] leading-6 text-[#cbd5e1] whitespace-pre-wrap">
                {currentRound?.winner_prompt}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend */}
      {previousPrompt && (
        <p className="mt-2 text-[10px] text-[#64748b]">
          <span className="inline-block h-2 w-2 rounded bg-[#4ade80]/40 mr-1" />
          New/changed words vs round {roundIndex}
        </p>
      )}
    </div>
  );
}
