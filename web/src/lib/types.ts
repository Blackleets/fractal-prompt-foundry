export type LanguageCode = "en" | "es" | "fr" | "de";

export type UserPresetId =
  | "founder"
  | "marketer"
  | "analyst"
  | "operator"
  | "researcher";

export type InputMode = "quick" | "advanced";

export interface Mission {
  name: string;
  goal: string;
  constraints: string[];
  success_criteria: string[];
  deliverables: string[];
  domain_terms: string[];
  preferred_language: LanguageCode;
  preset: UserPresetId;
  audience: string;
}

export interface Candidate {
  candidate_id: string;
  lineage: string[];
  style: string;
  round_index: number;
  prompt: string;
  lane_instruction: string;
  detail_level: number;
  notes: string[];
}

export interface Evaluation {
  candidate_id: string;
  total_score: number;
  metrics: {
    coverage: number;
    structure: number;
    actionability: number;
    novelty: number;
    anti_vague: number;
  };
  missing_terms: string[];
  result_summary: string;
  critique: string[];
}

export interface RoundSummary {
  round: number;
  winner_id: string;
  winner_style: string;
  winner_score: number;
  population_size: number;
}

export type ChangeType = "seed" | "elite" | "mutation" | "hybrid";

export interface RoundCandidate {
  candidate_id: string;
  style: string;
  change_type: ChangeType;
  score: number;
  metrics: Evaluation["metrics"];
  critique: string[];
  is_winner: boolean;
  prompt: string;
}

export interface RoundDetail {
  round: number;
  candidates: RoundCandidate[];
  winner_id: string;
  winner_style: string;
  winner_score: number;
  winner_prompt: string;
  best_critique: string[];
  improvement_from_previous: number;
}

export interface GenomeProfile {
  genome_id: string;
  prompt_checksum: string;
  lineage_depth: number;
  lane_mix: string[];
  bullet_density: number;
  imperative_density: number;
  control_density: number;
  domain_saturation: number;
  pressure_balance: Evaluation["metrics"];
}

export interface LeaderboardEntry {
  candidate_id: string;
  style: string;
  score: number;
  round: number;
}

export interface FoundryResult {
  mission: string;
  best_candidate: {
    candidate_id: string;
    style: string;
    lineage: string[];
    prompt: string;
    notes: string[];
  };
  best_evaluation: {
    total_score: number;
    metrics: Evaluation["metrics"];
    missing_terms: string[];
    critique: string[];
    result_summary: string;
  };
  leaderboard: LeaderboardEntry[];
  round_summaries: RoundSummary[];
  rounds: RoundDetail[];
  initial_score: number;
  final_score: number;
  improvement: number;
  genome_profile: GenomeProfile;
  lineage_mermaid: string;
  uniqueness_thesis: string[];
  report_markdown: string;
}

export interface HistoryEntry {
  candidate: Candidate;
  evaluation: Evaluation;
}

export interface EvolutionConfig {
  rounds: number;
  populationSize: number;
  mutationRate: number;
  eliteCount: number;
  weights: {
    coverage: number;
    structure: number;
    actionability: number;
    novelty: number;
    anti_vague: number;
  };
}

export const DEFAULT_EVOLUTION_CONFIG: EvolutionConfig = {
  rounds: 4,
  populationSize: 5,
  mutationRate: 0.25,
  eliteCount: 2,
  weights: {
    coverage: 0.34,
    structure: 0.22,
    actionability: 0.22,
    novelty: 0.12,
    anti_vague: 0.10,
  },
};

export interface SavedRun {
  id: string;
  created_at: string;
  language: LanguageCode;
  preset: UserPresetId;
  mission: Mission;
  original_input: string;
  score: number;
  initial_score?: number;
  loop_count?: number;
  prompt: string;
  report_markdown: string;
  result?: FoundryResult;
}
