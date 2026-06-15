# Fractal Prompt Foundry agent rules

This repo is a small prototype, not a framework playground.

## Goal

Keep Fractal Prompt Foundry:

- deterministic
- local-first
- dependency-light
- easy to run with `python demo.py` and `python test_foundry.py`
- easy to inspect from generated artifacts

## Build philosophy

Before changing code, stop at the first option that works:

1. Can the current single-file design handle it? Keep it there.
2. Can Python stdlib handle it? Use stdlib.
3. Can a small pure function or dataclass solve it? Do that.
4. Only then add new structure.

Prefer deletion over indirection. Prefer one obvious path over configurable abstractions.

## Hard constraints

- Do not add external dependencies unless they remove clear, repeated pain.
- Do not split `fractal_prompt_foundry.py` into multiple modules without a real maintenance reason.
- Do not add async, services, databases, queues, or web layers unless explicitly requested.
- Do not turn deterministic scoring into network-dependent logic by default.
- Keep the demo runnable offline.

## When adding features

Preserve these contracts unless the task explicitly changes them:

- `python demo.py` runs locally
- `python test_foundry.py` passes
- `python -m fractal_prompt_foundry ...` works as documented
- artifacts still include `result.json` and `report.md`
- prompts remain structured, inspectable, and easy to diff

## Style rules

- Prefer small pure helpers over class hierarchies.
- Prefer explicit fields over magic dictionaries when structure is stable.
- Prefer readable scoring logic over clever compactness.
- If a shortcut has a ceiling, mark it with a `factral:` comment naming the upgrade path.
- Keep README claims aligned with actual commands and outputs.

## For Claude Code and Codex

When asked to improve this repo:

- first look for over-engineering, unnecessary layers, or avoidable dependencies
- keep diffs small
- verify with real commands
- explain what was simplified, not just what was added

The best improvement is usually the smallest one that makes the prototype clearer, easier to run, or easier to extend.