# Fractal Prompt Foundry

Fractal Prompt Foundry turns a rough idea, task, workflow, or prompt into a stronger reusable prompt through visible evolution rounds.

The app is built for fast operator workflows: paste a messy request, let the foundry generate and score candidate prompts, inspect the winning prompt, then export it for ChatGPT, Claude, Gemini, automation agents, SOPs, research workflows, launch plans, and internal AI systems.

## What It Does

- Infers a working profile from the input: founder, marketer, analyst, operator, or researcher.
- Converts a rough idea into a structured mission.
- Evolves candidate prompts across multiple rounds with elite carry-over, mutation, hybridization, critique, and scoring.
- Shows the full evolution trail: round winners, candidates, score lift, genome profile, lineage graph, constellation map, and export artifacts.
- Runs fully local by default with a deterministic heuristic engine.
- Can optionally use OpenAI, Anthropic, OpenRouter, or Ollama from the settings panel for LLM-assisted generation and evaluation.

## Current Product Boundary

This is a local-first prompt foundry, not a hosted SaaS.

- No backend.
- No user accounts.
- No billing.
- No shared workspaces.
- No server-side secret storage.
- Browser `localStorage` is used for preferences and recent runs.

API keys entered in the settings panel are stored locally in the browser. That is acceptable for personal/local use, but a production hosted version should move provider calls behind a backend before being shared with users.

## Core Flow

1. Paste a rough idea in Quick mode.
2. The app detects language and infers the closest user profile.
3. A mission is built from the idea and profile template.
4. `FractalPromptFoundry` generates candidate prompts.
5. Each round scores candidates on coverage, structure, actionability, novelty, and anti-vagueness.
6. The best prompt is shown with before/after comparison, genome signals, report, and export tools.
7. You can run another loop to add new refinement pressure and push the champion further.

## Modes

### Local Heuristic Mode

Default mode. Requires no API key.

The app composes prompts from mission structure, profile lanes, domain terms, missing terms, and refinement pressure. This is fast and free, but the improvement score is based on the app's internal rubric.

### LLM-Assisted Mode

Configured from the settings panel.

When a provider is selected, the engine asks the model to generate stronger candidate prompts and then evaluates each candidate through the selected provider. This makes the evolution more meaningful than local scoring alone, while keeping the local engine available as the free fallback.

## Important Files

- `src/App.tsx` - app shell, state orchestration, quick mode, history, loop chain.
- `src/lib/foundry-lite.ts` - prompt evolution engine.
- `src/lib/model-evaluator.ts` - LLM generation and scoring helpers.
- `src/lib/content.ts` - presets, mission templates, UI copy, language handling.
- `src/lib/types.ts` - shared result, mission, candidate, and scoring types.
- `src/sections/EvolutionRounds.tsx` - visible evolution timeline.
- `src/sections/GenomeProfile.tsx` - champion prompt, report, and genome output.
- `src/sections/PromptDecompiler.tsx` - prompt-to-mission extraction.
- `src/sections/ExportBar.tsx` - export and platform handoff tools.

## Run Locally

```bash
npm install
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

## Quality Commands

```bash
npm run lint
npm run test
npm run build
```

## Product Direction

The strongest near-term version is not a generic "prompt optimizer for everyone." The strongest version is a local-first foundry for high-ROI operators:

- Founder mode: idea to MVP prompt, launch plan, pricing test, distribution loop.
- Marketer mode: offer to angles, ads, landing copy, email sequence.
- Operator mode: workflow to SOP, QA checklist, escalation rules.
- Analyst mode: decision brief, options matrix, assumptions, risks.
- Researcher mode: research plan, evidence checks, synthesis prompt.

Keep the first screen focused on the actual workflow: paste idea, evolve, copy/export.

## Production Hardening Later

Before turning this into a hosted product:

- Move provider API calls server-side.
- Store runs in a real database.
- Add workspaces/projects.
- Add import/export bundles.
- Add usage analytics for which generated prompts users actually keep.
- Add model-output regression tests for representative prompts.
- Add secure secret handling and rate limits.

