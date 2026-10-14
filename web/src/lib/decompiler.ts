import type { BaseModelProvider } from "@/lib/models";

export interface DecompiledMission {
  summary: string;
  goal: string;
  style_lanes: string[];
  constraints: string[];
  evaluation_criteria: string[];
  output_format: string;
}

const LANE_KEYWORDS: Record<string, RegExp[]> = {
  dark: [/dark\b/i, /gothic/i, /evil/i, /shadow\b/i, /horror/i],
  light: [/light\b/i, /bright/i, /hero/i, /gentle/i, /pure/i],
  poetic: [/poetic/i, /lyrical/i, /metaphor/i, /verse/i, /rhyme/i],
  technical: [/technical/i, /specification/i, /strict\b/i, /protocol/i, /schema/i],
  surreal: [/surreal/i, /dream/i, /absurd/i, /paradox/i, /weird/i],
};

function heuristicDecompile(text: string): DecompiledMission {
  const lines = text.split("\n").filter((l) => l.trim());
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);

  const goal = sentences[0] ?? text.slice(0, 120);
  const summary = text.slice(0, 200).replace(/\n+/g, " ");

  // Detect constraints (lines with "must", "should", "avoid", "no ", "not", "don't", "without")
  const constraints = lines.filter((l) =>
    /\b(must|should|avoid|no\s|not\s|don't|without|never|always|only|except)\b/i.test(l),
  );

  // Detection criteria (lines with "score", "metric", "rate", "evaluate", "check", "ensure")
  const evaluation_criteria = lines.filter((l) =>
    /\b(score|metric|rate|evaluate|check|ensure|assess|measure|validate)\b/i.test(l),
  );

  // Output format
  const outputFormatLine = lines.find(
    (l) => /\b(output|return|respond with|format|structure|template)\b/i.test(l),
  );
  const output_format = outputFormatLine ?? "default";

  // Detect style lanes
  const style_lanes: string[] = [];
  for (const [lane, patterns] of Object.entries(LANE_KEYWORDS)) {
    if (patterns.some((p) => p.test(text))) {
      style_lanes.push(lane);
    }
  }
  if (style_lanes.length === 0) style_lanes.push("neutral");

  return {
    summary,
    goal,
    style_lanes,
    constraints: constraints.length > 0 ? constraints : [],
    evaluation_criteria: evaluation_criteria.length > 0 ? evaluation_criteria : [],
    output_format,
  };
}

async function llmDecompile(text: string, provider: BaseModelProvider): Promise<DecompiledMission> {
  const system = "You are a prompt decompiler. Extract the mission structure from any prompt. Return only valid JSON, no explanation.";
  try {
    const resp = await provider.chat(
      [
        {
          role: "user",
          content: `Decompile the following prompt into a structured mission. Return ONLY valid JSON with these exact keys: "summary" (one sentence), "goal" (main objective), "style_lanes" (array of 1-3 style tags like dark/light/poetic/technical/surreal), "constraints" (array of rules), "evaluation_criteria" (array of evaluation dimensions), "output_format" (expected response format).

PROMPT:
${text}

JSON:`,
        },
      ],
      system,
    );
    const cleaned = resp.content.replace(/```(?:json)?\s*/gi, "").trim();
    const parsed = JSON.parse(cleaned) as Partial<DecompiledMission>;
    return {
      summary: parsed.summary ?? text.slice(0, 200),
      goal: parsed.goal ?? text.slice(0, 120),
      style_lanes: parsed.style_lanes ?? ["neutral"],
      constraints: parsed.constraints ?? [],
      evaluation_criteria: parsed.evaluation_criteria ?? [],
      output_format: parsed.output_format ?? "default",
    };
  } catch {
    return heuristicDecompile(text);
  }
}

export async function decompilePrompt(
  text: string,
  provider?: BaseModelProvider | null,
): Promise<DecompiledMission> {
  if (!text.trim()) {
    return {
      summary: "",
      goal: "",
      style_lanes: ["neutral"],
      constraints: [],
      evaluation_criteria: [],
      output_format: "default",
    };
  }

  if (provider) {
    return llmDecompile(text, provider);
  }
  return heuristicDecompile(text);
}
