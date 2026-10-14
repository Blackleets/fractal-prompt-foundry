import { useRef } from "react";
import { Download, Fingerprint } from "lucide-react";
import type { FoundryResult } from "@/lib/types";

interface DNAFingerprintCardProps {
  result: FoundryResult;
  language: "en" | "es" | "fr" | "de";
}

const UI = {
  en: { title: "DNA Fingerprint", download: "Download Card", genomeId: "Genome ID", score: "Score", metrics: "Pressure Balance" },
  es: { title: "Huella Genética", download: "Descargar Tarjeta", genomeId: "ID del Genoma", score: "Puntaje", metrics: "Balance de Presión" },
  fr: { title: "Empreinte Génétique", download: "Télécharger la Carte", genomeId: "ID Génome", score: "Score", metrics: "Équilibre de Pression" },
  de: { title: "Genetischer Fingerabdruck", download: "Karte Herunterladen", genomeId: "Genom-ID", score: "Wert", metrics: "Druckbilanz" },
};

const METRIC_COLORS: Record<string, string> = {
  coverage: "#8bd7ff",
  structure: "#5aa7ff",
  actionability: "#9ee6a8",
  novelty: "#f59e0b",
  anti_vague: "#ef4444",
};

function CardSvg({ result }: { result: FoundryResult }) {
  const g = result.genome_profile;
  const w = 420;
  const h = 600;
  const metrics = result.best_evaluation.metrics;
  const metricEntries = Object.entries(metrics);

  // Generate a unique visual pattern from genome_id
  const seed = g.genome_id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const bands: { x: number; y: number; w: number; h: number; color: string }[] = [];
  for (let i = 0; i < 24; i++) {
    const val = ((seed * (i + 1)) % 255) / 255;
    bands.push({
      x: 30 + (i % 12) * 30,
      y: i < 12 ? 160 : 180,
      w: 16,
      h: val * 24 + 4,
      color: `hsl(${(val * 360 + seed) % 360}, 70%, ${40 + val * 30}%)`,
    });
  }

  // DNA helix simplified
  const dnaPoints: { x: number; y: number; r: number; color: string }[] = [];
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const x = 210 + Math.sin(angle) * 40;
    const y = 220 + i * 8;
    const ci = i % metricEntries.length;
    dnaPoints.push({
      x,
      y,
      r: 3 + Math.abs(Math.sin(angle)) * 3,
      color: METRIC_COLORS[metricEntries[ci]?.[0]] ?? "#8bd7ff",
    });
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#050A12" />
          <stop offset="100%" stopColor="#0B111C" />
        </linearGradient>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8bd7ff" />
          <stop offset="50%" stopColor="#5aa7ff" />
          <stop offset="100%" stopColor="#9ee6a8" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={w} height={h} rx={16} fill="url(#bgGrad)" stroke="#1b2533" strokeWidth={1} />

      {/* Top accent line */}
      <rect x={0} y={0} width={w} height={4} fill="url(#scoreGrad)" rx={2} />

      {/* Title */}
      <text x={w / 2} y={36} textAnchor="middle" fill="#8bd7ff" fontSize={11} fontFamily="monospace" fontWeight={700} letterSpacing={3}>
        FRACTAL PROMPT FOUNDRY
      </text>
      <text x={w / 2} y={54} textAnchor="middle" fill="#94a3b8" fontSize={8} fontFamily="monospace" letterSpacing={2}>
        DNA FINGERPRINT
      </text>

      {/* Genome ID */}
      <text x={210} y={82} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="monospace">
        GENOME ID
      </text>
      <text x={210} y={100} textAnchor="middle" fill="#e2e8f0" fontSize={13} fontFamily="monospace" fontWeight={700}>
        {g.genome_id}
      </text>

      {/* Lane Mix */}
      <text x={210} y={124} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="monospace">
        LANE MIX
      </text>
      <text x={210} y={140} textAnchor="middle" fill="#94a3b8" fontSize={10} fontFamily="monospace">
        {g.lane_mix.join(" + ")}
      </text>

      {/* DNA Bands */}
      {bands.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={3} fill={b.color} opacity={0.8} />
      ))}

      {/* DNA Helix */}
      {dnaPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.color} opacity={0.7} />
      ))}

      {/* Connector lines for helix */}
      {dnaPoints.slice(0, -1).map((p, i) => (
        <line key={i} x1={p.x} y1={p.y} x2={dnaPoints[i + 1].x} y2={dnaPoints[i + 1].y} stroke={p.color} strokeWidth={0.5} opacity={0.3} />
      ))}

      {/* Mirror helix */}
      {dnaPoints.slice(0, -1).map((p, i) => {
        const mirX = 420 - p.x;
        const nextMirX = 420 - dnaPoints[i + 1].x;
        return (
          <line key={`mir-${i}`} x1={mirX} y1={p.y} x2={nextMirX} y2={dnaPoints[i + 1].y} stroke={p.color} strokeWidth={0.5} opacity={0.3} />
        );
      })}
      {dnaPoints.map((p, i) => (
        <circle key={`mir-${i}`} cx={420 - p.x} cy={p.y} r={p.r} fill={dnaPoints[i % dnaPoints.length].color} opacity={0.5} />
      ))}

      {/* Cross-links */}
      {dnaPoints.filter((_, i) => i % 3 === 0).map((p, i) => (
        <line key={`link-${i}`} x1={p.x} y1={p.y} x2={420 - p.x} y2={p.y} stroke="#1b2533" strokeWidth={0.5} opacity={0.6} />
      ))}

      {/* Divider */}
      <line x1={30} y1={420} x2={390} y2={420} stroke="#1b2533" strokeWidth={1} />

      {/* Score */}
      <text x={210} y={454} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="monospace" letterSpacing={2}>
        QUALITY SCORE
      </text>
      <text x={210} y={496} textAnchor="middle" fill="url(#scoreGrad)" fontSize={48} fontFamily="monospace" fontWeight={800}>
        {Math.round(result.final_score * 100)}
      </text>

      {/* Divider */}
      <line x1={30} y1={522} x2={390} y2={522} stroke="#1b2533" strokeWidth={1} />

      {/* Metrics bars */}
      <text x={210} y={548} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="monospace" letterSpacing={2}>
        PRESSURE BALANCE
      </text>

      {metricEntries.map(([key, value], i) => {
        const barX = 40 + i * 70;
        const barW = 60;
        const barH = 24;
        const fillH = value * barH;
        return (
          <g key={key}>
            <rect x={barX} y={566} width={barW} height={barH} rx={4} fill="#0B111C" />
            <rect x={barX} y={566 + (barH - fillH)} width={barW} height={fillH} rx={4} fill={METRIC_COLORS[key] ?? "#8bd7ff"} opacity={0.8} />
            <text x={barX + barW / 2} y={604} textAnchor="middle" fill="#64748b" fontSize={6} fontFamily="monospace">
              {key}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DNAFingerprintCard({ result, language }: DNAFingerprintCardProps) {
  const u = UI[language] ?? UI.en;
  const svgRef = useRef<HTMLDivElement>(null);

  const downloadCard = () => {
    const svgEl = svgRef.current?.querySelector("svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-dna-${result.genome_profile.genome_id}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel-elevated p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-[#8bd7ff]" />
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{u.title}</p>
        </div>
        <button
          onClick={downloadCard}
          className="foundry-button-secondary inline-flex items-center gap-2 px-3 py-2 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          {u.download}
        </button>
      </div>

      <div ref={svgRef} className="flex justify-center">
        <CardSvg result={result} />
      </div>
    </div>
  );
}
