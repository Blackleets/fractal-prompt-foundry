from __future__ import annotations

import argparse
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, List, Dict, Tuple
import hashlib
import itertools
import json
import re


@dataclass
class Mission:
    name: str
    goal: str
    constraints: List[str]
    success_criteria: List[str]
    deliverables: List[str]
    domain_terms: List[str] = field(default_factory=list)

    @staticmethod
    def _string_list(data: Dict[str, Any], field_name: str, *, required: bool = True) -> List[str]:
        value = data.get(field_name)
        if value is None:
            if required:
                raise ValueError(f"Mission data is missing required fields: {field_name}")
            return []
        if isinstance(value, str) or not isinstance(value, list):
            raise ValueError(f"Mission field '{field_name}' must be a list of strings.")
        return [str(item) for item in value]

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Mission":
        required = ["name", "goal", "constraints", "success_criteria", "deliverables"]
        missing = [key for key in required if key not in data]
        if missing:
            raise ValueError(f"Mission data is missing required fields: {', '.join(missing)}")
        return cls(
            name=str(data["name"]),
            goal=str(data["goal"]),
            constraints=cls._string_list(data, "constraints"),
            success_criteria=cls._string_list(data, "success_criteria"),
            deliverables=cls._string_list(data, "deliverables"),
            domain_terms=cls._string_list(data, "domain_terms", required=False),
        )

    @classmethod
    def from_json_file(cls, path: str | Path) -> "Mission":
        path_obj = Path(path)
        try:
            raw = path_obj.read_text(encoding="utf-8")
        except FileNotFoundError as exc:
            raise ValueError(f"Mission file not found: {path_obj}") from exc
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON in mission file: {path_obj}") from exc
        return cls.from_dict(payload)


@dataclass
class Candidate:
    candidate_id: str
    lineage: List[str]
    style: str
    round_index: int
    prompt: str
    lane_instruction: str
    notes: List[str] = field(default_factory=list)


@dataclass
class Evaluation:
    candidate_id: str
    total_score: float
    metrics: Dict[str, float]
    missing_terms: List[str]
    result_summary: str
    critique: List[str]


class FractalPromptFoundry:
    """
    Prototype engine for evolving prompts through:
    - Prompt DNA (structured prompt blocks)
    - Mutation lanes (style-specific refinement)
    - Novelty gates (avoid near-duplicates)
    - Pressure scoring (coverage + actionability + clarity + novelty)

    The default evaluator is deterministic so the prototype can be tested
    locally without LLM/API dependencies. Replace `evaluate_candidate` later
    with a real agent call when integrating into Hermes or another backend.
    """

    STYLE_LANES = {
        "architect": "Think in systems, modules, contracts, and failure modes.",
        "operator": "Think in execution steps, observability, and safe operations.",
        "critic": "Think in risks, edge cases, weak assumptions, and adversarial checks.",
        "compressor": "Force concise, information-dense instructions with zero fluff.",
        "strategist": "Think in prioritization, sequencing, constraints, and tradeoffs.",
    }

    def __init__(self, mission: Mission, population_size: int = 5):
        if population_size <= 0:
            raise ValueError("population_size must be a positive integer")
        self.mission = mission
        self.population_size = population_size
        self.history: List[Tuple[Candidate, Evaluation]] = []

    def run(self, rounds: int = 3) -> Dict[str, object]:
        if rounds <= 0:
            raise ValueError("rounds must be a positive integer")
        population = self.seed_population()

        for round_index in range(rounds):
            prior_prompts = [prev_candidate.prompt for prev_candidate, _ in self.history]
            scored: List[Tuple[Candidate, Evaluation]] = []
            for candidate in population:
                peer_prompts = [peer.prompt for peer in population if peer.candidate_id != candidate.candidate_id]
                evaluation = self.evaluate_candidate(
                    candidate,
                    round_index,
                    prior_prompts=prior_prompts,
                    peer_prompts=peer_prompts,
                )
                scored.append((candidate, evaluation))
                self.history.append((candidate, evaluation))

            scored.sort(key=lambda item: item[1].total_score, reverse=True)
            elite = [item[0] for item in scored[:2]]
            population = self.spawn_next_population(elite, scored, round_index + 1)

        best_candidate, best_evaluation = max(self.history, key=lambda item: item[1].total_score)
        final_round = max(candidate.round_index for candidate, _ in self.history)
        evolved_candidate, evolved_evaluation = max(
            (
                (candidate, evaluation)
                for candidate, evaluation in self.history
                if candidate.round_index == final_round
            ),
            key=lambda item: item[1].total_score,
        )
        first_round_candidate, first_round_evaluation = max(
            (
                (candidate, evaluation)
                for candidate, evaluation in self.history
                if candidate.round_index == 0
            ),
            key=lambda item: item[1].total_score,
        )
        leaderboard = [
            {
                "candidate_id": candidate.candidate_id,
                "style": candidate.style,
                "score": round(evaluation.total_score, 3),
                "round": candidate.round_index,
            }
            for candidate, evaluation in sorted(self.history, key=lambda item: item[1].total_score, reverse=True)[:10]
        ]
        round_summaries = self.round_summaries()
        lineage_mermaid = self.render_mermaid_lineage(evolved_candidate)
        genome_profile = self.candidate_genome(best_candidate, best_evaluation)
        evolved_genome_profile = self.candidate_genome(evolved_candidate, evolved_evaluation)
        baseline_diff = self.baseline_diff(first_round_candidate, first_round_evaluation, evolved_candidate, evolved_evaluation)
        result = {
            "mission": self.mission.name,
            "best_candidate": {
                "candidate_id": best_candidate.candidate_id,
                "style": best_candidate.style,
                "lineage": best_candidate.lineage,
                "prompt": best_candidate.prompt,
                "notes": best_candidate.notes,
            },
            "best_evaluation": {
                "total_score": round(best_evaluation.total_score, 3),
                "metrics": {k: round(v, 3) for k, v in best_evaluation.metrics.items()},
                "missing_terms": best_evaluation.missing_terms,
                "critique": best_evaluation.critique,
                "result_summary": best_evaluation.result_summary,
            },
            "evolved_candidate": {
                "candidate_id": evolved_candidate.candidate_id,
                "style": evolved_candidate.style,
                "lineage": evolved_candidate.lineage,
                "prompt": evolved_candidate.prompt,
                "notes": evolved_candidate.notes,
            },
            "evolved_evaluation": {
                "total_score": round(evolved_evaluation.total_score, 3),
                "metrics": {k: round(v, 3) for k, v in evolved_evaluation.metrics.items()},
                "missing_terms": evolved_evaluation.missing_terms,
                "critique": evolved_evaluation.critique,
                "result_summary": evolved_evaluation.result_summary,
            },
            "leaderboard": leaderboard,
            "round_summaries": round_summaries,
            "genome_profile": genome_profile,
            "evolved_genome_profile": evolved_genome_profile,
            "baseline_diff": baseline_diff,
            "lineage_mermaid": lineage_mermaid,
            "uniqueness_thesis": self.uniqueness_thesis(evolved_candidate, evolved_evaluation),
            "evolution_summary": {
                "final_round": final_round,
                "global_best_candidate_id": best_candidate.candidate_id,
                "global_best_score": round(best_evaluation.total_score, 3),
                "evolved_best_candidate_id": evolved_candidate.candidate_id,
                "evolved_best_score": round(evolved_evaluation.total_score, 3),
                "seed_best_candidate_id": first_round_candidate.candidate_id,
                "seed_best_score": round(first_round_evaluation.total_score, 3),
                "score_delta_vs_seed": round(evolved_evaluation.total_score - first_round_evaluation.total_score, 3),
                "score_delta_vs_global_best": round(evolved_evaluation.total_score - best_evaluation.total_score, 3),
                "evolution_outperformed_seed": evolved_evaluation.total_score > first_round_evaluation.total_score,
                "evolution_found_global_best": evolved_candidate.candidate_id == best_candidate.candidate_id,
            },
        }
        result["report_markdown"] = self.render_markdown_report(result)
        return result

    def seed_population(self) -> List[Candidate]:
        population = []
        for idx, (style, lane_instruction) in enumerate(self.STYLE_LANES.items()):
            prompt = self.compose_prompt(style, lane_instruction, extra_requirements=[])
            population.append(
                Candidate(
                    candidate_id=f"seed-{idx+1}",
                    lineage=["seed"],
                    style=style,
                    round_index=0,
                    prompt=prompt,
                    lane_instruction=lane_instruction,
                    notes=["initial lane"],
                )
            )
        return population[: self.population_size]

    def spawn_next_population(
        self,
        elite: List[Candidate],
        scored: List[Tuple[Candidate, Evaluation]],
        next_round: int,
    ) -> List[Candidate]:
        next_population: List[Candidate] = []

        for idx, champion in enumerate(elite):
            next_population.append(
                Candidate(
                    candidate_id=f"r{next_round}-elite-{idx+1}",
                    lineage=champion.lineage + [champion.candidate_id],
                    style=champion.style,
                    round_index=next_round,
                    prompt=champion.prompt,
                    lane_instruction=champion.lane_instruction,
                    notes=champion.notes + ["elite carry-over"],
                )
            )

        pairings = list(itertools.combinations(scored[:3], 2))
        for idx, pairing in enumerate(pairings, start=1):
            if len(next_population) >= self.population_size:
                break
            (cand_a, eval_a), (cand_b, eval_b) = pairing
            hybrid = self.hybridize(cand_a, eval_a, cand_b, eval_b, next_round, idx)
            if self.passes_novelty_gate(hybrid, next_population):
                next_population.append(hybrid)

        while len(next_population) < self.population_size:
            source_candidate, source_eval = scored[(len(next_population) - len(elite)) % len(scored)]
            mutation = self.mutate(source_candidate, source_eval, next_round, len(next_population) + 1)
            if self.passes_novelty_gate(mutation, next_population):
                next_population.append(mutation)
            else:
                mutation.notes.append("novelty rescue")
                mutation.prompt += "\n- Add one unconventional but useful angle not seen above."
                next_population.append(mutation)

        return next_population[: self.population_size]

    def compose_prompt(self, style: str, lane_instruction: str, extra_requirements: List[str]) -> str:
        mission = self.mission
        blocks = [
            f"ROLE LANE: {style.upper()}",
            lane_instruction,
            f"PRIMARY GOAL: {mission.goal}",
            "CONSTRAINTS:",
            *[f"- {c}" for c in mission.constraints],
            "SUCCESS CRITERIA:",
            *[f"- {c}" for c in mission.success_criteria],
            "DELIVERABLES:",
            *[f"- {d}" for d in mission.deliverables],
            "OPERATING RULES:",
            "- Think step-by-step internally but output only actionable results.",
            "- Use explicit assumptions when data is missing.",
            "- Surface risks before final recommendations.",
            "- Prefer structured output over vague prose.",
        ]
        if mission.domain_terms:
            blocks.extend(["DOMAIN TERMS TO USE WHEN RELEVANT:", *[f"- {term}" for term in mission.domain_terms]])
        if extra_requirements:
            blocks.extend(["REFINEMENT PRESSURE:", *[f"- {item}" for item in extra_requirements]])
        blocks.append("OUTPUT FORMAT: Summary, Plan, Risks, Validation, Next Action.")
        return "\n".join(blocks)

    def evaluate_candidate(
        self,
        candidate: Candidate,
        round_index: int,
        *,
        prior_prompts: List[str] | None = None,
        peer_prompts: List[str] | None = None,
    ) -> Evaluation:
        text = candidate.prompt.lower()
        target_terms = self.target_terms()
        prior_prompts = prior_prompts or []
        peer_prompts = peer_prompts or []

        present = [term for term in target_terms if term.lower() in text]
        missing = [term for term in target_terms if term.lower() not in text]

        coverage = len(present) / max(1, len(target_terms))
        structure = self.structure_score(candidate.prompt)
        actionability = self.actionability_score(candidate.prompt)
        refinement = self.refinement_score(candidate)
        evolutionary_gain = self.evolutionary_gain_score(candidate)
        novelty = self.novelty_score(candidate.prompt, prior_prompts=prior_prompts, peer_prompts=peer_prompts)
        anti_vague = self.anti_vagueness_score(candidate.prompt)

        total = (
            coverage * 0.24
            + structure * 0.15
            + actionability * 0.16
            + refinement * 0.17
            + evolutionary_gain * 0.10
            + novelty * 0.08
            + anti_vague * 0.10
        )

        critique = []
        if missing:
            critique.append(f"Missing domain pressure: {', '.join(missing[:6])}")
        if structure < 0.75:
            critique.append("Needs clearer output sections or stronger formatting constraints.")
        if actionability < 0.75:
            critique.append("Needs more explicit validation, next steps, or execution framing.")
        if refinement < 0.7:
            critique.append("Needs stronger refinement pressure: verification, failure mode, or sharper execution hooks.")
        if evolutionary_gain < 0.5:
            critique.append("Still too close to a static lane; the prompt needs more evolutionary signal or recombination value.")
        if novelty < 0.45:
            critique.append("Too similar to previous prompt DNA; mutation should introduce a new angle.")
        if anti_vague < 0.65:
            critique.append("Contains soft language; increase specificity and concrete directives.")
        if not critique:
            critique.append("Strong candidate; mostly optimize for style and compression.")

        result_summary = (
            f"Round {round_index} candidate {candidate.candidate_id} covered {len(present)}/{len(target_terms)} key terms "
            f"with a total pressure score of {total:.3f}."
        )

        return Evaluation(
            candidate_id=candidate.candidate_id,
            total_score=total,
            metrics={
                "coverage": coverage,
                "structure": structure,
                "actionability": actionability,
                "refinement": refinement,
                "evolutionary_gain": evolutionary_gain,
                "novelty": novelty,
                "anti_vague": anti_vague,
            },
            missing_terms=missing,
            result_summary=result_summary,
            critique=critique,
        )

    def mutate(self, candidate: Candidate, evaluation: Evaluation, next_round: int, index: int) -> Candidate:
        extra = []
        if evaluation.missing_terms:
            extra.append(f"Explicitly include these concepts: {', '.join(evaluation.missing_terms[:5])}")
        extra.extend(
            [
                "Force one measurable validation step.",
                "Add a failure-mode paragraph.",
                "State a prioritised next action at the end.",
            ]
        )
        extra.extend(self.style_pressure(candidate.style, next_round, index))
        prompt = self.compose_prompt(candidate.style, candidate.lane_instruction, extra)
        return Candidate(
            candidate_id=f"r{next_round}-mut-{index}",
            lineage=candidate.lineage + [candidate.candidate_id],
            style=candidate.style,
            round_index=next_round,
            prompt=prompt,
            lane_instruction=candidate.lane_instruction,
            notes=candidate.notes + ["mutation lane"],
        )

    def hybridize(
        self,
        cand_a: Candidate,
        eval_a: Evaluation,
        cand_b: Candidate,
        eval_b: Evaluation,
        next_round: int,
        index: int,
    ) -> Candidate:
        merged_style = self.merge_styles(cand_a.style, cand_b.style)
        lane_summary = (
            f"Merge the strengths of {cand_a.style} and {cand_b.style}. "
            f"Preserve operational clarity, inject critique and edge-case pressure, and make the final output feel decisively executable."
        )
        merged_requirements = []
        merged_requirements.extend([f"Carry over strengths from {cand_a.candidate_id} and {cand_b.candidate_id}."])
        if eval_a.missing_terms or eval_b.missing_terms:
            merged_missing = list(dict.fromkeys(eval_a.missing_terms[:3] + eval_b.missing_terms[:3]))
            if merged_missing:
                merged_requirements.append("Close these conceptual gaps: " + ", ".join(merged_missing))
        merged_requirements.extend(
            [
                "Include one explicit verification checklist.",
                "End with a decisive next move rather than open-ended advice.",
            ]
        )
        merged_requirements.extend(self.style_pressure(merged_style, next_round, index))
        prompt = self.compose_prompt(merged_style, lane_summary, merged_requirements)
        return Candidate(
            candidate_id=f"r{next_round}-hyb-{index}",
            lineage=cand_a.lineage + [cand_a.candidate_id, cand_b.candidate_id],
            style=merged_style,
            round_index=next_round,
            prompt=prompt,
            lane_instruction=lane_summary,
            notes=["hybrid lineage"],
        )

    def passes_novelty_gate(self, candidate: Candidate, population: List[Candidate]) -> bool:
        for existing in population:
            if self.similarity(candidate.prompt, existing.prompt) > 0.94:
                return False
        return True

    def target_terms(self) -> List[str]:
        terms = list(self.mission.domain_terms)
        terms.extend(self.extract_keywords(self.mission.goal))
        for item in self.mission.constraints + self.mission.success_criteria + self.mission.deliverables:
            terms.extend(self.extract_keywords(item))
        normalized = [term.strip().lower() for term in terms if len(term.strip()) >= 4]
        return list(dict.fromkeys(normalized))[:24]

    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        words = re.findall(r"[A-Za-z][A-Za-z0-9_-]+", text.lower())
        stop = {
            "that", "with", "from", "this", "then", "into", "your", "have", "will", "must",
            "should", "only", "when", "than", "them", "they", "about", "through", "under",
            "using", "make", "build", "create", "just", "need", "more", "less", "high",
            "risk", "goal", "plan", "next", "action", "summary", "output", "format"
        }
        return [w for w in words if w not in stop]

    @staticmethod
    def structure_score(prompt: str) -> float:
        headings = [
            "PRIMARY GOAL:", "CONSTRAINTS:", "SUCCESS CRITERIA:",
            "DELIVERABLES:", "OPERATING RULES:", "OUTPUT FORMAT:"
        ]
        hits = sum(1 for h in headings if h in prompt)
        bullet_count = prompt.count("- ")
        return min(1.0, (hits / len(headings)) * 0.7 + min(1.0, bullet_count / 12) * 0.3)

    @staticmethod
    def actionability_score(prompt: str) -> float:
        action_terms = [
            "validate", "checklist", "next action", "assumptions", "risks", "deliverables", "explicit",
            "measurable", "steps", "prioritised", "verification"
        ]
        lower = prompt.lower()
        hits = sum(1 for term in action_terms if term in lower)
        return min(1.0, hits / 8)

    def novelty_score(
        self,
        prompt: str,
        *,
        prior_prompts: List[str] | None = None,
        peer_prompts: List[str] | None = None,
    ) -> float:
        prior_prompts = prior_prompts or []
        peer_prompts = peer_prompts or []
        if not prior_prompts and not peer_prompts:
            return 0.75

        peer_similarity = max((self.similarity(prompt, peer) for peer in peer_prompts), default=0.0)
        history_similarity = max((self.similarity(prompt, prev) for prev in prior_prompts), default=0.0)
        blended_similarity = max(history_similarity * 0.75, peer_similarity * 0.45)
        return max(0.0, min(1.0, 1.0 - blended_similarity))

    def refinement_score(self, candidate: Candidate) -> float:
        lower = candidate.prompt.lower()
        refinement_terms = [
            "verification checklist",
            "failure-mode",
            "failure mode",
            "prioritised next action",
            "decisive next move",
            "refinement pressure",
            "measurable validation",
            "close these conceptual gaps",
            "carry over strengths",
            "explicitly include these concepts",
        ]
        hits = sum(1 for term in refinement_terms if term in lower)
        note_bonus = 1 if any("mutation" in note or "hybrid" in note for note in candidate.notes) else 0
        return min(1.0, (hits + note_bonus) / 5)

    def evolutionary_gain_score(self, candidate: Candidate) -> float:
        styles = candidate.style.split("+")
        unique_styles = list(dict.fromkeys(styles))
        lineage_depth = max(0, len(candidate.lineage) - 1)
        style_mix = min(1.0, max(0, len(unique_styles) - 1) / 3)
        depth_score = min(1.0, lineage_depth / 4)
        note_score = 1.0 if any("hybrid" in note for note in candidate.notes) else 0.6 if any("mutation" in note for note in candidate.notes) else 0.0
        return round(min(1.0, style_mix * 0.45 + depth_score * 0.35 + note_score * 0.20), 3)

    def merge_styles(self, *styles: str) -> str:
        tokens: List[str] = []
        for style in styles:
            tokens.extend(part for part in style.split("+") if part)
        return "+".join(dict.fromkeys(tokens))

    def style_pressure(self, style: str, next_round: int, index: int) -> List[str]:
        pressures = []
        style_tokens = set(style.split("+"))
        if "architect" in style_tokens:
            pressures.append("Add one compact system map: inputs, decision layer, safety layer, outputs.")
        if "operator" in style_tokens:
            pressures.append("Specify one observability block with logs, metrics, and abort conditions.")
        if "critic" in style_tokens:
            pressures.append("Name the weakest assumption and how to falsify it before acting.")
        if "compressor" in style_tokens:
            pressures.append("Compress every section so each bullet carries one hard instruction.")
        if "strategist" in style_tokens:
            pressures.append("Sequence the work into now, next, later with a stated tradeoff.")
        pressures.append(f"Tag this refinement pass as round {next_round}, variant {index} in the internal planning logic.")
        return pressures[:4]

    @staticmethod
    def anti_vagueness_score(prompt: str) -> float:
        lower = prompt.lower()
        vague_terms = ["maybe", "probably", "perhaps", "try to", "somehow", "nice", "good enough"]
        penalties = sum(1 for term in vague_terms if term in lower)
        strong_terms = ["explicit", "measurable", "validation", "constraints", "deliverables", "checklist"]
        boosts = sum(1 for term in strong_terms if term in lower)
        score = 0.65 + min(0.3, boosts * 0.05) - penalties * 0.1
        return max(0.0, min(1.0, score))

    @staticmethod
    def similarity(a: str, b: str) -> float:
        sa = set(FractalPromptFoundry.shingles(a.lower(), size=3))
        sb = set(FractalPromptFoundry.shingles(b.lower(), size=3))
        if not sa or not sb:
            return 0.0
        return len(sa & sb) / len(sa | sb)

    @staticmethod
    def shingles(text: str, size: int = 3) -> List[str]:
        tokens = re.findall(r"[A-Za-z0-9_-]+", text)
        if len(tokens) < size:
            return tokens
        return [" ".join(tokens[i : i + size]) for i in range(len(tokens) - size + 1)]

    def round_summaries(self) -> List[Dict[str, object]]:
        grouped: Dict[int, List[Tuple[Candidate, Evaluation]]] = {}
        for candidate, evaluation in self.history:
            grouped.setdefault(candidate.round_index, []).append((candidate, evaluation))

        summaries = []
        for round_index in sorted(grouped):
            ranked = sorted(grouped[round_index], key=lambda item: item[1].total_score, reverse=True)
            winner, winner_eval = ranked[0]
            summaries.append(
                {
                    "round": round_index,
                    "winner_id": winner.candidate_id,
                    "winner_style": winner.style,
                    "winner_score": round(winner_eval.total_score, 3),
                    "population_size": len(ranked),
                }
            )
        return summaries

    def candidate_genome(self, candidate: Candidate, evaluation: Evaluation) -> Dict[str, object]:
        lower = candidate.prompt.lower()
        bullets = candidate.prompt.count("- ")
        imperative_terms = ["include", "force", "state", "end with", "surface", "prefer", "use"]
        imperative_hits = sum(1 for term in imperative_terms if term in lower)
        control_terms = ["risk", "validation", "checklist", "failure", "constraints", "explicit"]
        control_hits = sum(1 for term in control_terms if term in lower)
        domain_terms = self.target_terms()
        domain_hits = sum(1 for term in domain_terms if term in lower)
        signature_seed = "|".join([candidate.style, candidate.prompt, ",".join(candidate.lineage)])
        genome_id = hashlib.sha1(signature_seed.encode("utf-8")).hexdigest()[:12]
        return {
            "genome_id": genome_id,
            "prompt_checksum": hashlib.sha256(candidate.prompt.encode("utf-8")).hexdigest()[:16],
            "lineage_depth": len(candidate.lineage),
            "lane_mix": candidate.style.split("+"),
            "bullet_density": round(min(1.0, bullets / 16), 3),
            "imperative_density": round(min(1.0, imperative_hits / 6), 3),
            "control_density": round(min(1.0, control_hits / 6), 3),
            "domain_saturation": round(min(1.0, domain_hits / max(1, len(domain_terms))), 3),
            "pressure_balance": {k: round(v, 3) for k, v in evaluation.metrics.items()},
        }

    def baseline_diff(
        self,
        seed_candidate: Candidate,
        seed_evaluation: Evaluation,
        evolved_candidate: Candidate,
        evolved_evaluation: Evaluation,
    ) -> Dict[str, object]:
        seed_lines = {line.strip() for line in seed_candidate.prompt.splitlines() if line.strip()}
        evolved_lines = {line.strip() for line in evolved_candidate.prompt.splitlines() if line.strip()}
        added = [line for line in evolved_candidate.prompt.splitlines() if line.strip() and line.strip() not in seed_lines]
        removed = [line for line in seed_candidate.prompt.splitlines() if line.strip() and line.strip() not in evolved_lines]
        metric_delta = {
            key: round(evolved_evaluation.metrics.get(key, 0.0) - seed_evaluation.metrics.get(key, 0.0), 3)
            for key in evolved_evaluation.metrics
        }
        return {
            "seed_candidate_id": seed_candidate.candidate_id,
            "evolved_candidate_id": evolved_candidate.candidate_id,
            "seed_style": seed_candidate.style,
            "evolved_style": evolved_candidate.style,
            "added_lines": added[:10],
            "removed_lines": removed[:10],
            "metric_delta": metric_delta,
            "score_delta": round(evolved_evaluation.total_score - seed_evaluation.total_score, 3),
        }

    def uniqueness_thesis(self, candidate: Candidate, evaluation: Evaluation) -> List[str]:
        lane_mix = candidate.style.split("+")
        statements = [
            "Treat prompts as versioned genomes instead of static templates.",
            "Expose lineage, pressure scores, and novelty gating as first-class artifacts.",
        ]
        if len(lane_mix) > 1:
            statements.append(f"Champion prompt emerged from lane recombination: {' + '.join(lane_mix)}.")
        if evaluation.metrics.get("novelty", 0) >= 0.8:
            statements.append("Current winner preserved high novelty instead of collapsing into prompt sameness.")
        return statements

    def render_mermaid_lineage(self, best_candidate: Candidate) -> str:
        candidate_lookup = {candidate.candidate_id: candidate for candidate, _ in self.history}
        nodes = ["flowchart LR"]
        edges = set()
        ordered_lineage = [token for token in best_candidate.lineage if token != "seed"] + [best_candidate.candidate_id]
        previous = "mission"
        nodes.append(f'    mission["Mission: {self.mission.name}"]')
        for token in ordered_lineage:
            if token in candidate_lookup:
                node = candidate_lookup[token]
                label = f"{node.candidate_id}\\n{node.style}"
            else:
                label = token
            nodes.append(f'    {token.replace("-", "_")}["{label}"]')
            edge = (previous.replace("-", "_"), token.replace("-", "_"))
            if edge not in edges:
                nodes.append(f"    {edge[0]} --> {edge[1]}")
                edges.add(edge)
            previous = token
        return "\n".join(nodes)

    def render_markdown_report(self, result: Dict[str, object]) -> str:
        best_candidate = result["best_candidate"]
        best_evaluation = result["best_evaluation"]
        genome_profile = result["genome_profile"]
        evolved_candidate = result["evolved_candidate"]
        evolved_evaluation = result["evolved_evaluation"]
        evolved_genome_profile = result["evolved_genome_profile"]
        evolution_summary = result["evolution_summary"]
        baseline_diff = result["baseline_diff"]
        lines = [
            f"# Fractal Prompt Foundry Report — {result['mission']}",
            "",
            "## Global best candidate",
            f"- Candidate: `{best_candidate['candidate_id']}`",
            f"- Style: `{best_candidate['style']}`",
            f"- Score: `{best_evaluation['total_score']}`",
            f"- Genome ID: `{genome_profile['genome_id']}`",
            "",
            "## Best evolved candidate",
            f"- Candidate: `{evolved_candidate['candidate_id']}`",
            f"- Style: `{evolved_candidate['style']}`",
            f"- Score: `{evolved_evaluation['total_score']}`",
            f"- Genome ID: `{evolved_genome_profile['genome_id']}`",
            "",
            "## Evolution verdict",
            f"- Final round: `{evolution_summary['final_round']}`",
            f"- Seed baseline: `{evolution_summary['seed_best_candidate_id']}` → `{evolution_summary['seed_best_score']}`",
            f"- Evolved best: `{evolution_summary['evolved_best_candidate_id']}` → `{evolution_summary['evolved_best_score']}`",
            f"- Delta vs seed: `{evolution_summary['score_delta_vs_seed']}`",
            f"- Delta vs global best: `{evolution_summary['score_delta_vs_global_best']}`",
            f"- Evolution outperformed seed: `{evolution_summary['evolution_outperformed_seed']}`",
            "",
            "## Why this run feels unique",
            *[f"- {item}" for item in result["uniqueness_thesis"]],
            "",
            "## Pressure balance",
            *[f"- {metric}: `{value}`" for metric, value in evolved_evaluation["metrics"].items()],
            "",
            "## Evolved genome profile",
            f"- Lane mix: `{', '.join(evolved_genome_profile['lane_mix'])}`",
            f"- Lineage depth: `{evolved_genome_profile['lineage_depth']}`",
            f"- Bullet density: `{evolved_genome_profile['bullet_density']}`",
            f"- Imperative density: `{evolved_genome_profile['imperative_density']}`",
            f"- Control density: `{evolved_genome_profile['control_density']}`",
            f"- Domain saturation: `{evolved_genome_profile['domain_saturation']}`",
            "",
            "## Baseline vs evolved diff",
            f"- Seed baseline: `{baseline_diff['seed_candidate_id']}` ({baseline_diff['seed_style']})",
            f"- Evolved champion: `{baseline_diff['evolved_candidate_id']}` ({baseline_diff['evolved_style']})",
            f"- Score delta: `{baseline_diff['score_delta']}`",
            "",
            "### Metric deltas",
            *[f"- {metric}: `{delta:+.3f}`" for metric, delta in baseline_diff["metric_delta"].items()],
            "",
            "### Added prompt lines",
        ]
        lines.extend([f"- {line}" for line in baseline_diff["added_lines"]] or ["- None"])
        lines.extend([
            "",
            "### Removed prompt lines",
        ])
        lines.extend([f"- {line}" for line in baseline_diff["removed_lines"]] or ["- None"])
        lines.extend([
            "",
            "## Round winners",
            *[
                f"- Round {item['round']}: `{item['winner_id']}` ({item['winner_style']}) → `{item['winner_score']}`"
                for item in result["round_summaries"]
            ],
            "",
            "## Lineage graph",
            "```mermaid",
            result["lineage_mermaid"],
            "```",
        ])
        return "\n".join(lines)

    def save_run_artifacts(self, output_dir: str | Path, result: Dict[str, object]) -> Dict[str, str]:
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        json_path = output_path / "result.json"
        report_path = output_path / "report.md"
        json_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
        report_path.write_text(result["report_markdown"], encoding="utf-8")
        return {
            "result_json": str(json_path),
            "report_markdown": str(report_path),
        }


def demo_mission() -> Mission:
    return Mission(
        name="hyperliquid-agent-loop",
        goal="Design a prompt for an autonomous trading research agent that studies Hyperliquid market structure and proposes low-risk experiments.",
        constraints=[
            "No live trading or fund movement.",
            "Must include explicit risk controls and paper-trading only.",
            "Should produce logs, hypotheses, and measurable exit conditions.",
            "Keep prompts reusable across different specialist agents.",
        ],
        success_criteria=[
            "Prompt asks for structured output.",
            "Prompt forces risk review before recommendations.",
            "Prompt includes validation steps and failure modes.",
            "Prompt is specific enough to reduce vague agent behaviour.",
        ],
        deliverables=[
            "research brief",
            "experiment plan",
            "risk checklist",
            "next action",
        ],
        domain_terms=[
            "hyperliquid",
            "paper-trading",
            "risk limits",
            "market structure",
            "position sizing",
            "latency",
            "slippage",
            "exit conditions",
        ],
    )


def run_demo(rounds: int = 3) -> Dict[str, object]:
    engine = FractalPromptFoundry(demo_mission())
    return engine.run(rounds=rounds)


def run_mission(
    mission: Mission,
    rounds: int = 3,
    population_size: int = 5,
    output_dir: str | Path | None = None,
) -> tuple[FractalPromptFoundry, Dict[str, object], Dict[str, str]]:
    engine = FractalPromptFoundry(mission, population_size=population_size)
    result = engine.run(rounds=rounds)
    artifacts: Dict[str, str] = {}
    if output_dir is not None:
        artifacts = engine.save_run_artifacts(output_dir, result)
    return engine, result, artifacts


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="fractal-foundry",
        description="Evolve prompt candidates into a strongest prompt DNA artifact.",
    )
    parser.add_argument("--mission-file", type=Path, help="Path to a JSON mission definition.")
    parser.add_argument("--rounds", type=int, default=4, help="Number of evolution rounds to run.")
    parser.add_argument("--population-size", type=int, default=5, help="Number of candidates per round.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("artifacts") / "demo-run",
        help="Directory where result.json and report.md will be written.",
    )
    parser.add_argument(
        "--print-report",
        action="store_true",
        help="Print the markdown report instead of the JSON result.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    try:
        mission = Mission.from_json_file(args.mission_file) if args.mission_file else demo_mission()
        _, result, artifacts = run_mission(
            mission,
            rounds=args.rounds,
            population_size=args.population_size,
            output_dir=args.output_dir,
        )
    except ValueError as exc:
        parser.exit(2, f"error: {exc}\n")

    if args.print_report:
        print(result["report_markdown"])
    else:
        print(json.dumps(result, indent=2))

    if artifacts:
        print("\nArtifacts:", file=None)
        for name, path in artifacts.items():
            print(f"- {name}: {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
