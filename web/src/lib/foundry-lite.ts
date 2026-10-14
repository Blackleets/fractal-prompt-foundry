import { getFoundryCopy, getMissionTemplate } from "./content";
import { evaluateWithLLM, generateCandidateWithLLM } from "./model-evaluator";
import type { BaseModelProvider } from "./models";
import type {
  Candidate,
  ChangeType,
  Evaluation,
  EvolutionConfig,
  FoundryResult,
  GenomeProfile,
  HistoryEntry,
  LeaderboardEntry,
  Mission,
  RoundCandidate,
  RoundDetail,
  RoundSummary,
} from "./types";
import { DEFAULT_EVOLUTION_CONFIG } from "./types";

export class FractalPromptFoundry {
  config: EvolutionConfig;
  modelProvider: BaseModelProvider | null;

  static STYLE_LANES: Record<string, string> = {
    architect: "Think in systems, modules, contracts, and failure modes.",
    operator: "Think in execution steps, observability, and safe operations.",
    critic: "Think in risks, edge cases, weak assumptions, and adversarial checks.",
    compressor: "Force concise, information-dense instructions with zero fluff.",
    strategist: "Think in prioritization, sequencing, constraints, and tradeoffs.",
  };

  mission: Mission;
  population_size: number;
  history: HistoryEntry[];
  /**
   * Extra refinement requirements injected into every composed prompt.
   * Used when a user chains "run another round" loops: the unmet pressure
   * from the previous champion is fed back in so each loop can push higher.
   */
  base_requirements: string[];
  /** The user's raw, unstructured input. Used to score the honest baseline. */
  raw_input: string;
  /** Champion prompt from the previous loop. Used as the next loop's parent seed. */
  loop_seed_prompt: string;

  constructor(
    mission: Mission,
    population_size = 5,
    base_requirements: string[] = [],
    raw_input = "",
    config?: Partial<EvolutionConfig>,
    modelProvider: BaseModelProvider | null = null,
    loop_seed_prompt = ""
  ) {
    this.mission = mission;
    this.population_size = Math.max(1, population_size);
    this.history = [];
    this.base_requirements = base_requirements;
    this.raw_input = raw_input;
    this.loop_seed_prompt = loop_seed_prompt;
    this.config = { ...DEFAULT_EVOLUTION_CONFIG, ...config, populationSize: population_size };
    this.modelProvider = modelProvider;
  }

  async run(rounds = 4): Promise<FoundryResult> {
    let population = await this.prepare_population(this.seed_population());

    for (let round_index = 0; round_index < rounds; round_index++) {
      const scored: HistoryEntry[] = [];
      for (const candidate of population) {
        const evaluation = await this.evaluate_candidate(candidate, round_index);
        const entry = { candidate, evaluation };
        scored.push(entry);
        this.history.push(entry);
      }

      scored.sort((a, b) => b.evaluation.total_score - a.evaluation.total_score);
      const elite = scored.slice(0, 2).map((item) => item.candidate);
      if (round_index < rounds - 1) {
        population = this.spawn_next_population(elite, scored, round_index + 1);
        population = await this.prepare_population(population);
      }
    }

    const best = this.history.reduce((prev, curr) =>
      curr.evaluation.total_score > prev.evaluation.total_score ? curr : prev
    );
    const leaderboard = this.build_leaderboard();
    const round_summaries = this.round_summaries();
    const rounds_detail = this.build_round_details();
    const lineage_mermaid = this.render_mermaid_lineage(best.candidate);
    const genome_profile = this.candidate_genome(best.candidate, best.evaluation);
    const uniqueness_thesis = this.uniqueness_thesis(best.candidate, best.evaluation);
    const final_score = round3(best.evaluation.total_score);
    const initial_score = this.raw_input.trim()
      ? round3(this.score_raw(this.raw_input))
      : rounds_detail[0]?.winner_score ?? final_score;

    const result: FoundryResult = {
      mission: this.mission.name,
      best_candidate: {
        candidate_id: best.candidate.candidate_id,
        style: best.candidate.style,
        lineage: best.candidate.lineage,
        prompt: best.candidate.prompt,
        notes: best.candidate.notes,
      },
      best_evaluation: {
        total_score: round3(best.evaluation.total_score),
        metrics: {
          coverage: round3(best.evaluation.metrics.coverage),
          structure: round3(best.evaluation.metrics.structure),
          actionability: round3(best.evaluation.metrics.actionability),
          novelty: round3(best.evaluation.metrics.novelty),
          anti_vague: round3(best.evaluation.metrics.anti_vague),
        },
        missing_terms: best.evaluation.missing_terms,
        critique: best.evaluation.critique,
        result_summary: best.evaluation.result_summary,
      },
      leaderboard,
      round_summaries,
      rounds: rounds_detail,
      initial_score,
      final_score,
      improvement: round3(final_score - initial_score),
      genome_profile,
      lineage_mermaid,
      uniqueness_thesis,
      report_markdown: "",
    };

    result.report_markdown = this.render_markdown_report(result);
    return result;
  }

  seed_population(): Candidate[] {
    const seeds = Object.entries(FractalPromptFoundry.STYLE_LANES)
      .slice(0, this.population_size)
      .map(([style, lane_instruction], index) => {
        const detail_level = 0.3 + index * 0.05;
        return {
          candidate_id: `seed-${index + 1}`,
          lineage: ["seed"],
          style,
          round_index: 0,
          prompt: this.compose_prompt(style, lane_instruction, [], detail_level),
          lane_instruction,
          detail_level,
          notes: ["initial lane"],
        };
      });

    if (!this.loop_seed_prompt.trim()) return seeds;

    return [
      {
        candidate_id: "loop-parent",
        lineage: ["previous-champion"],
        style: "loop-parent",
        round_index: 0,
        prompt: this.loop_seed_prompt,
        lane_instruction: "Preserve the previous champion's strongest structure while applying new refinement pressure.",
        detail_level: 0.9,
        notes: ["previous champion", ...this.base_requirements],
      },
      ...seeds.slice(0, Math.max(0, this.population_size - 1)),
    ];
  }

  private async prepare_population(population: Candidate[]): Promise<Candidate[]> {
    if (!this.modelProvider) return population;

    const previousPrompts = [
      ...this.history.map((entry) => entry.candidate.prompt),
      ...(this.loop_seed_prompt.trim() ? [this.loop_seed_prompt] : []),
    ];
    return Promise.all(
      population.map(async (candidate) => {
        const pressure = [
          ...this.base_requirements,
          ...candidate.notes.filter((note) =>
            !["initial lane", "elite carry-over", "hybridized", "mutation"].includes(note)
          ),
        ];
        const generated = await generateCandidateWithLLM(
          this.modelProvider!,
          this.mission,
          candidate.style,
          candidate.lane_instruction,
          pressure,
          previousPrompts
        );

        const prompt = generated.trim();
        if (!prompt) return candidate;

        return {
          ...candidate,
          prompt,
          detail_level: Math.max(candidate.detail_level, 0.85),
          notes: [...candidate.notes, "llm generated"],
        };
      })
    );
  }

  spawn_next_population(
    elite: Candidate[],
    scored: HistoryEntry[],
    next_round: number
  ): Candidate[] {
    const next_population: Candidate[] = elite.map((candidate, index) => {
      const detail_level = Math.min(1, candidate.detail_level + 0.18);
      return {
        candidate_id: `r${next_round}-elite-${index + 1}`,
        lineage: [...candidate.lineage, candidate.candidate_id],
        style: candidate.style,
        round_index: next_round,
        prompt: this.compose_prompt(candidate.style, candidate.lane_instruction, [], detail_level),
        lane_instruction: candidate.lane_instruction,
        detail_level,
        notes: [...candidate.notes, "elite carry-over"],
      };
    });

    const pairings = [
      [scored[0], scored[1]],
      [scored[0], scored[2] ?? scored[1]],
      [scored[1], scored[2] ?? scored[0]],
    ];

    for (const [a, b] of pairings) {
      if (next_population.length >= this.population_size) break;
      const hybrid = this.hybridize(a.candidate, a.evaluation, b.candidate, b.evaluation, next_round, next_population.length + 1);
      if (this.passes_novelty_gate(hybrid, next_population)) {
        next_population.push(hybrid);
      }
    }

    let index = 0;
    while (next_population.length < this.population_size) {
      const source = scored[index % scored.length];
      next_population.push(
        this.mutate(source.candidate, source.evaluation, next_round, next_population.length + 1)
      );
      index += 1;
    }

    return next_population.slice(0, this.population_size);
  }

  build_leaderboard(): LeaderboardEntry[] {
    return [...this.history]
      .sort((a, b) => b.evaluation.total_score - a.evaluation.total_score)
      .slice(0, 8)
      .map(({ candidate, evaluation }) => ({
        candidate_id: candidate.candidate_id,
        style: candidate.style,
        score: round3(evaluation.total_score),
        round: candidate.round_index,
      }));
  }

  round_summaries(): RoundSummary[] {
    const rounds = new Map<number, HistoryEntry[]>();
    for (const item of this.history) {
      const bucket = rounds.get(item.candidate.round_index) ?? [];
      bucket.push(item);
      rounds.set(item.candidate.round_index, bucket);
    }

    return [...rounds.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([round, entries]) => {
        const winner = [...entries].sort((a, b) => b.evaluation.total_score - a.evaluation.total_score)[0];
        return {
          round,
          winner_id: winner.candidate.candidate_id,
          winner_style: winner.candidate.style,
          winner_score: round3(winner.evaluation.total_score),
          population_size: entries.length,
        };
      });
  }

  build_round_details(): RoundDetail[] {
    const rounds = new Map<number, HistoryEntry[]>();
    for (const item of this.history) {
      const bucket = rounds.get(item.candidate.round_index) ?? [];
      bucket.push(item);
      rounds.set(item.candidate.round_index, bucket);
    }

    let previous_winner_score = 0;
    return [...rounds.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([round_index, entries], position) => {
        const sorted = [...entries].sort(
          (a, b) => b.evaluation.total_score - a.evaluation.total_score
        );
        const winner = sorted[0];
        const candidates: RoundCandidate[] = sorted.map(({ candidate, evaluation }) => ({
          candidate_id: candidate.candidate_id,
          style: candidate.style,
          change_type: this.change_type(candidate.candidate_id),
          score: round3(evaluation.total_score),
          metrics: {
            coverage: round3(evaluation.metrics.coverage),
            structure: round3(evaluation.metrics.structure),
            actionability: round3(evaluation.metrics.actionability),
            novelty: round3(evaluation.metrics.novelty),
            anti_vague: round3(evaluation.metrics.anti_vague),
          },
          critique: evaluation.critique,
          is_winner: candidate.candidate_id === winner.candidate.candidate_id,
          prompt: candidate.prompt,
        }));

        const winner_score = round3(winner.evaluation.total_score);
        const detail: RoundDetail = {
          round: round_index + 1,
          candidates,
          winner_id: winner.candidate.candidate_id,
          winner_style: winner.candidate.style,
          winner_score,
          winner_prompt: winner.candidate.prompt,
          best_critique: winner.evaluation.critique,
          improvement_from_previous:
            position === 0 ? 0 : round3(winner_score - previous_winner_score),
        };
        previous_winner_score = winner_score;
        return detail;
      });
  }

  private change_type(candidate_id: string): ChangeType {
    if (candidate_id.includes("elite")) return "elite";
    if (candidate_id.includes("hyb")) return "hybrid";
    if (candidate_id.includes("mut")) return "mutation";
    return "seed";
  }

  async evaluate_candidate(candidate: Candidate, round_index: number): Promise<Evaluation> {
    if (this.modelProvider) {
      const previousPrompts = this.history.map((h) => h.candidate.prompt);
      return evaluateWithLLM(this.modelProvider, candidate, this.mission, previousPrompts);
    }

    const copy = getFoundryCopy(this.mission.preferred_language);
    const text = candidate.prompt.toLowerCase();
    const target_terms = this.target_terms();
    const present = target_terms.filter((term) => text.includes(term.toLowerCase()));
    const missing = target_terms.filter((term) => !text.includes(term.toLowerCase()));
    const coverage = present.length / Math.max(1, target_terms.length);
    const structure = this.structure_score(candidate.prompt);
    const actionability = this.actionability_score(candidate.prompt);
    const novelty = this.novelty_score(candidate.prompt);
    const anti_vague = this.anti_vagueness_score(candidate.prompt);
    const w = this.config.weights;
    const total = coverage * w.coverage + structure * w.structure + actionability * w.actionability + novelty * w.novelty + anti_vague * w.anti_vague;

    const critique: string[] = [];
    if (missing.length > 0) critique.push(`${copy.missingDomainPressure}: ${missing.slice(0, 6).join(", ")}`);
    if (structure < 0.75) critique.push(copy.critiqueStructure);
    if (actionability < 0.75) critique.push(copy.critiqueActionability);
    if (novelty < 0.45) critique.push(copy.critiqueNovelty);
    if (anti_vague < 0.65) critique.push(copy.critiqueVagueness);
    if (critique.length === 0) critique.push(copy.summaryStrong);

    return {
      candidate_id: candidate.candidate_id,
      total_score: total,
      metrics: { coverage, structure, actionability, novelty, anti_vague },
      missing_terms: missing,
      critique,
      result_summary: `${copy.roundWinner} ${round_index} - ${candidate.candidate_id} scored ${total.toFixed(3)}.`,
    };
  }

  candidate_genome(candidate: Candidate, evaluation: Evaluation): GenomeProfile {
    const prompt = candidate.prompt;
    const domain_hits = this.mission.domain_terms.filter((term) =>
      prompt.toLowerCase().includes(term.toLowerCase())
    ).length;

    return {
      genome_id: this.sha1(prompt).slice(0, 12),
      prompt_checksum: this.sha256(prompt).slice(0, 16),
      lineage_depth: candidate.lineage.length,
      lane_mix: candidate.style.split("+"),
      bullet_density: round3((prompt.match(/- /g) || []).length / Math.max(1, prompt.split("\n").length)),
      imperative_density: round3(this.count_terms(prompt, imperativeTerms)),
      control_density: round3(this.count_terms(prompt, controlTerms)),
      domain_saturation: round3(domain_hits / Math.max(1, this.mission.domain_terms.length)),
      pressure_balance: {
        coverage: round3(evaluation.metrics.coverage),
        structure: round3(evaluation.metrics.structure),
        actionability: round3(evaluation.metrics.actionability),
        novelty: round3(evaluation.metrics.novelty),
        anti_vague: round3(evaluation.metrics.anti_vague),
      },
    };
  }

  uniqueness_thesis(candidate: Candidate, evaluation: Evaluation): string[] {
    const copy = getFoundryCopy(this.mission.preferred_language);
    const output = [copy.uniquenessCoverage, copy.uniquenessStructure];
    if (candidate.style.includes("+")) output.push(`${copy.uniquenessStyle} ${candidate.style}.`);
    if (evaluation.metrics.novelty >= 0.8) output.push(copy.uniquenessNovelty);
    return output;
  }

  render_mermaid_lineage(best_candidate: Candidate): string {
    const ids = [...best_candidate.lineage.filter((item) => item !== "seed"), best_candidate.candidate_id];
    const lines = ['flowchart LR', `    mission["Mission: ${this.mission.name}"]`];
    let previous = "mission";

    for (const id of ids) {
      const safe = id.replace(/-/g, "_");
      const candidate = this.history.find((entry) => entry.candidate.candidate_id === id)?.candidate;
      const label = candidate ? `${candidate.candidate_id}\\n${candidate.style}` : id;
      lines.push(`    ${safe}["${label}"]`);
      lines.push(`    ${previous} --> ${safe}`);
      previous = safe;
    }

    return lines.join("\n");
  }

  render_markdown_report(result: FoundryResult): string {
    const copy = getFoundryCopy(this.mission.preferred_language);
    const best = result.best_candidate;
    const eval_ = result.best_evaluation;
    const genome = result.genome_profile;

    return [
      `# ${copy.reportTitle} - ${result.mission}`,
      "",
      `## ${copy.sectionChampion}`,
      `- ${copy.fieldCandidate}: \`${best.candidate_id}\``,
      `- ${copy.fieldStyle}: \`${best.style}\``,
      `- ${copy.fieldScore}: \`${eval_.total_score}\``,
      `- ${copy.fieldGenomeId}: \`${genome.genome_id}\``,
      "",
      `## ${copy.sectionWhy}`,
      ...result.uniqueness_thesis.map((item) => `- ${item}`),
      "",
      `## ${copy.sectionPressure}`,
      ...Object.entries(eval_.metrics).map(([metric, value]) => `- ${metric}: \`${value}\``),
      "",
      `## ${copy.sectionGenome}`,
      `- ${copy.fieldLaneMix}: \`${genome.lane_mix.join(", ")}\``,
      `- ${copy.fieldLineageDepth}: \`${genome.lineage_depth}\``,
      `- ${copy.fieldBulletDensity}: \`${genome.bullet_density}\``,
      `- ${copy.fieldImperativeDensity}: \`${genome.imperative_density}\``,
      `- ${copy.fieldControlDensity}: \`${genome.control_density}\``,
      `- ${copy.fieldDomainSaturation}: \`${genome.domain_saturation}\``,
      "",
      `## ${copy.sectionRounds}`,
      ...result.round_summaries.map(
        (item) => `- ${copy.roundWinner} ${item.round}: \`${item.winner_id}\` (${item.winner_style}) -> \`${item.winner_score}\``
      ),
      "",
      `## ${copy.sectionLineage}`,
      "```mermaid",
      result.lineage_mermaid,
      "```",
    ].join("\n");
  }

  private compose_prompt(
    style: string,
    lane_instruction: string,
    extra_requirements: string[],
    detail_level = 1
  ): string {
    const copy = getFoundryCopy(this.mission.preferred_language);
    const level = Math.min(1, Math.max(0, detail_level));
    const take = <T,>(items: T[]): T[] => items.slice(0, Math.max(1, Math.ceil(level * items.length)));

    // Seeds start sparse (role + goal) and each generation adds richer sections,
    // so coverage and structure climb round over round — the evolution is real.
    const blocks = [
      `${copy.roleLane}: ${style.toUpperCase()}`,
      lane_instruction,
      `${copy.primaryGoal}: ${this.mission.goal}`,
    ];

    if (this.mission.constraints.length > 0) {
      blocks.push(`${copy.constraints}:`, ...take(this.mission.constraints).map((item) => `- ${item}`));
    }

    if (level >= 0.5 && this.mission.success_criteria.length > 0) {
      blocks.push(`${copy.successCriteria}:`, ...take(this.mission.success_criteria).map((item) => `- ${item}`));
    }

    if (level >= 0.45 && this.mission.deliverables.length > 0) {
      blocks.push(`${copy.deliverables}:`, ...take(this.mission.deliverables).map((item) => `- ${item}`));
    }

    const rules = [copy.ruleStepByStep, copy.ruleAssumptions, copy.ruleRisks, copy.ruleStructure];
    const ruleCount = Math.round(level * rules.length);
    if (ruleCount > 0) {
      blocks.push(`${copy.operatingRules}:`, ...rules.slice(0, ruleCount).map((item) => `- ${item}`));
    }

    if (level >= 0.55 && this.mission.domain_terms.length > 0) {
      blocks.push(`${copy.domainTerms}:`, ...this.mission.domain_terms.map((item) => `- ${item}`));
    }

    const refinements = [...new Set([...this.base_requirements, ...extra_requirements])];
    if (refinements.length > 0) {
      blocks.push(`${copy.refinementPressure}:`, ...refinements.map((item) => `- ${item}`));
    }

    if (level >= 0.8) {
      blocks.push(copy.outputFormat);
    }

    return blocks.join("\n");
  }

  /** Scores arbitrary text (the user's raw input) on the same axes to get an honest baseline. */
  score_raw(text: string): number {
    const target_terms = this.target_terms();
    const lower = text.toLowerCase();
    const coverage = target_terms.filter((term) => lower.includes(term.toLowerCase())).length /
      Math.max(1, target_terms.length);
    const structure = this.structure_score(text);
    const actionability = this.actionability_score(text);
    const novelty = 0.6;
    const anti_vague = this.anti_vagueness_score(text);
    return coverage * 0.34 + structure * 0.22 + actionability * 0.22 + novelty * 0.12 + anti_vague * 0.1;
  }

  private hybridize(
    a: Candidate,
    aEval: Evaluation,
    b: Candidate,
    bEval: Evaluation,
    round: number,
    index: number
  ): Candidate {
    const pressure = [...aEval.missing_terms.slice(0, 2), ...bEval.missing_terms.slice(0, 2)];
    const style = `${a.style}+${b.style}`.split("+").slice(0, 2).join("+");
    const detail_level = Math.min(1, Math.max(a.detail_level, b.detail_level) + 0.22);
    return {
      candidate_id: `r${round}-hyb-${index}`,
      lineage: [...a.lineage, a.candidate_id, b.candidate_id],
      style,
      round_index: round,
      prompt: this.compose_prompt(style, `${a.lane_instruction} ${b.lane_instruction}`, pressure, detail_level),
      lane_instruction: `${a.lane_instruction} ${b.lane_instruction}`,
      detail_level,
      notes: ["hybridized"],
    };
  }

  private mutate(candidate: Candidate, evaluation: Evaluation, round: number, index: number): Candidate {
    const pressure = evaluation.missing_terms.slice(0, 3);
    const detail_level = Math.min(1, candidate.detail_level + 0.25);
    return {
      candidate_id: `r${round}-mut-${index}`,
      lineage: [...candidate.lineage, candidate.candidate_id],
      style: candidate.style,
      round_index: round,
      prompt: this.compose_prompt(candidate.style, candidate.lane_instruction, pressure, detail_level),
      lane_instruction: candidate.lane_instruction,
      detail_level,
      notes: ["mutation", ...pressure],
    };
  }

  private passes_novelty_gate(candidate: Candidate, population: Candidate[]): boolean {
    const fingerprint = candidate.prompt.toLowerCase().slice(0, 240);
    return !population.some((item) => item.prompt.toLowerCase().slice(0, 240) === fingerprint);
  }

  private target_terms(): string[] {
    return [...this.mission.constraints, ...this.mission.success_criteria, ...this.mission.deliverables, ...this.mission.domain_terms]
      .flatMap((item) => item.toLowerCase().split(/[^a-zA-Z0-9-]+/))
      .filter((item) => item.length > 2);
  }

  private structure_score(prompt: string): number {
    const copy = getFoundryCopy(this.mission.preferred_language);
    const headings = [
      `${copy.primaryGoal}:`,
      `${copy.constraints}:`,
      `${copy.successCriteria}:`,
      `${copy.deliverables}:`,
      `${copy.operatingRules}:`,
      `${copy.outputFormat.split(":")[0]}:`,
    ];
    const hits = headings.filter((item) => prompt.includes(item)).length;
    const bullets = (prompt.match(/- /g) || []).length;
    return Math.min(1, hits / headings.length * 0.7 + Math.min(1, bullets / 12) * 0.3);
  }

  private actionability_score(prompt: string): number {
    return Math.min(1, this.count_terms(prompt, actionabilityTerms) * 1.8);
  }

  private novelty_score(prompt: string): number {
    if (this.history.length === 0) return 1;
    const words = new Set(prompt.toLowerCase().split(/\W+/).filter(Boolean));
    let highestOverlap = 0;

    for (const entry of this.history) {
      const existing = new Set(entry.candidate.prompt.toLowerCase().split(/\W+/).filter(Boolean));
      const overlap = [...words].filter((word) => existing.has(word)).length / Math.max(words.size, 1);
      highestOverlap = Math.max(highestOverlap, overlap);
    }

    return Math.max(0.2, 1 - highestOverlap);
  }

  private anti_vagueness_score(prompt: string): number {
    const vagueTerms = [
      "maybe",
      "could",
      "might",
      "nice",
      "good",
      "interesting",
      "general",
      "quizas",
      "podria",
      "tal vez",
      "peut",
      "pourrait",
      "vielleicht",
      "konnte",
    ];
    const hits = vagueTerms.filter((term) => prompt.toLowerCase().includes(term)).length;
    return Math.max(0.2, 1 - hits * 0.12);
  }

  private count_terms(prompt: string, terms: string[]): number {
    const text = prompt.toLowerCase();
    return terms.filter((term) => text.includes(term)).length / Math.max(1, terms.length);
  }

  private sha1(input: string): string {
    let hash = 0;
    for (let index = 0; index < input.length; index++) {
      hash = (hash << 5) - hash + input.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(12, "0").repeat(4);
  }

  private sha256(input: string): string {
    let hash = 2166136261;
    for (let index = 0; index < input.length; index++) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0).toString(16).padStart(16, "0").repeat(2);
  }
}

export function createDefaultMission(
  preferred_language: Mission["preferred_language"] = "en",
  preset: Mission["preset"] = "founder"
): Mission {
  return getMissionTemplate(preset, preferred_language);
}

const loopEscalations: Record<Mission["preferred_language"], string[]> = {
  en: [
    "Add explicit validation steps and a concrete next action.",
    "Surface the top risks and failure modes before the recommendation.",
    "Tighten every instruction: remove vague words, add measurable checks.",
    "Define the assumptions and edge cases the output must handle.",
  ],
  es: [
    "Agrega pasos de validacion explicitos y una siguiente accion concreta.",
    "Muestra los riesgos principales y los modos de fallo antes de la recomendacion.",
    "Ajusta cada instruccion: elimina palabras vagas y agrega chequeos medibles.",
    "Define los supuestos y casos limite que la salida debe manejar.",
  ],
  fr: [
    "Ajoute des etapes de validation explicites et une action suivante concrete.",
    "Expose les risques principaux et les modes d echec avant la recommandation.",
    "Resserre chaque instruction : supprime les mots vagues et ajoute des verifications mesurables.",
    "Definis les hypotheses et les cas limites que la sortie doit gerer.",
  ],
  de: [
    "Fuge explizite Validierungsschritte und eine konkrete nachste Aktion hinzu.",
    "Zeige die wichtigsten Risiken und Fehlermodi vor der Empfehlung.",
    "Verscharfe jede Anweisung: entferne vage Worter und fuge messbare Checks hinzu.",
    "Definiere Annahmen und Randfalle, die die Ausgabe behandeln muss.",
  ],
};

/**
 * Builds the accumulated refinement pressure for the next chained loop.
 * Feeds back the champion's still-missing domain terms; when coverage is
 * already saturated it injects an escalating quality directive so each
 * "run another round" keeps moving the score forward.
 */
export function nextLoopRequirements(
  previous: string[],
  missingTerms: string[],
  language: Mission["preferred_language"]
): string[] {
  const escalation = loopEscalations[language] ?? loopEscalations.en;
  const additions =
    missingTerms.length > 0
      ? missingTerms.slice(0, 4)
      : [escalation[previous.length % escalation.length]];
  return [...new Set([...previous, ...additions])];
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

const actionabilityTerms = [
  "validate",
  "plan",
  "risk",
  "next",
  "check",
  "deliver",
  "assumption",
  "review",
  "validacion",
  "riesgo",
  "siguiente",
  "plan",
  "validation",
  "risques",
  "action suivante",
  "validierung",
  "risiko",
  "nachster",
];

const imperativeTerms = [
  "must",
  "include",
  "define",
  "validate",
  "deliver",
  "review",
  "check",
  "ensure",
  "debe",
  "incluye",
  "valida",
  "entrega",
  "revisa",
  "asegura",
  "doit",
  "inclure",
  "valider",
  "livrer",
  "verifier",
  "sicherstellen",
  "prufen",
  "liefern",
];

const controlTerms = [
  "risk",
  "failure",
  "constraints",
  "assumptions",
  "validation",
  "guardrails",
  "riesgo",
  "fallo",
  "restricciones",
  "supuestos",
  "validacion",
  "risque",
  "echec",
  "contraintes",
  "hypotheses",
  "validation",
  "risiko",
  "fehler",
  "vorgaben",
  "annahmen",
  "validierung",
];
