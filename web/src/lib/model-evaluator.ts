import type { BaseModelProvider } from "./models";
import type { Candidate, Evaluation, Mission } from "./types";

export interface LLMEvaluationResult {
  total_score: number;
  metrics: {
    coverage: number;
    structure: number;
    actionability: number;
    novelty: number;
    anti_vague: number;
  };
  missing_terms: string[];
  critique: string[];
  result_summary: string;
}

export async function evaluateWithLLM(
  provider: BaseModelProvider,
  candidate: Candidate,
  mission: Mission,
  previousPrompts: string[]
): Promise<Evaluation> {
  const systemPrompt = `You are an expert prompt evaluator. Score the following prompt on 5 axes from 0.0 to 1.0:

1. **coverage**: Does it cover all mission constraints, success criteria, and domain terms?
2. **structure**: Is it well-organized with clear sections and formatting?
3. **actionability**: Does it include validation steps, next actions, risk handling?
4. **novelty**: Is it distinct from previous prompts (avoid repetition)?
5. **anti_vague**: Does it avoid vague language (maybe, could, might)?

Respond in JSON format exactly like this:
{
  "coverage": 0.85,
  "structure": 0.72,
  "actionability": 0.68,
  "novelty": 0.60,
  "anti_vague": 0.80,
  "missing_terms": ["term1", "term2"],
  "critique": ["Short critique point 1", "Short critique point 2"],
  "result_summary": "One-line summary of this prompt's strengths/weaknesses."
}`;

  const userMessage = `MISSION: ${mission.name}
GOAL: ${mission.goal}
CONSTRAINTS: ${mission.constraints.join(", ")}
SUCCESS CRITERIA: ${mission.success_criteria.join(", ")}
DOMAIN TERMS: ${mission.domain_terms.join(", ")}

PREVIOUS PROMPTS (for novelty comparison):
${previousPrompts.slice(-3).map((p, i) => `--- Previous ${i + 1}:\n${p.slice(0, 300)}`).join("\n\n")}

PROMPT TO EVALUATE (style: ${candidate.style}):
${candidate.prompt.slice(0, 2000)}

Please score this prompt 0.0-1.0 on all 5 axes.`;

  try {
    const result = await provider.chatJson<LLMEvaluationResult>(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    const total =
      result.metrics.coverage * 0.34 +
      result.metrics.structure * 0.22 +
      result.metrics.actionability * 0.22 +
      result.metrics.novelty * 0.12 +
      result.metrics.anti_vague * 0.1;

    return {
      candidate_id: candidate.candidate_id,
      total_score: Math.round(total * 1000) / 1000,
      metrics: {
        coverage: clamp(result.metrics.coverage),
        structure: clamp(result.metrics.structure),
        actionability: clamp(result.metrics.actionability),
        novelty: clamp(result.metrics.novelty),
        anti_vague: clamp(result.metrics.anti_vague),
      },
      missing_terms: (result.missing_terms ?? []).slice(0, 10),
      critique: (result.critique ?? []).slice(0, 5),
      result_summary: result.result_summary ?? "",
    };
  } catch (error) {
    return {
      candidate_id: candidate.candidate_id,
      total_score: 0.5,
      metrics: { coverage: 0.5, structure: 0.5, actionability: 0.5, novelty: 0.5, anti_vague: 0.5 },
      missing_terms: [],
      critique: [`LLM evaluation failed: ${error instanceof Error ? error.message : "unknown error"}`],
      result_summary: "Fallback: heuristic evaluation unavailable.",
    };
  }
}

export async function generateCandidateWithLLM(
  provider: BaseModelProvider,
  mission: Mission,
  style: string,
  styleInstruction: string,
  pressure: string[],
  parentPrompts: string[]
): Promise<string> {
  const systemPrompt = `You are an expert prompt engineer. Generate a system prompt for an AI assistant based on the mission below. The prompt should be clear, structured, and actionable.

Use the following structure in your generated prompt:
- ROLE: Define the AI's role
- PRIMARY GOAL: The main objective
- CONSTRAINTS: Must-follow rules
- OPERATING RULES: How to think and respond
- OUTPUT FORMAT: How to structure the response

Generate ONLY the prompt text, no explanation.`;

  const userMessage = `MISSION: ${mission.name}
GOAL: ${mission.goal}
STYLE: ${style} — ${styleInstruction}
${mission.constraints.length ? `CONSTRAINTS:\n${mission.constraints.map((c) => `- ${c}`).join("\n")}` : ""}
${pressure.length ? `REFINEMENT PRESSURE:\n${pressure.map((p) => `- ${p}`).join("\n")}` : ""}
${parentPrompts.length ? `PARENT PROMPTS TO IMPROVE WITHOUT COPYING:\n${parentPrompts.slice(-3).map((p, i) => `--- Parent ${i + 1}:\n${p.slice(0, 500)}`).join("\n\n")}` : ""}

Generate an optimized system prompt for this mission.`;

  try {
    const result = await provider.chat(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );
    return result.content;
  } catch {
    return "";
  }
}

function clamp(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value ?? 0)) * 1000) / 1000;
}
