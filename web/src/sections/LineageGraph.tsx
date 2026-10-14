import type { RoundDetail } from "@/lib/types";

interface LineageGraphProps {
  rounds: RoundDetail[];
}

export default function LineageGraph({ rounds }: LineageGraphProps) {
  if (rounds.length === 0) return null;

  const NODE_W = 140;
  const NODE_H = 36;
  const LAYER_GAP = 50;
  const NODE_GAP = 10;
  const PAD = 20;

  const maxInLayer = Math.max(
    ...rounds.map((r) => r.candidates.length),
    1
  );

  const svgW = rounds.length * (NODE_W + LAYER_GAP) + PAD * 2;
  const svgH = maxInLayer * (NODE_H + NODE_GAP) + PAD * 2 + 30;

  function nodeX(roundIdx: number): number {
    return PAD + roundIdx * (NODE_W + LAYER_GAP);
  }

  function nodeY(roundIdx: number, candidateIdx: number): number {
    const layerSize = rounds[roundIdx]?.candidates.length ?? 1;
    const totalH = layerSize * NODE_H + (layerSize - 1) * NODE_GAP;
    const startY = PAD + (svgH - PAD * 2 - totalH) / 2;
    return startY + candidateIdx * (NODE_H + NODE_GAP);
  }

  const roundColors = ["#8bd7ff", "#5aa7ff", "#9ee6a8", "#f7c86a", "#ef4444"];

  return (
    <div className="panel-elevated overflow-x-auto p-4">
      <p className="mb-3 text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">
        Evolution Lineage
      </p>
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="min-w-full"
      >
        {/* Round labels */}
        {rounds.map((round, ri) => (
          <text
            key={`label-${ri}`}
            x={nodeX(ri) + NODE_W / 2}
            y={14}
            textAnchor="middle"
            fill={roundColors[ri % roundColors.length]}
            fontSize={10}
            fontWeight={600}
            fontFamily="monospace"
          >
            Round {round.round}
          </text>
        ))}

        {/* Connections (simple: all to all next layer) */}
        {rounds.slice(0, -1).map((round, ri) => {
          const nextRound = rounds[ri + 1];
          if (!nextRound) return null;
          return round.candidates.map((_, ci) => {
            const fromX = nodeX(ri) + NODE_W;
            const fromY = nodeY(ri, ci) + NODE_H / 2;
            return nextRound.candidates.map((__, nci) => {
              const toX = nodeX(ri + 1);
              const toY = nodeY(ri + 1, nci) + NODE_H / 2;
              return (
                <line
                  key={`edge-${ri}-${ci}-${nci}`}
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#1b2533"
                  strokeWidth={0.5}
                  opacity={0.4}
                />
              );
            });
          });
        })}

        {/* Candidate nodes */}
        {rounds.map((round, ri) =>
          round.candidates.map((candidate, ci) => {
            const x = nodeX(ri);
            const y = nodeY(ri, ci);
            const isWinner = candidate.is_winner;
            const fill = isWinner ? roundColors[ri % roundColors.length] : "#0b111c";
            const stroke = isWinner ? fill : "#1b2533";
            const textColor = isWinner ? "#06121e" : "#94a3b8";

            return (
              <g key={`node-${ri}-${ci}`}>
                <rect
                  x={x}
                  y={y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  ry={8}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isWinner ? 2 : 1}
                />
                <text
                  x={x + NODE_W / 2}
                  y={y + NODE_H / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textColor}
                  fontSize={10}
                  fontFamily="monospace"
                >
                  {candidate.candidate_id.length > 14
                    ? candidate.candidate_id.slice(0, 12) + ".."
                    : candidate.candidate_id}
                </text>
                <text
                  x={x + NODE_W / 2}
                  y={y + NODE_H - 4}
                  textAnchor="middle"
                  fill={isWinner ? textColor : "#64748b"}
                  fontSize={8}
                  fontFamily="monospace"
                >
                  {candidate.change_type} · {Math.round(candidate.score * 100)}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}
