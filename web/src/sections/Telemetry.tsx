import { Shield, Sparkles, Target, TrendingUp, Trophy, Zap } from "lucide-react";
import { getUiCopy } from "@/lib/content";
import type { Evaluation, LanguageCode, LeaderboardEntry, RoundSummary } from "@/lib/types";

interface TelemetryProps {
  leaderboard: LeaderboardEntry[];
  bestEvaluation: Evaluation | null;
  roundSummaries: RoundSummary[];
  currentRound: number;
  isRunning: boolean;
  language: LanguageCode;
}

function Telemetry({
  leaderboard,
  bestEvaluation,
  roundSummaries,
  currentRound,
  isRunning,
  language,
}: TelemetryProps) {
  const copy = getUiCopy(language);

  return (
    <aside className="space-y-4">
      <div className="panel-command p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">
              {copy.evolutionProgress}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#64748b]">{copy.telemetryHint}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs ${isRunning ? "bg-[#082f49] text-[#67e8f9]" : "bg-[#0b1120] text-[#94a3b8]"}`}>
            {copy.round} {currentRound || 0}
          </div>
        </div>

        <div className="space-y-2">
          {roundSummaries.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#1f2937] p-4 text-sm text-[#94a3b8]">
              {copy.waiting}
            </div>
          )}
          {roundSummaries.map((round) => (
            <div
              key={round.round}
              className={`rounded-2xl border px-3 py-3 ${
                round.round === currentRound
                  ? "border-[#67e8f9] bg-[#082f49]/45"
                  : "border-[#1f2937] bg-[#060b14]/75"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-white">
                  {copy.round} {round.round}
                </span>
                <span className="font-mono text-[#86efac]">{round.winner_score.toFixed(3)}</span>
              </div>
              <div className="mt-1 text-xs text-[#94a3b8]">
                {round.winner_id} - {round.winner_style}
              </div>
            </div>
          ))}
        </div>
      </div>

      {bestEvaluation && (
        <div className="panel-command p-4">
          <p className="mb-4 text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">
            {copy.pressureScores}
          </p>
          <div className="space-y-3">
            <Metric label="Coverage" value={bestEvaluation.metrics.coverage} icon={Target} />
            <Metric label="Structure" value={bestEvaluation.metrics.structure} icon={Shield} />
            <Metric label="Actionability" value={bestEvaluation.metrics.actionability} icon={Zap} />
            <Metric label="Novelty" value={bestEvaluation.metrics.novelty} icon={Sparkles} />
            <Metric label="Anti-vague" value={bestEvaluation.metrics.anti_vague} icon={TrendingUp} />
          </div>
          <div className="mt-4 rounded-2xl border border-[#1f2937] bg-[#060b14]/88 p-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{copy.totalScore}</p>
            <p className="mt-2 text-3xl font-semibold text-[#86efac]">
              {bestEvaluation.total_score.toFixed(3)}
            </p>
          </div>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="panel-command p-4">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#f59e0b]" />
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">
              {copy.leaderboard}
            </p>
          </div>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.candidate_id}
                className={`rounded-2xl border px-3 py-3 ${
                  index === 0
                    ? "border-[#86efac]/50 bg-[#052e16]/65"
                    : "border-[#1f2937] bg-[#060b14]/75"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">#{index + 1} {entry.candidate_id}</p>
                    <p className="mt-1 text-xs text-[#94a3b8]">{entry.style}</p>
                  </div>
                  <p className="font-mono text-sm text-[#a78bfa]">{entry.score.toFixed(3)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Target;
}) {
  const width = Math.round(value * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-[#cbd5e1]">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-[#a78bfa]" />
          <span>{label}</span>
        </div>
        <span className="font-mono">{width}%</span>
      </div>
      <div className="metric-bar">
        <div className="metric-bar-fill bg-gradient-to-r from-[#a78bfa] via-[#6c5ce7] to-[#00d2ff]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default Telemetry;
