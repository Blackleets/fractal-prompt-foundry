from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Dict, Tuple
import hashlib
import itertools
import json
import math
import re


@dataclass
class Mission:
    name: str
    goal: str
    constraints: List[str]
    success_criteria: List[str]
    deliverables: List[str]
    domain_terms: List[str] = field(default_factory=list)


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
        self.mission = mission
        self.population_size = population_size
        self.history: List[Tuple[Candidate, Evaluation]] = []

    def run(self, rounds: int = 3) -> Dict[str, object]:
        population = self.seed_population()

        for round_index in range(rounds):
            scored: List[Tuple[Candidate, Evaluation]] = []
            for candidate in population:
                evaluation = self.evaluate_candidate(candidate, round_index)
                scored.append((candidate, evaluation))
                self.history.append((candidate, evaluation))

            scored.sort(key=lambda item: item[1].total_score, reverse=True)
            elite = [item[0] for item in scored[:2]]
            population = self.spawn_next_population(elite, scored, round_index + 1)

        best_candidate, best_evaluation = max(self.history, key=lambda item: item[1].total_score)
        return {
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
            "leaderboard": [
                {
                    "candidate_id": candidate.candidate_id,
                    "style": candidate.style,
                    "score": round(evaluation.total_score, 3),
                    "round": candidate.round_index,
                }
                for candidate, evaluation in sorted(self.history, key=lambda item: item[1].total_score, reverse=True)[:10]
            ],
        }

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

    def evaluate_candidate(self, candidate: Candidate, round_index: int) -> Evaluation:
        text = candidate.prompt.lower()
        target_terms = self.target_terms()

        present = [term for term in target_terms if term.lower() in text]
        missing = [term for term in target_terms if term.lower() not in text]

        coverage = len(present) / max(1, len(target_terms))
        structure = self.structure_score(candidate.prompt)
        actionability = self.actionability_score(candidate.prompt)
        novelty = self.novelty_score(candidate.prompt)
        anti_vague = self.anti_vagueness_score(candidate.prompt)

        total = (
            coverage * 0.34
            + structure * 0.22
            + actionability * 0.22
            + novelty * 0.12
            + anti_vague * 0.10
        )

        critique = []
        if missing:
            critique.append(f"Missing domain pressure: {', '.join(missing[:6])}")
        if structure < 0.75:
            critique.append("Needs clearer output sections or stronger formatting constraints.")
        if actionability < 0.75:
            critique.append("Needs more explicit validation, next steps, or execution framing.")
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
        merged_style = f"{cand_a.style}+{cand_b.style}"
        lane_summary = (
            f"Merge the strengths of {cand_a.style} and {cand_b.style}. "
            f"Preserve operational clarity, but also inject critique and edge-case pressure."
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
        terms = []
        terms.extend(self.mission.domain_terms)
        terms.extend(self.extract_keywords(self.mission.goal))
        for item in self.mission.constraints + self.mission.success_criteria + self.mission.deliverables:
            terms.extend(self.extract_keywords(item))
        deduped = []
        for term in terms:
            t = term.strip().lower()
            if len(t) < 4:
                continue
            if t not in deduped:
                deduped.append(t)
        return deduped[:24]

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

    def novelty_score(self, prompt: str) -> float:
        if not self.history:
            return 1.0
        similarities = [self.similarity(prompt, prev_candidate.prompt) for prev_candidate, _ in self.history]
        return max(0.0, 1.0 - max(similarities))

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


if __name__ == "__main__":
    result = run_demo(rounds=3)
    print(json.dumps(result, indent=2))
