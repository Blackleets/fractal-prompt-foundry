import type { FoundryResult } from "@/lib/types";

export interface ConstellationNode {
  id: string;
  round: number;
  runIndex: number;
  prompt: string;
  score: number;
  parentId: string | null;
  lane: string;
}

let allRuns: FoundryResult[] = [];
let listeners: Array<() => void> = [];

export function addRun(result: FoundryResult) {
  allRuns = [...allRuns, result];
  listeners.forEach((fn) => fn());
}

export function getRuns() {
  return allRuns;
}

export function getConstellationNodes(): ConstellationNode[] {
  const nodes: ConstellationNode[] = [];
  allRuns.forEach((run, runIndex) => {
    run.rounds.forEach((round) => {
      round.candidates.forEach((c, ci) => {
        nodes.push({
          id: `${runIndex}-${round.round}-${ci}`,
          round: round.round,
          runIndex,
          prompt: c.prompt,
          score: c.score,
          parentId: ci > 0 ? `${runIndex}-${round.round}-${ci - 1}` : null,
          lane: c.style,
        });
      });
    });
  });
  return nodes;
}

export function clearHistory() {
  allRuns = [];
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((f) => f !== fn);
  };
}
