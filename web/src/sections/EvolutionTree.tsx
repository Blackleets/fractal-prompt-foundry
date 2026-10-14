import { useEffect, useMemo, useState, useCallback, useRef, type WheelEvent, type MouseEvent } from "react";
import type { ReactNode } from "react";
import { GitBranch, RotateCcw, ArrowLeftRight, X, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { getRuns, subscribe } from "@/lib/run-history";
import { buildTrees, layoutTree, flattenTree, treeBounds, type EvoNode } from "@/lib/evolution-tree";
import type { FoundryResult } from "@/lib/types";

interface EvolutionTreeProps {
  latestResult: FoundryResult | null;
  onFork: (prompt: string) => void;
  onRollback: (prompt: string) => void;
  language: "en" | "es" | "fr" | "de";
}

const UI = {
  en: { title: "Evolution Tree", empty: "Run evolution to grow the tree", fork: "Fork from here", rollback: "Rollback to this", compare: "Compare", score: "Score", champion: "Champion", branch: "branch", node: "node", zoomIn: "Zoom in", zoomOut: "Zoom out", reset: "Reset" },
  es: { title: "Arbol Evolutivo", empty: "Ejecuta evolucion para cultivar el arbol", fork: "Bifurcar desde aqui", rollback: "Revertir a este", compare: "Comparar", score: "Puntaje", champion: "Campeon", branch: "rama", node: "nodo", zoomIn: "Acercar", zoomOut: "Alejar", reset: "Reiniciar" },
  fr: { title: "Arbre Evolutif", empty: "Lancez l evolution pour faire pousser l arbre", fork: "Bifurquer d ici", rollback: "Revenir a ceci", compare: "Comparer", score: "Score", champion: "Champion", branch: "branche", node: "nœud", zoomIn: "Zoom avant", zoomOut: "Zoom arriere", reset: "Reinitialiser" },
  de: { title: "Entwicklungsbaum", empty: "Fuhre Evolution aus, um den Baum wachsen zu lassen", fork: "Hier abzweigen", rollback: "Hierher zurucksetzen", compare: "Vergleichen", score: "Punktzahl", champion: "Champion", branch: "Zweig", node: "Knoten", zoomIn: "Vergroßern", zoomOut: "Verkleinern", reset: "Zurucksetzen" },
};

const CHANGE_COLORS: Record<string, string> = {
  seed: "#64748b",
  elite: "#00D2FF",
  hybrid: "#6C5CE7",
  mutation: "#F59E0B",
};

export default function EvolutionTree({ latestResult, onFork, onRollback, language }: EvolutionTreeProps) {
  const u = UI[language] ?? UI.en;
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<EvoNode | null>(null);
  const [compareNode, setCompareNode] = useState<EvoNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<EvoNode | null>(null);
  const [runs, setRuns] = useState<FoundryResult[]>([]);

  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const [viewScale, setViewScale] = useState(1);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const viewStart = useRef({ x: 0, y: 0 });

  const rebuild = useCallback(() => setRuns([...getRuns()]), []);

  useEffect(() => {
    const unsub = subscribe(rebuild);
    return unsub;
  }, [rebuild]);

  useEffect(() => {
    if (latestResult) rebuild();
  }, [latestResult, rebuild]);

  const { tree, flatNodes, bounds } = useMemo(() => {
    if (runs.length === 0) return { tree: null, flatNodes: [] as EvoNode[], bounds: { minX: 0, minY: 0, maxX: 600, maxY: 400 } };
    const t = buildTrees(runs);
    layoutTree(t.roots, 170, 130);
    const flat = flattenTree(t.roots);
    const b = treeBounds(t.roots);
    return { tree: t, flatNodes: flat, bounds: b };
  }, [runs]);

  const svgWidth = bounds.maxX - bounds.minX;
  const svgHeight = bounds.maxY - bounds.minY;
  const maxScore = useMemo(() => Math.max(...flatNodes.map((n) => n.score), 1), [flatNodes]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.88 : 1.12;
    setViewScale((s) => Math.max(0.2, Math.min(4, s * delta)));
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    viewStart.current = { x: viewX, y: viewY };
  }, [viewX, viewY]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    setViewX(viewStart.current.x + (e.clientX - dragStart.current.x) / viewScale);
    setViewY(viewStart.current.y + (e.clientY - dragStart.current.y) / viewScale);
  }, [viewScale]);

  const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const resetView = useCallback(() => {
    setViewX(0); setViewY(0); setViewScale(1);
  }, []);

  if (!tree || flatNodes.length === 0) {
    return (
      <div className="panel-elevated p-5">
        <div className="mb-4 flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-[#6C5CE7]" />
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{u.title}</p>
        </div>
        <div className="flex flex-col items-center gap-2 py-12 text-[#64748b]">
          <GitBranch className="h-8 w-8" />
          <p className="text-xs">{u.empty}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`panel-elevated p-5 ${fullscreen ? "fixed inset-4 z-50 overflow-hidden" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-[#6C5CE7]" />
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{u.title}</p>
          <span className="ml-2 rounded-full border border-[#6C5CE7]/30 bg-[#6C5CE7]/10 px-2 py-0.5 text-[10px] text-[#a78bfa]">
            {flatNodes.length} {u.node}s / {runs.length} {u.branch}s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewScale((s) => Math.max(0.2, s / 1.3))} className="zoom-btn" title={u.zoomOut}>
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-[10px] text-[#64748b] font-mono">{Math.round(viewScale * 100)}%</span>
          <button onClick={() => setViewScale((s) => Math.min(4, s * 1.3))} className="zoom-btn" title={u.zoomIn}>
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button onClick={resetView} className="zoom-btn" title={u.reset}>
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setFullscreen(!fullscreen)} className="rounded-lg border border-[#2d3436] bg-[#17191c] p-1.5 text-[#94a3b8] hover:border-[#6C5CE7] transition-colors">
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-[#2d3436] bg-[#0d0f10] select-none"
        style={{ height: fullscreen ? "calc(100% - 40px)" : 480 }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`${bounds.minX} ${bounds.minY} ${svgWidth} ${svgHeight}`}
          className="absolute inset-0"
        >
          <g transform={`translate(${viewX}, ${viewY}) scale(${viewScale})`}>
            {/* Vignette overlay */}
            <defs>
              <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {flatNodes.map((node) => {
                const c = CHANGE_COLORS[node.changeType] ?? "#64748b";
                return (
                  <radialGradient key={`grad-${node.id}`} id={`node-grad-${node.id}`}>
                    <stop offset="0%" stopColor={c} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={c} stopOpacity="0.05" />
                  </radialGradient>
                );
              })}
            </defs>

            <rect x={bounds.minX} y={bounds.minY} width={svgWidth} height={svgHeight} fill="url(#vignette)" pointerEvents="none" />

            {/* Edges - Bezier curves */}
            {tree.roots.map((root) =>
              renderBezierEdges(root, selectedNode, compareNode, hoveredNode, new Set())
            )}

            {/* Nodes */}
            {flatNodes.map((node) => {
              const radius = Math.max(7, (node.score / maxScore) * 20);
              const color = CHANGE_COLORS[node.changeType] ?? "#64748b";
              const isSelected = selectedNode?.id === node.id;
              const isCompared = compareNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const isChampion = runs[node.runIndex]?.best_candidate.candidate_id === node.candidateId;
              const isMultiParent = node.parentIds.length > 1;
              const isDraggingFlag = isDragging.current;

              return (
                <g
                  key={node.id}
                  className="evo-node"
                  onMouseEnter={() => !isDraggingFlag && setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => { e.stopPropagation(); setSelectedNode(isSelected ? null : node); }}
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                >
                  {/* Background glow aura */}
                  <circle
                    cx={node.x} cy={node.y}
                    r={radius * (isSelected ? 3.5 : isHovered ? 3 : 2)}
                    fill={`url(#node-grad-${node.id})`}
                    className="evo-glow"
                  />

                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      cx={node.x} cy={node.y}
                      r={radius + 6}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      opacity={0.6}
                      className="evo-ring"
                    />
                  )}

                  {isCompared && (
                    <circle
                      cx={node.x} cy={node.y}
                      r={radius + 6}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      className="evo-ring"
                    />
                  )}

                  {/* Multi-parent indicator */}
                  {isMultiParent && (
                    <circle
                      cx={node.x} cy={node.y}
                      r={radius + 8}
                      fill="none"
                      stroke={color}
                      strokeWidth={0.5}
                      strokeDasharray="2 3"
                      opacity={0.5}
                    />
                  )}

                  {/* Main circle */}
                  <circle
                    cx={node.x} cy={node.y}
                    r={radius}
                    fill={isChampion ? `${color}30` : `${color}15`}
                    stroke={isSelected ? "#fff" : isCompared ? "#F59E0B" : color}
                    strokeWidth={isSelected ? 2.5 : isCompared ? 2 : isChampion ? 2 : 1.2}
                    className="evo-node-circle"
                  />

                  {/* Inner dot for champion */}
                  {isChampion && (
                    <circle
                      cx={node.x} cy={node.y}
                      r={radius * 0.35}
                      fill={color}
                      opacity={0.8}
                    />
                  )}

                  {/* Round label */}
                  <text
                    x={node.x} y={node.y + 1}
                    textAnchor="middle" dominantBaseline="central"
                    fill={isChampion ? "#fff" : color}
                    fontSize={isChampion ? 10 : 8}
                    fontFamily="'Space Grotesk', monospace"
                    fontWeight={700}
                    pointerEvents="none"
                    className="evo-label"
                  >
                    {isChampion ? "★" : `${node.runIndex}.${node.round}`}
                  </text>

                  {/* Score below */}
                  <text
                    x={node.x} y={node.y + radius + 12}
                    textAnchor="middle"
                    fill={isSelected ? color : "#64748b"}
                    fontSize={7}
                    fontFamily="'Space Grotesk', monospace"
                    fontWeight={500}
                    pointerEvents="none"
                    className="evo-score"
                  >
                    {Math.round(node.score * 100)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Champion legend */}
        <div className="absolute left-3 top-3 rounded-lg border border-[#232040] bg-[#0c0a18]/80 px-2.5 py-1.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[9px] text-[#64748b]">
            {Object.entries(CHANGE_COLORS).map(([key, col]) => (
              <span key={key} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col }} />
                {key}
              </span>
            ))}
            <span className="mx-1 text-[#232040]">|</span>
            <span className="flex items-center gap-1">
              <span className="text-[#fbbf24]">★</span> {u.champion}
            </span>
          </div>
        </div>

        {/* Hover tooltip */}
        {hoveredNode && !selectedNode && (
          <TooltipCard node={hoveredNode} x={hoveredNode.x * viewScale + viewX} y={hoveredNode.y * viewScale + viewY} u={u} />
        )}

        {/* Action panel for selected node */}
        {selectedNode && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-xl border border-[#6C5CE7]/30 bg-[#0c0a18]/95 p-2 shadow-2xl backdrop-blur-xl animate-in">
              <p className="max-w-[160px] truncate px-2 text-[10px] text-[#94a3b8] font-mono">
                {selectedNode.candidateId}
              </p>
              <span
                className="rounded-md px-1.5 py-0.5 text-[8px] font-semibold"
                style={{ backgroundColor: CHANGE_COLORS[selectedNode.changeType] + "20", color: CHANGE_COLORS[selectedNode.changeType] ?? "#64748b" }}
              >
                {Math.round(selectedNode.score * 100)}
              </span>
              <div className="h-4 w-px bg-[#232040]" />
              <button onClick={() => { onFork(selectedNode.prompt); setSelectedNode(null); }} className="action-btn text-[#00D2FF] hover:border-[#00D2FF]">
                <GitBranch className="h-3 w-3" /> {u.fork}
              </button>
              <button onClick={() => { onRollback(selectedNode.prompt); setSelectedNode(null); }} className="action-btn text-[#F59E0B] hover:border-[#F59E0B]">
                <RotateCcw className="h-3 w-3" /> {u.rollback}
              </button>
              <button onClick={() => setCompareNode(selectedNode)} className="action-btn text-[#6C5CE7] hover:border-[#6C5CE7]">
                <ArrowLeftRight className="h-3 w-3" /> {u.compare}
              </button>
              <button onClick={() => setSelectedNode(null)} className="action-btn text-[#ef4444] hover:border-[#ef4444]">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Zoom level badge */}
        {viewScale !== 1 && (
          <div className="absolute bottom-3 right-3 rounded-lg border border-[#232040] bg-[#0c0a18]/80 px-2 py-1 text-[10px] text-[#64748b] font-mono backdrop-blur-sm">
            {Math.round(viewScale * 100)}%
          </div>
        )}
      </div>

      {/* Compare modal */}
      {compareNode && selectedNode && compareNode.id !== selectedNode.id && (
        <CompareModal nodeA={selectedNode} nodeB={compareNode} onClose={() => setCompareNode(null)} u={u} />
      )}
    </div>
  );
}

function renderBezierEdges(
  node: EvoNode,
  selected: EvoNode | null,
  compare: EvoNode | null,
  hovered: EvoNode | null,
  visited: Set<string>,
): ReactNode[] {
  const elements: ReactNode[] = [];
  if (visited.has(node.id)) return elements;
  visited.add(node.id);

  for (const child of node.children) {
    const isActive = (selected && (selected.id === node.id || selected.id === child.id))
      || (hovered && (hovered.id === node.id || hovered.id === child.id));
    const x1 = node.x, y1 = node.y;
    const x2 = child.x, y2 = child.y;
    const cy = (y1 + y2) / 2;
    const d = `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
    const color = isActive ? "#6C5CE7" : "#1b2533";
    const width = isActive ? 1.8 : 0.8;

    elements.push(
      <g key={`edge-${node.id}-${child.id}`}>
        {/* Glow under active edges */}
        {isActive && <path d={d} fill="none" stroke="#6C5CE7" strokeWidth={width + 4} opacity={0.15} />}
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={width}
          opacity={isActive ? 0.9 : 0.4}
          className="evo-edge"
        />
        {/* Arrow dot at child */}
        <circle cx={x2} cy={y2 - 10} r={1.5} fill={color} opacity={isActive ? 0.8 : 0.3} />
      </g>
    );
    elements.push(...renderBezierEdges(child, selected, compare, hovered, visited));
  }
  return elements;
}

function TooltipCard({ node, x, y, u }: { node: EvoNode; x: number; y: number; u: typeof UI.en }) {
  return (
    <div
      className="pointer-events-none absolute z-10 max-w-[280px] rounded-xl border border-[#2d3436] bg-[#0c0a18]/95 p-3 shadow-2xl backdrop-blur-xl"
      style={{ left: Math.max(10, Math.min(x + 20, window.innerWidth - 300)), top: Math.max(10, y - 10) }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="font-mono text-[9px] text-[#64748b]">{node.candidateId}</p>
        <span
          className="rounded-md px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: CHANGE_COLORS[node.changeType] + "20", color: CHANGE_COLORS[node.changeType] ?? "#64748b" }}
        >
          {node.changeType}
        </span>
      </div>
      <div className="mb-1.5 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHANGE_COLORS[node.changeType] }} />
          <span className="text-[9px] text-[#94a3b8]">{u.score}: <span className="font-semibold text-[#e8e6f0]">{Math.round(node.score * 100)}</span></span>
        </div>
        <span className="text-[8px] text-[#6C5CE7] font-medium">{node.style}</span>
        {node.parentIds.length > 1 && (
          <span className="text-[7px] text-[#6C5CE7]/60">+2 parents</span>
        )}
      </div>
      <div className="relative">
        <p className="line-clamp-4 text-[9px] leading-relaxed text-[#cbd5e1]">{node.prompt}</p>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0c0a18] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

function CompareModal({
  nodeA, nodeB, onClose, u,
}: {
  nodeA: EvoNode; nodeB: EvoNode; onClose: () => void; u: typeof UI.en;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-4xl overflow-auto rounded-2xl border border-[#232040] bg-[#0c0a18] p-5 shadow-2xl animate-in" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#9ca3af]">{u.compare}</p>
          <button onClick={onClose} className="rounded-lg border border-[#2d3436] p-1.5 text-[#94a3b8] hover:border-[#ef4444] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[nodeA, nodeB].map((n, i) => (
            <div key={n.id} className="rounded-xl border border-[#2d3436] bg-[#0d0f10] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: i === 0 ? "#6C5CE7" : "#F59E0B" }} />
                  <span className="font-mono text-[10px]" style={{ color: i === 0 ? "#a78bfa" : "#fbbf24" }}>
                    {n.candidateId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] uppercase tracking-wider text-[#64748b]">{n.changeType}</span>
                  <span className="text-[10px] font-mono text-[#94a3b8]">{u.score}: <span className="text-[#e8e6f0] font-semibold">{Math.round(n.score * 100)}</span></span>
                </div>
              </div>
              <div className="relative max-h-[280px] overflow-y-auto rounded-lg border border-[#1b2533] bg-[#050608] p-3">
                <p className="text-[11px] leading-relaxed text-[#cbd5e1] whitespace-pre-wrap font-mono">
                  {n.prompt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
