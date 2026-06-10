from __future__ import annotations

import json
from fractal_prompt_foundry import run_demo


def main() -> None:
    result = run_demo(rounds=4)

    print("=== FRACTAL PROMPT FOUNDRY DEMO ===")
    print(f"Mission: {result['mission']}")
    print()
    print("Best candidate:")
    print(f"- ID: {result['best_candidate']['candidate_id']}")
    print(f"- Style: {result['best_candidate']['style']}")
    print(f"- Score: {result['best_evaluation']['total_score']}")
    print()
    print("Prompt preview:")
    print(result['best_candidate']['prompt'][:1200])
    print()
    print("Critique:")
    for item in result['best_evaluation']['critique']:
        print(f"- {item}")
    print()
    print("Top leaderboard:")
    for item in result['leaderboard'][:5]:
        print(f"- {item['candidate_id']} | style={item['style']} | round={item['round']} | score={item['score']}")
    print()
    print("JSON snapshot:")
    print(json.dumps(result['best_evaluation']['metrics'], indent=2))


if __name__ == "__main__":
    main()
