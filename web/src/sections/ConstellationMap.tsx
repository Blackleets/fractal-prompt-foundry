import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Maximize2, Minimize2, Crosshair } from "lucide-react";
import { getConstellationNodes, subscribe, type ConstellationNode } from "@/lib/run-history";
import type { FoundryResult } from "@/lib/types";

interface ConstellationMapProps {
  latestResult: FoundryResult | null;
  language: "en" | "es" | "fr" | "de";
}

const UI = {
  en: { title: "Constellation Map", empty: "Run evolution to populate the constellation", candidates: "candidates", showing: "Showing", run: "Run" },
  es: { title: "Mapa Estelar", empty: "Ejecuta evolución para poblar la constelación", candidates: "candidatos", showing: "Mostrando", run: "Ejec" },
  fr: { title: "Carte Stellaire", empty: "Lancez l'évolution pour peupler la constellation", candidates: "candidats", showing: "Affichage", run: "Sess" },
  de: { title: "Sternenkarte", empty: "Führen Sie eine Evolution aus, um die Konstellation zu füllen", candidates: "Kandidaten", showing: "Zeige", run: "Lauf" },
};

const LANE_COLORS: Record<string, string> = {
  dark: "#ef4444",
  light: "#fbbf24",
  poetic: "#8b5cf6",
  technical: "#06b6d4",
  surreal: "#10b981",
  neutral: "#64748b",
};

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  data: ConstellationNode;
}

interface BackgroundStar {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
}

function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function createBackgroundStars(width: number, height: number): BackgroundStar[] {
  return Array.from({ length: 30 }, (_, index) => ({
    cx: seededUnit(index + 1) * width,
    cy: seededUnit(index + 101) * height,
    r: 0.5 + seededUnit(index + 201),
    opacity: 0.3 + seededUnit(index + 301) * 0.4,
  }));
}

function simulateLayout(
  nodes: ConstellationNode[],
  width: number,
  height: number,
): SimNode[] {
  const sim: SimNode[] = nodes.map((n) => ({
    id: n.id,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0,
    vy: 0,
    data: n,
  }));

  sim.forEach((a) => {
    sim.forEach((b) => {
      if (a.id >= b.id) return;
      if (b.data.parentId === a.id || a.data.parentId === b.id) {
        a.x = b.x + (Math.random() - 0.5) * 60;
        a.y = b.y + (Math.random() - 0.5) * 60;
      }
    });
  });

  // 60 iterations of simple force simulation
  for (let iter = 0; iter < 60; iter++) {
    const centerX = width / 2;
    const centerY = height / 2;

    for (const s of sim) {
      // Center gravity
      s.vx += (centerX - s.x) * 0.002;
      s.vy += (centerY - s.y) * 0.002;

      // Repulsion between all
      for (const other of sim) {
        if (s.id === other.id) continue;
        const dx = s.x - other.x;
        const dy = s.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 200 / (dist * dist);
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
      }

      // Attraction along parent links
      if (s.data.parentId) {
        const parent = sim.find((x) => x.id === s.data.parentId);
        if (parent) {
          const dx = parent.x - s.x;
          const dy = parent.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          s.vx += (dx / dist) * 0.05;
          s.vy += (dy / dist) * 0.05;
        }
      }
    }

    for (const s of sim) {
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.8;
      s.vy *= 0.8;
      // Clamp
      s.x = Math.max(20, Math.min(width - 20, s.x));
      s.y = Math.max(20, Math.min(height - 20, s.y));
    }
  }

  return sim;
}

export default function ConstellationMap({ latestResult, language }: ConstellationMapProps) {
  const u = UI[language] ?? UI.en;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 700, h: 400 });
  const [fullscreen, setFullscreen] = useState(false);
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [allNodes, setAllNodes] = useState<ConstellationNode[]>([]);
  const backgroundStars = useMemo(
    () => createBackgroundStars(dimensions.w, dimensions.h),
    [dimensions.w, dimensions.h],
  );

  const rebuild = useCallback(() => {
    const nodes = getConstellationNodes();
    setAllNodes(nodes);
    if (nodes.length === 0) return;
    const container = containerRef.current;
    const w = container?.clientWidth ?? 700;
    const h = fullscreen ? (container?.clientHeight ?? 500) : 400;
    setDimensions({ w, h });
    const sim = simulateLayout(nodes, w - 40, h - 40);
    setSimNodes(sim);
  }, [fullscreen]);

  useEffect(() => {
    const id = window.setTimeout(rebuild, 0);
    const unsub = subscribe(rebuild);
    return () => {
      window.clearTimeout(id);
      unsub();
    };
  }, [rebuild]);

  useEffect(() => {
    if (!latestResult) return;
    const id = window.setTimeout(rebuild, 0);
    return () => window.clearTimeout(id);
  }, [latestResult, rebuild]);

  useEffect(() => {
    const handleResize = () => rebuild();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rebuild]);

  const maxScore = Math.max(...allNodes.map((n) => n.score), 1);

  if (allNodes.length === 0) {
    return (
      <div className="panel-elevated p-5">
        <div className="mb-4 flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-[#06b6d4]" />
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{u.title}</p>
        </div>
        <div className="flex flex-col items-center gap-2 py-12 text-[#64748b]">
          <Crosshair className="h-8 w-8" />
          <p className="text-xs">{u.empty}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`panel-elevated p-5 ${fullscreen ? "fixed inset-4 z-50 overflow-auto" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-[#06b6d4]" />
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{u.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[10px] text-[#64748b]">{u.showing} {allNodes.length} {u.candidates}</p>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="rounded-lg border border-[#2d3436] bg-[#17191c] p-1.5 text-[#94a3b8] hover:border-[#06b6d4]"
          >
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-[#2d3436] bg-[#0d0f10]"
        style={{ height: fullscreen ? "calc(100% - 40px)" : 400 }}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${dimensions.w} ${dimensions.h}`} className="absolute inset-0">
          {/* Stars background */}
          {backgroundStars.map((star, i) => (
            <circle
              key={`bg-${i}`}
              cx={star.cx}
              cy={star.cy}
              r={star.r}
              fill="#2d3436"
              opacity={star.opacity}
            />
          ))}

          {/* Edges */}
          {simNodes.map((node) =>
            node.data.parentId ? (
              (() => {
                const parent = simNodes.find((n) => n.id === node.data.parentId);
                if (!parent) return null;
                return (
                  <line
                    key={`edge-${node.id}`}
                    x1={parent.x + 20}
                    y1={parent.y + 20}
                    x2={node.x + 20}
                    y2={node.y + 20}
                    stroke="#2d3436"
                    strokeWidth={0.8}
                    opacity={0.5}
                  />
                );
              })()
            ) : null,
          )}

          {/* Nodes */}
          {simNodes.map((node) => {
            const radius = Math.max(6, (node.data.score / maxScore) * 18);
            const color = LANE_COLORS[node.data.lane] ?? "#64748b";
            const isHovered = hoveredNode?.id === node.id;
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Glow */}
                <circle
                  cx={node.x + 20}
                  cy={node.y + 20}
                  r={radius * (isHovered ? 2 : 1.5)}
                  fill={color}
                  opacity={isHovered ? 0.15 : 0.06}
                />
                <circle
                  cx={node.x + 20}
                  cy={node.y + 20}
                  r={radius}
                  fill={color}
                  opacity={isHovered ? 1 : 0.7}
                  stroke={isHovered ? "#fff" : "transparent"}
                  strokeWidth={isHovered ? 1.5 : 0}
                />
                {/* Round label */}
                <text
                  x={node.x + 20}
                  y={node.y + 23}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={8}
                  fontFamily="monospace"
                  fontWeight={700}
                  pointerEvents="none"
                >
                  {node.data.runIndex + 1}.{node.data.round + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredNode && (
          <div
            className="pointer-events-none absolute z-10 max-w-[260px] rounded-xl border border-[#2d3436] bg-[#0d0f10] p-3 shadow-2xl"
            style={{
              left: Math.min(hoveredNode.x + 30, dimensions.w - 280),
              top: Math.max(10, hoveredNode.y - 10),
            }}
          >
            <div className="mb-1 flex items-center justify-between gap-4">
              <p className="text-[10px] text-[#64748b]">{u.run} {hoveredNode.data.runIndex + 1} · Round {hoveredNode.data.round + 1}</p>
              <span
                className="rounded-md px-1.5 py-0.5 text-[9px]"
                style={{
                  backgroundColor: (LANE_COLORS[hoveredNode.data.lane] ?? "#64748b") + "20",
                  color: LANE_COLORS[hoveredNode.data.lane] ?? "#64748b",
                }}
              >
                {hoveredNode.data.lane}
              </span>
            </div>
            <p className="mb-1 text-[9px] text-[#64748b]">Score: {Math.round(hoveredNode.data.score * 100)}</p>
            <p className="line-clamp-4 text-[10px] leading-relaxed text-[#94a3b8]">{hoveredNode.data.prompt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
