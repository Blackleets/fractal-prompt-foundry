import unittest

from fractal_prompt_foundry import FractalPromptFoundry, demo_mission


class FoundryTests(unittest.TestCase):
    def test_demo_runs_and_returns_best_candidate(self):
        engine = FractalPromptFoundry(demo_mission())
        result = engine.run(rounds=3)
        self.assertIn("best_candidate", result)
        self.assertIn("best_evaluation", result)
        self.assertGreater(result["best_evaluation"]["total_score"], 0.5)
        self.assertTrue(result["leaderboard"])

    def test_best_prompt_mentions_goal_and_constraints(self):
        engine = FractalPromptFoundry(demo_mission())
        result = engine.run(rounds=2)
        prompt = result["best_candidate"]["prompt"].lower()
        self.assertIn("primary goal", prompt)
        self.assertIn("constraints", prompt)
        self.assertIn("hyperliquid", prompt)


if __name__ == "__main__":
    unittest.main()
