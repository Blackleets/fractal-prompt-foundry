import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import benchmark
from fractal_prompt_foundry import FractalPromptFoundry, Mission, demo_mission, run_mission


class FoundryTests(unittest.TestCase):
    def test_demo_runs_and_returns_best_candidate(self):
        engine = FractalPromptFoundry(demo_mission())
        result = engine.run(rounds=3)
        self.assertIn("best_candidate", result)
        self.assertIn("best_evaluation", result)
        self.assertIn("evolved_candidate", result)
        self.assertIn("evolved_evaluation", result)
        self.assertIn("genome_profile", result)
        self.assertIn("evolved_genome_profile", result)
        self.assertIn("evolution_summary", result)
        self.assertIn("lineage_mermaid", result)
        self.assertGreater(result["best_evaluation"]["total_score"], 0.5)
        self.assertTrue(result["leaderboard"])

    def test_best_prompt_mentions_goal_and_constraints(self):
        engine = FractalPromptFoundry(demo_mission())
        result = engine.run(rounds=2)
        prompt = result["evolved_candidate"]["prompt"].lower()
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
            self.assertIn("## Best evolved candidate", result["report_markdown"])
            self.assertIn("baseline_diff", result)
            self.assertIn("### Added prompt lines", result["report_markdown"])
            self.assertTrue(Path(artifacts["result_json"]).exists())
            self.assertTrue(Path(artifacts["report_markdown"]).exists())

    def test_baseline_diff_captures_metric_delta_and_added_lines(self):
        engine = FractalPromptFoundry(demo_mission())
        result = engine.run(rounds=3)
        diff = result["baseline_diff"]
        self.assertIn("score_delta", diff)
        self.assertIn("metric_delta", diff)
        self.assertTrue(diff["added_lines"])
        self.assertGreater(diff["score_delta"], 0)

    def test_benchmark_summary_covers_multiple_missions(self):
        records = [
            benchmark.mission_record(Path("examples") / "hyperliquid-mission.json"),
            benchmark.mission_record(Path("examples") / "support-triage-mission.json"),
            benchmark.mission_record(Path("examples") / "code-review-mission.json"),
        ]
        summary = benchmark.benchmark_summary(records)
        markdown = benchmark.render_markdown(records, summary)
        self.assertEqual(summary["mission_count"], 3)
        self.assertGreater(summary["average_delta_vs_seed"], 0)
        self.assertIn("## Mission results", markdown)
        self.assertIn("support-triage-agent", markdown)

    def test_evolution_outperforms_seed_on_demo_mission(self):
        engine = FractalPromptFoundry(demo_mission())
        result = engine.run(rounds=3)
        self.assertTrue(result["evolution_summary"]["evolution_outperformed_seed"])
        self.assertGreater(result["evolved_evaluation"]["total_score"], result["best_evaluation"]["total_score"] - 0.2)

    def test_seed_scores_are_order_independent_within_round_zero(self):
        mission = demo_mission()
        engine = FractalPromptFoundry(mission)
        population = engine.seed_population()
        forward_scores = {
            candidate.candidate_id: engine.evaluate_candidate(candidate, 0, prior_prompts=[]).total_score
            for candidate in population
        }
        reverse_scores = {
            candidate.candidate_id: engine.evaluate_candidate(candidate, 0, prior_prompts=[]).total_score
            for candidate in reversed(population)
        }
        self.assertEqual(forward_scores, reverse_scores)

    def test_mission_rejects_string_constraints(self):
        with self.assertRaises(ValueError):
            Mission.from_dict(
                {
                    "name": "broken-mission",
                    "goal": "Design a prompt.",
                    "constraints": "No live trading.",
                    "success_criteria": ["Structured output."],
                    "deliverables": ["plan"],
                }
            )

    def test_mission_rejects_string_success_criteria(self):
        with self.assertRaises(ValueError):
            Mission.from_dict(
                {
                    "name": "broken-mission",
                    "goal": "Design a prompt.",
                    "constraints": ["No live trading."],
                    "success_criteria": "Structured output.",
                    "deliverables": ["plan"],
                }
            )

    def test_mission_rejects_string_deliverables(self):
        with self.assertRaises(ValueError):
            Mission.from_dict(
                {
                    "name": "broken-mission",
                    "goal": "Design a prompt.",
                    "constraints": ["No live trading."],
                    "success_criteria": ["Structured output."],
                    "deliverables": "plan",
                }
            )

    def test_mission_rejects_string_domain_terms(self):
        with self.assertRaises(ValueError):
            Mission.from_dict(
                {
                    "name": "broken-mission",
                    "goal": "Design a prompt.",
                    "constraints": ["No live trading."],
                    "success_criteria": ["Structured output."],
                    "deliverables": ["plan"],
                    "domain_terms": "triage",
                }
            )

    def test_cli_writes_artifacts_for_valid_mission_file(self):
        repo_root = Path(__file__).resolve().parent
        mission_file = repo_root / "examples" / "hyperliquid-mission.json"
        with tempfile.TemporaryDirectory() as tmpdir:
            output_dir = Path(tmpdir) / "cli-artifacts"
            proc = subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "fractal_prompt_foundry",
                    "--mission-file",
                    str(mission_file),
                    "--rounds",
                    "2",
                    "--output-dir",
                    str(output_dir),
                ],
                cwd=repo_root,
                capture_output=True,
                text=True,
                check=True,
            )
            payload = json.loads(proc.stdout.split("\nArtifacts:\n", 1)[0])
            self.assertEqual(payload["mission"], "hyperliquid-agent-loop")
            self.assertTrue((output_dir / "result.json").exists())
            self.assertTrue((output_dir / "report.md").exists())

    def test_run_rejects_non_positive_rounds(self):
        with self.assertRaises(ValueError):
            FractalPromptFoundry(demo_mission()).run(rounds=0)

    def test_constructor_rejects_non_positive_population_size(self):
        with self.assertRaises(ValueError):
            FractalPromptFoundry(demo_mission(), population_size=0)

    def test_cli_rejects_non_positive_rounds_without_traceback_noise(self):
        repo_root = Path(__file__).resolve().parent
        proc = subprocess.run(
            [sys.executable, "-m", "fractal_prompt_foundry", "--rounds", "0"],
            cwd=repo_root,
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("rounds must be a positive integer", proc.stderr)
        self.assertNotIn("Traceback", proc.stderr)

    def test_cli_rejects_non_positive_population_size_without_traceback_noise(self):
        repo_root = Path(__file__).resolve().parent
        proc = subprocess.run(
            [sys.executable, "-m", "fractal_prompt_foundry", "--population-size", "0"],
            cwd=repo_root,
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("population_size must be a positive integer", proc.stderr)
        self.assertNotIn("Traceback", proc.stderr)

    def test_cli_rejects_missing_mission_file_without_traceback_noise(self):
        repo_root = Path(__file__).resolve().parent
        proc = subprocess.run(
            [sys.executable, "-m", "fractal_prompt_foundry", "--mission-file", "examples/does-not-exist.json"],
            cwd=repo_root,
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("mission file not found", proc.stderr.lower())
        self.assertNotIn("Traceback", proc.stderr)

    def test_cli_rejects_invalid_json_mission_file_without_traceback_noise(self):
        repo_root = Path(__file__).resolve().parent
        with tempfile.TemporaryDirectory() as tmpdir:
            bad_file = Path(tmpdir) / "bad-mission.json"
            bad_file.write_text('{"name": "broken",', encoding="utf-8")
            proc = subprocess.run(
                [sys.executable, "-m", "fractal_prompt_foundry", "--mission-file", str(bad_file)],
                cwd=repo_root,
                capture_output=True,
                text=True,
            )
        self.assertNotEqual(proc.returncode, 0)
        self.assertIn("invalid json", proc.stderr.lower())
        self.assertNotIn("Traceback", proc.stderr)


if __name__ == "__main__":
    unittest.main()
