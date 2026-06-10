# Contributing to Fractal Prompt Foundry

Thanks for checking out **Fractal Prompt Foundry**.

This project is still an early prototype, so the most valuable contributions are the ones that make the idea more testable, more inspectable, and easier to compare.

## Best kinds of contributions

- new mission examples
- improvements to scoring or novelty logic
- lineage / artifact visualizations
- benchmark scenarios for coding, research, or trading-agent workflows
- packaging and CLI polish
- test coverage for evolution behavior

## Quick local workflow

```bash
git clone https://github.com/Blackleets/fractal-prompt-foundry.git
cd fractal-prompt-foundry
python test_foundry.py
python demo.py
```

## If you want to add a new mission

1. Create a JSON file under `examples/`.
2. Keep constraints explicit and concrete.
3. Add realistic success criteria and deliverables.
4. Include domain terms only when they help evaluation quality.
5. Verify it runs through:

```bash
python -m fractal_prompt_foundry --mission-file examples/your-mission.json --rounds 4 --print-report
```

## If you want to change engine behavior

Please try to keep these properties intact:

- deterministic local execution for the current prototype
- inspectable artifacts (`result.json`, `report.md`, lineage output)
- novelty protection against near-duplicate prompts
- clear pressure scoring dimensions

## Pull request guidance

Good PRs usually include:

- a short explanation of what changed
- why it matters to prompt evolution quality
- before/after behavior when relevant
- updated tests if scoring, mutation, or artifact structure changed

## Roadmap-aligned ideas

High-leverage areas:

- prompt diff visualizations
- benchmark mission packs
- mission schema validation
- real model-backed evaluators
- SVG lineage export
- dashboard / UI exploration

If you are unsure what to build first, start with something that improves **artifact clarity** or **comparability across runs**.
