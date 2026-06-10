import tempfile
import unittest
from pathlib import Path

from fractal_prompt_foundry import FractalPromptFoundry, Mission, demo_mission, run_mission


class FoundryTests(unittest.TestCase):
    def test_demo_runs_and_returns_best_candidate(self):
        engine = FractalPromptFoundry(demo_mission())
        result = engine.run(rounds=3)
        self.assertIn("best_candidate", result)
        self.assertIn("best_evaluation", result)
        self.assertIn("genome_profile", result)
        self.assertIn("lineage_mermaid", result)
        self.assertGreater(result["best_evaluation"]["total_score"], 0.5)
        self.assertTrue(result["leaderboard"])

    def test_best_prompt_mentions_goal_and_constraints(self):
        engine = FractalPromptFoundry(demo_mission())
        result = engine.run(rounds=2)
        prompt = result["best_candidate"]["prompt"].lower()
        self.assertIn("primary goal", prompt)
        self.assertIn("constraints", prompt)
        self.assertIn("hyperliquid", prompt)

    def test_artifacts_are_written(self):
        engine = FractalPromptFoundry(demo_mission())
        result = engine.run(rounds=2)
        with tempfile.TemporaryDirectory() as tmpdir:
            artifacts = engine.save_run_artifacts(tmpdir, result)
            self.assertTrue(Path(artifacts["result_json"]).exists())
            self.assertTrue(Path(artifacts["report_markdown"]).exists())

    def test_mission_can_be_loaded_from_dict(self):
        mission = Mission.from_dict(
            {
                "name": "support-agent-loop",
                "goal": "Design a support automation prompt.",
                "constraints": ["No external API calls."],
                "success_criteria": ["Structured output."],
                "deliverables": ["plan", "risks"],
                "domain_terms": ["tickets", "triage"],
            }
        )
        self.assertEqual(mission.name, "support-agent-loop")
        self.assertIn("tickets", mission.domain_terms)

    def test_run_mission_writes_artifacts(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            _, result, artifacts = run_mission(
                demo_mission(),
                rounds=2,
                population_size=4,
                output_dir=Path(tmpdir),
            )
            self.assertIn("report_markdown", result)
            self.assertTrue(Path(artifacts["result_json"]).exists())
            self.assertTrue(Path(artifacts["report_markdown"]).exists())


if __name__ == "__main__":
    unittest.main()
