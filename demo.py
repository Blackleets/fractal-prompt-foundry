from __future__ import annotations

import json
from pathlib import Path
from fractal_prompt_foundry import FractalPromptFoundry, demo_mission


def main() -> None:
    engine = FractalPromptFoundry(demo_mission())
    result = engine.run(rounds=4)
    artifacts = engine.save_run_artifacts(Path("artifacts") / "demo-run", result)

    print("=== FRACTAL PROMPT FOUNDRY DEMO ===")
    print(f"Mission: {result['mission']}")
    print()
    print("Best candidate:")
    print(f"- ID: {result['best_candidate']['candidate_id']}")
    print(f"- Style: {result['best_candidate']['style']}")
    print(f"- Score: {result['best_evaluation']['total_score']}")
    print(f"- Genome ID: {result['genome_profile']['genome_id']}")
    print()
    print("Prompt preview:")
    print(result['best_candidate']['prompt'][:1200])
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
