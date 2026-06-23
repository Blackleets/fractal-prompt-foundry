from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Dict, List

from fractal_prompt_foundry import Mission, run_mission


EXAMPLES_DIR = Path(__file__).resolve().parent / "examples"
DEFAULT_MISSIONS = [
    EXAMPLES_DIR / "hyperliquid-mission.json",
    EXAMPLES_DIR / "support-triage-mission.json",
    EXAMPLES_DIR / "code-review-mission.json",
]


def mission_record(path: Path, rounds: int = 4, population_size: int = 5) -> Dict[str, object]:
    mission = Mission.from_json_file(path)
    output_dir = Path("artifacts") / "benchmarks" / mission.name
    _, result, artifacts = run_mission(
        mission,
        rounds=rounds,
        population_size=population_size,
        output_dir=output_dir,
    )
    winner_style_tokens = result["evolved_candidate"]["style"].split("+")
    return {
        "mission": mission.name,
        "goal": mission.goal,
        "winner_id": result["evolved_candidate"]["candidate_id"],
        "winner_style": result["evolved_candidate"]["style"],
        "winner_score": result["evolved_evaluation"]["total_score"],
        "seed_score": result["evolution_summary"]["seed_best_score"],
        "delta_vs_seed": result["evolution_summary"]["score_delta_vs_seed"],
        "outperformed_seed": result["evolution_summary"]["evolution_outperformed_seed"],
        "top_lane_tokens": winner_style_tokens,
        "baseline_diff": result["baseline_diff"],
        "artifacts": artifacts,
        "round_winners": result["round_summaries"],
    }


def benchmark_summary(records: List[Dict[str, object]]) -> Dict[str, object]:
    lane_counter = Counter()
    primary_lane_counter = Counter()
    for record in records:
        tokens = record["top_lane_tokens"]
        lane_counter.update(tokens)
        if tokens:
            primary_lane_counter.update([tokens[0]])

    avg_delta = round(sum(record["delta_vs_seed"] for record in records) / max(1, len(records)), 3)
    avg_score = round(sum(record["winner_score"] for record in records) / max(1, len(records)), 3)
    beat_seed_rate = round(sum(1 for record in records if record["outperformed_seed"]) / max(1, len(records)), 3)
    return {
        "mission_count": len(records),
        "average_winner_score": avg_score,
        "average_delta_vs_seed": avg_delta,
        "beat_seed_rate": beat_seed_rate,
        "lane_frequency": dict(lane_counter.most_common()),
        "primary_lane_frequency": dict(primary_lane_counter.most_common()),
    }


def render_markdown(records: List[Dict[str, object]], summary: Dict[str, object]) -> str:
    lines = [
        "# Fractal Prompt Foundry Benchmark Suite",
        "",
        "## Portfolio summary",
        f"- Missions: `{summary['mission_count']}`",
        f"- Average evolved winner score: `{summary['average_winner_score']}`",
        f"- Average delta vs seed: `{summary['average_delta_vs_seed']}`",
        f"- Evolution beat seed rate: `{summary['beat_seed_rate']}`",
        "",
        "## Lane frequency across winners",
        *[f"- {lane}: `{count}`" for lane, count in summary["lane_frequency"].items()],
        "",
        "## Mission results",
        "| Mission | Winner style | Winner score | Delta vs seed | Beat seed? |",
        "|---|---|---:|---:|---|",
        *[
            f"| {record['mission']} | `{record['winner_style']}` | {record['winner_score']} | {record['delta_vs_seed']} | {record['outperformed_seed']} |"
            for record in records
        ],
        "",
    ]

    for record in records:
        diff = record["baseline_diff"]
        lines.extend([
            f"## {record['mission']}",
            f"- Goal: {record['goal']}",
            f"- Winner: `{record['winner_id']}` / `{record['winner_style']}` / `{record['winner_score']}`",
            f"- Seed baseline: `{diff['seed_candidate_id']}` / `{record['seed_score']}`",
            f"- Score delta: `{diff['score_delta']}`",
            "",
            "### Metric deltas",
            *[f"- {metric}: `{delta:+.3f}`" for metric, delta in diff['metric_delta'].items()],
            "",
            "### Added lines vs seed",
        ])
        lines.extend([f"- {line}" for line in diff['added_lines']] or ["- None"])
        lines.extend([
            "",
        ])
    return "\n".join(lines)


def main() -> None:
    records = [mission_record(path) for path in DEFAULT_MISSIONS]
    summary = benchmark_summary(records)
    payload = {
        "summary": summary,
        "missions": records,
    }
    output_dir = Path("artifacts") / "benchmarks"
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "summary.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    (output_dir / "summary.md").write_text(render_markdown(records, summary), encoding="utf-8")
    print(json.dumps(payload, indent=2))
    print("\nArtifacts:")
    print(f"- summary_json: {output_dir / 'summary.json'}")
    print(f"- summary_markdown: {output_dir / 'summary.md'}")


if __name__ == "__main__":
    main()
