import type { FoundryResult } from "@/lib/types";

export interface EvoNode {
  id: string;
  runIndex: number;
  round: number;
  candidateId: string;
  prompt: string;
  score: number;
  style: string;
  changeType: string;
  parentIds: string[];
  x: number;
  y: number;
  children: EvoNode[];
}

export interface EvoTree {
  nodes: EvoNode[];
  roots: EvoNode[];
}

function candidateIdToKey(runIndex: number, round: number, ci: number): string {
  return `r${runIndex}-${round}-${ci}`;
}

function buildParentIds(
  runIndex: number,
  round: number,
  prevRoundCandidates: number,
  candidateId: string,
): string[] {
  if (round === 0) return [];

  const parents: string[] = [];

  if (candidateId.includes("elite")) {
    const eliteIndex = parseInt(candidateId.split("-").pop() ?? "1", 10) - 1;
    parents.push(candidateIdToKey(runIndex, round - 1, Math.min(eliteIndex, prevRoundCandidates - 1)));
  } else if (candidateId.includes("hyb")) {
    const prev = prevRoundCandidates;
    const pairings = [
      [0, 1],
      [0, Math.min(2, prev - 1)],
      [1, Math.min(2, prev - 1)],
    ];
    const hybIndex = Math.min(parseInt(candidateId.split("-").pop() ?? "1", 10) - 1, pairings.length - 1);
    const [a, b] = pairings[hybIndex] ?? [0, 0];
    parents.push(candidateIdToKey(runIndex, round - 1, a));
    parents.push(candidateIdToKey(runIndex, round - 1, b));
  } else if (candidateId.includes("mut")) {
    const mutIndex = parseInt(candidateId.split("-").pop() ?? "1", 10) - 1;
    const sourceIdx = mutIndex % Math.max(1, prevRoundCandidates);
    parents.push(candidateIdToKey(runIndex, round - 1, sourceIdx));
  }

  return parents;
}

function connectRunToPrevious(runs: FoundryResult[], rootNodes: EvoNode[][]): void {
  for (let i = 1; i < rootNodes.length; i++) {
    const prevNodes = rootNodes[i - 1];
    const currNodes = rootNodes[i];

    const prevChampionId = runs[i - 1].best_candidate.candidate_id;
    const prevChampionNode = prevNodes.find((n) => n.candidateId === prevChampionId);
    if (!prevChampionNode) continue;

    const seedIndex = currNodes.findIndex((n) => n.round === 0);
    if (seedIndex >= 0) {
      const seedNode = currNodes[seedIndex];
      seedNode.parentIds = [prevChampionNode.id];
      prevChampionNode.children.push(seedNode);
    }
  }
}

export function buildTrees(runs: FoundryResult[]): EvoTree {
  const allNodes: EvoNode[] = [];
  const rootNodes: EvoNode[][] = [];

  runs.forEach((run, runIndex) => {
    const runNodes: EvoNode[] = [];
    run.rounds.forEach((round) => {
      round.candidates.forEach((c, ci) => {
        const id = candidateIdToKey(runIndex, round.round - 1, ci);
        const node: EvoNode = {
          id,
          runIndex,
          round: round.round - 1,
          candidateId: c.candidate_id,
          prompt: c.prompt,
          score: c.score,
          style: c.style,
          changeType: c.change_type,
          parentIds: [],
          x: 0,
          y: 0,
          children: [],
        };
        runNodes.push(node);
        allNodes.push(node);
      });
    });

    run.rounds.forEach((round, ri) => {
      if (ri === 0) return;
      const prevCount = run.rounds[ri - 1]?.candidates.length ?? 1;
      round.candidates.forEach((c, ci) => {
        const nodeId = candidateIdToKey(runIndex, ri, ci);
        const node = runNodes.find((n) => n.id === nodeId);
        if (!node) return;
        const parentIds = buildParentIds(runIndex, ri, prevCount, c.candidate_id);
        node.parentIds = parentIds;
        parentIds.forEach((pid) => {
          const parent = runNodes.find((n) => n.id === pid);
          if (parent) parent.children.push(node);
        });
      });
    });

    const runRoots = runNodes.filter((n) => n.round === 0);
    rootNodes.push(runRoots);
  });

  connectRunToPrevious(runs, rootNodes);

  const roots = rootNodes.flatMap((rn) => rn);

  return { nodes: allNodes, roots };
}

function subtreeLeafCount(node: EvoNode): number {
  if (node.children.length === 0) return 1;
  let count = 0;
  for (const child of node.children) count += subtreeLeafCount(child);
  return count;
}

export function layoutTree(roots: EvoNode[], gapX = 180, gapY = 120): void {
  const leafCounts = new Map<EvoNode, number>();
  function leafCount(node: EvoNode): number {
    let c = leafCounts.get(node);
    if (c !== undefined) return c;
    c = subtreeLeafCount(node);
    leafCounts.set(node, c);
    return c;
  }

  let globalY = 0;
  const yByDepth = new Map<number, number>();

  function assignDepth(node: EvoNode, depth: number): void {
    node.y = depth * gapY + 60;
    globalY = Math.max(globalY, node.y);
    if (!yByDepth.has(depth) || node.y > yByDepth.get(depth)!) {
      yByDepth.set(depth, node.y);
    }
    for (const child of node.children) assignDepth(child, depth + 1);
  }
  for (const root of roots) assignDepth(root, 0);

  function centerParent(node: EvoNode): void {
    if (node.children.length === 0) return;
    for (const child of node.children) centerParent(child);
    const minX = Math.min(...node.children.map((c) => c.x));
    const maxX = Math.max(...node.children.map((c) => c.x));
    node.x = (minX + maxX) / 2;
  }

  function positionSubtrees(nodes: EvoNode[], startX: number): number {
    if (nodes.length === 0) return startX;
    if (nodes.length === 1) {
      nodes[0].x = startX;
      if (nodes[0].children.length > 0) {
        positionSubtrees(nodes[0].children, startX);
        centerParent(nodes[0]);
      }
      return startX + (leafCount(nodes[0]) - 1) * gapX + gapX;
    }

    let cursor = startX;
    for (const node of nodes) {
      const halfWidth = (leafCount(node) - 1) * gapX / 2;
      const nodeCenter = cursor + halfWidth;
      node.x = nodeCenter;
      if (node.children.length > 0) {
        positionSubtrees(node.children, cursor);
        centerParent(node);
      }
      cursor += leafCount(node) * gapX;
    }
    return cursor;
  }

  for (const root of roots) {
    positionSubtrees([root], 0);
    centerParent(root);
  }

  const minX = Math.min(...[...leafCounts.keys()].map((n) => n.x));
  const shiftX = -minX + 60;
  for (const node of leafCounts.keys()) node.x += shiftX;
}

export function flattenTree(roots: EvoNode[]): EvoNode[] {
  const result: EvoNode[] = [];
  function walk(node: EvoNode): void {
    result.push(node);
    node.children.forEach(walk);
  }
  roots.forEach(walk);
  return result;
}

export function treeBounds(roots: EvoNode[]): { minX: number; minY: number; maxX: number; maxY: number } {
  const all = flattenTree(roots);
  if (all.length === 0) return { minX: 0, minY: 0, maxX: 600, maxY: 400 };
  return {
    minX: Math.min(...all.map((n) => n.x)) - 60,
    minY: Math.min(...all.map((n) => n.y)) - 60,
    maxX: Math.max(...all.map((n) => n.x)) + 60,
    maxY: Math.max(...all.map((n) => n.y)) + 60,
  };
}
