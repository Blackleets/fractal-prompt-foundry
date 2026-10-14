import { describe, it, expect } from "vitest";
import { FractalPromptFoundry, createDefaultMission, nextLoopRequirements } from "../lib/foundry-lite";

function makeMission(overrides: Record<string, string> = {}) {
  const base = createDefaultMission("en", "founder");
  return {
    ...base,
    preferred_language: "en" as const,
    preset: "founder" as const,
    goal: typeof overrides.goal === "string" ? overrides.goal : base.goal,
  };
}

describe("FractalPromptFoundry", () => {
  it("creates a mission with default parameters", () => {
    const mission = createDefaultMission("en", "founder");
    expect(mission.name).toBeTruthy();
    expect(mission.goal).toBeTruthy();
    expect(mission.constraints.length).toBeGreaterThan(0);
    expect(mission.success_criteria.length).toBeGreaterThan(0);
    expect(mission.deliverables.length).toBeGreaterThan(0);
  });

  it("seeds the correct number of candidates", () => {
    const foundry = new FractalPromptFoundry(makeMission(), 5);
    const seeds = foundry.seed_population();
    expect(seeds.length).toBe(5);
    expect(seeds[0].candidate_id).toBe("seed-1");
    expect(seeds[0].prompt).toContain("ROLE LANE");
  });

  it("uses the previous champion as the first seed in a chained loop", () => {
    const parentPrompt = "PREVIOUS CHAMPION PROMPT\n- Preserve this structure.";
    const foundry = new FractalPromptFoundry(
      makeMission(),
      5,
      ["tighten validation"],
      "original idea",
      undefined,
      null,
      parentPrompt
    );
    const seeds = foundry.seed_population();
    expect(seeds.length).toBe(5);
    expect(seeds[0].candidate_id).toBe("loop-parent");
    expect(seeds[0].prompt).toBe(parentPrompt);
    expect(seeds[0].notes).toContain("previous champion");
  });

  it("evaluates a candidate with heuristic scoring", async () => {
    const foundry = new FractalPromptFoundry(makeMission());
    const candidate = foundry.seed_population()[0];
    const evaluation = await foundry.evaluate_candidate(candidate, 0);
    expect(evaluation.total_score).toBeGreaterThanOrEqual(0);
    expect(evaluation.total_score).toBeLessThanOrEqual(1);
    expect(evaluation.metrics.coverage).toBeGreaterThanOrEqual(0);
    expect(evaluation.metrics.structure).toBeGreaterThanOrEqual(0);
    expect(evaluation.metrics.actionability).toBeGreaterThanOrEqual(0);
    expect(evaluation.metrics.novelty).toBeGreaterThanOrEqual(0);
    expect(evaluation.metrics.anti_vague).toBeGreaterThanOrEqual(0);
  });

  it("completes a full run and returns results", async () => {
    const foundry = new FractalPromptFoundry(makeMission(), 3);
    const result = await foundry.run(2);
    expect(result.mission).toBeTruthy();
    expect(result.best_candidate).toBeTruthy();
    expect(result.best_candidate.prompt).toBeTruthy();
    expect(result.best_evaluation.total_score).toBeGreaterThan(0);
    expect(result.rounds.length).toBe(2);
    expect(result.leaderboard.length).toBeGreaterThan(0);
    expect(result.genome_profile).toBeTruthy();
    expect(result.genome_profile.genome_id).toBeTruthy();
    expect(result.report_markdown).toBeTruthy();
  });

  it("improves score across rounds", async () => {
    const foundry = new FractalPromptFoundry(makeMission({ goal: "Test goal with specific output requirements." }), 4);
    const result = await foundry.run(3);
    const scores = result.round_summaries.map((r) => r.winner_score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1] * 0.7);
    }
  });

  it("builds a leaderboard with top candidates", async () => {
    const foundry = new FractalPromptFoundry(makeMission(), 4);
    await foundry.run(2);
    const leaderboard = foundry.build_leaderboard();
    expect(leaderboard.length).toBeGreaterThan(0);
    expect(leaderboard.length).toBeLessThanOrEqual(8);
    for (let i = 1; i < leaderboard.length; i++) {
      expect(leaderboard[i].score).toBeLessThanOrEqual(leaderboard[i - 1].score);
    }
  });

  it("renders mermaid lineage graph", async () => {
    const foundry = new FractalPromptFoundry(makeMission(), 3);
    const result = await foundry.run(2);
    expect(result.lineage_mermaid).toContain("flowchart LR");
    expect(result.lineage_mermaid).toContain("mission");
  });

  it("handles single-round run", async () => {
    const foundry = new FractalPromptFoundry(makeMission(), 3);
    const result = await foundry.run(1);
    expect(result.rounds.length).toBe(1);
    expect(result.improvement).toBeGreaterThanOrEqual(0);
  });

  it("uses custom evolution config weights", async () => {
    const foundry = new FractalPromptFoundry(makeMission(), 3, [], "", {
      rounds: 2,
      populationSize: 3,
      mutationRate: 0.5,
      eliteCount: 1,
      weights: { coverage: 0.5, structure: 0.2, actionability: 0.2, novelty: 0.05, anti_vague: 0.05 },
    });
    const result = await foundry.run(2);
    expect(result.rounds.length).toBe(2);
  });
});

describe("nextLoopRequirements", () => {
  it("adds missing terms when present", () => {
    const result = nextLoopRequirements([], ["term1", "term2"], "en");
    expect(result).toContain("term1");
    expect(result).toContain("term2");
  });

  it("escalates when no missing terms", () => {
    const result = nextLoopRequirements([], [], "en");
    expect(result.length).toBe(1);
    expect(result[0]).toBeTruthy();
  });

  it("accumulates requirements across calls", () => {
    const first = nextLoopRequirements([], ["risk"], "en");
    const second = nextLoopRequirements(first, [], "en");
    expect(second.length).toBeGreaterThan(first.length);
  });
});
