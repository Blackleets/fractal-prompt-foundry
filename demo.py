from __future__ import annotations

import json
from pathlib import Path
from fractal_prompt_foundry import demo_mission, run_mission


def main() -> None:
    _, result, artifacts = run_mission(
        demo_mission(),
        rounds=4,
        population_size=5,
        output_dir=Path("artifacts") / "demo-run",
    )

    print("=== FRACTAL PROMPT FOUNDRY DEMO ===")
    print(f"Mission: {result['mission']}")
    print()
    print("Global best candidate:")
    print(f"- ID: {result['best_candidate']['candidate_id']}")
    print(f"- Style: {result['best_candidate']['style']}")
    print(f"- Score: {result['best_evaluation']['total_score']}")
    print(f"- Genome ID: {result['genome_profile']['genome_id']}")
    print()
    print("Best evolved candidate:")
    print(f"- ID: {result['evolved_candidate']['candidate_id']}")
    print(f"- Style: {result['evolved_candidate']['style']}")
    print(f"- Score: {result['evolved_evaluation']['total_score']}")
    print(f"- Genome ID: {result['evolved_genome_profile']['genome_id']}")
    print()
    print("Evolution verdict:")
    print(f"- Final round: {result['evolution_summary']['final_round']}")
    print(f"- Delta vs seed: {result['evolution_summary']['score_delta_vs_seed']}")
    print(f"- Delta vs global best: {result['evolution_summary']['score_delta_vs_global_best']}")
    print(f"- Evolution outperformed seed: {result['evolution_summary']['evolution_outperformed_seed']}")
    print()
    print("Baseline vs evolved diff:")
    print(f"- Seed baseline: {result['baseline_diff']['seed_candidate_id']} ({result['baseline_diff']['seed_style']})")
    print(f"- Evolved champion: {result['baseline_diff']['evolved_candidate_id']} ({result['baseline_diff']['evolved_style']})")
    print("- Metric deltas:")
    for metric, delta in result['baseline_diff']['metric_delta'].items():
        print(f"  - {metric}: {delta:+.3f}")
    print("- Added lines:")
    for line in result['baseline_diff']['added_lines'][:5]:
        print(f"  - {line}")
    print()
    print("Prompt preview:")
    print(result['evolved_candidate']['prompt'][:1200])
    print()
    print("Why this run feels unique:")
    for item in result['uniqueness_thesis']:
        print(f"- {item}")
    print()
    print("Round winners:")
    for item in result['round_summaries']:
        print(f"- round={item['round']} winner={item['winner_id']} style={item['winner_style']} score={item['winner_score']}")
    print()
    print("Top leaderboard:")
    for item in result['leaderboard'][:5]:
        print(f"- {item['candidate_id']} | style={item['style']} | round={item['round']} | score={item['score']}")
    print()
    print("Genome snapshot:")
    print(json.dumps(result['genome_profile'], indent=2))
    print()
    print("Artifacts:")
    for name, path in artifacts.items():
        print(f"- {name}: {path}")


if __name__ == "__main__":
    main()
