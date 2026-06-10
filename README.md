<div align="center">
  <img src="assets/hero.svg" alt="Fractal Prompt Foundry hero banner" width="100%" />

  # Fractal Prompt Foundry

  **Breed better instructions before they ever hit your agents.**

  *A prompt-evolution engine that seeds prompt lanes, scores pressure, hybridizes winners, mutates weak spots, and keeps the strongest prompt DNA.*

  <p>
    <a href="#demo">
      <img src="https://img.shields.io/badge/View-Demo-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white" alt="View Demo" />
    </a>
    <a href="#quickstart">
      <img src="https://img.shields.io/badge/Get-Started-0F172A?style=for-the-badge&logo=python&logoColor=white" alt="Get Started" />
    </a>
    <a href="#why-it-stands-out">
      <img src="https://img.shields.io/badge/Why-It's_Different-06B6D4?style=for-the-badge&logo=sparkles&logoColor=white" alt="Why it's different" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/python-3.11%2B-2563EB?style=flat-square" alt="Python 3.11+" />
    <img src="https://img.shields.io/badge/status-prototype-F59E0B?style=flat-square" alt="Status prototype" />
    <img src="https://img.shields.io/badge/license-MIT-10B981?style=flat-square" alt="MIT license" />
    <img src="https://img.shields.io/badge/agents-multi--agent-7C3AED?style=flat-square" alt="Multi-agent" />
    <img src="https://img.shields.io/badge/focus-prompt%20evolution-0891B2?style=flat-square" alt="Prompt evolution" />
  </p>
</div>

---

## Why this exists

Most agent systems stop at one of these patterns:

- planner → worker
- critic → retry
- static prompt template → run

**Fractal Prompt Foundry** explores a more interesting idea:

> what if prompts behaved like evolving organisms instead of fixed instructions?

Instead of retrying one weak prompt over and over, this project:

- creates a **population** of prompt candidates
- splits them into **specialist lanes**
- evaluates them with **pressure scoring**
- **hybridizes** strong candidates together
- **mutates** missing concepts and weak areas
- blocks copycats with a **novelty gate**
- returns the strongest prompt DNA before your real agents execute anything

---

## Why it stands out

### Prompt DNA
Prompts are treated like composable structures, not raw strings.

### Mutation lanes
Different lanes push different prompt personalities:
- architect
- operator
- critic
- compressor
- strategist

### Hybridization
Top candidates can merge into stronger prompt lineages instead of relying on single-path retries.

### Novelty gate
Near-duplicate prompts get rejected so the loop stays exploratory instead of collapsing into sameness.

### Pressure score
Each candidate is scored on:
- coverage
- structure
- actionability
- novelty
- anti-vagueness

---

## Core loop

```text
Mission
  ↓
Seed population of prompt lanes
  ↓
Evaluate candidate pressure
  ↓
Keep elites
  ↓
Hybridize top performers
  ↓
Mutate missing concepts
  ↓
Novelty gate rejects near-duplicates
  ↓
Repeat for N rounds
  ↓
Return strongest prompt DNA
```

---

## Demo

The included demo evolves prompts for a **Hyperliquid research-agent mission** with explicit constraints like:

- no live trading
- no fund movement
- paper-trading only
- explicit risk controls
- measurable exit conditions
- reusable outputs across specialist agents

### Real output observed
The prototype was executed successfully and produced this real result:

- **Mission:** `hyperliquid-agent-loop`
- **Best candidate:** `seed-1`
- **Best style:** `architect`
- **Best score:** `0.995`

Top leaderboard snapshot:

- `seed-1` — `architect` — `0.995`
- `r1-hyb-1` — `architect+critic` — `0.907`
- `seed-3` — `critic` — `0.890`
- `seed-2` — `operator` — `0.889`
- `seed-4` — `compressor` — `0.888`

Metric snapshot:

```json
{
  "coverage": 1.0,
  "structure": 1.0,
  "actionability": 1.0,
  "novelty": 1.0,
  "anti_vague": 0.95
}
```

---

## Quickstart

### Run the demo

```bash
python demo.py
```

### Run tests

```bash
python test_foundry.py
```

---

## Project structure

```text
fractal-prompt-foundry/
├── assets/
│   ├── hero.svg
│   └── social-preview.svg
├── fractal_prompt_foundry.py
├── demo.py
├── test_foundry.py
└── README.md
```

---

## What is already working

- seed prompt populations
- specialist prompt lanes
- deterministic pressure scoring
- hybrid prompt lineage generation
- mutation rounds
- novelty gating
- leaderboard output
- runnable demo
- basic tests

---

## What comes next

### Near-term upgrades
- swap the deterministic evaluator for real agent calls
- save lineage and generation history to disk
- diff prompt generations visually
- add JSON schema validation for missions and evaluations
- expose the engine as a CLI package

### Bigger upgrades
- Hermes integration with `delegate_task`
- local LLM / OpenAI / Anthropic / OpenRouter backends
- prompt tournaments between multiple agent families
- web dashboard for evolution history
- hosted API / SaaS version

---

## Good future use cases

This concept fits especially well for:

- coding agents
- research agents
- trading research loops
- agentic evaluation systems
- team-wide prompt optimization
- orchestration layers above existing LLM tools

---

## Example future integration

```text
Goal Parser
  → Prompt Composer
  → Specialist Agent
  → Critic Agent
  → Fractal Prompt Foundry mutation round
  → Specialist Agent retry
```

---

## Positioning

**Fractal Prompt Foundry** is not just another retry loop.

It is a **prompt-breeding engine** for systems that want stronger instructions *before* expensive agent execution begins.

---

## Social preview

If you want to use a social image for GitHub/Open Graph previews, use:

- `assets/social-preview.svg`

---

## License

MIT
