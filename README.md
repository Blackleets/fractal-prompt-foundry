<div align="center">
  <img src="assets/hero.svg" alt="Fractal Prompt Foundry hero banner" width="100%" />

  # Fractal Prompt Foundry

  **Breed better instructions before they ever hit your agents.**

  *A prompt-evolution engine that seeds prompt lanes, scores pressure, hybridizes winners, mutates weak spots, and keeps the strongest prompt DNA.*

  <p>
    <a href="#30-second-try">
      <img src="https://img.shields.io/badge/Try-30_Seconds-8B5CF6?style=for-the-badge&logo=lightning&logoColor=white" alt="Try in 30 seconds" />
    </a>
    <a href="#quickstart">
      <img src="https://img.shields.io/badge/Get-Started-0F172A?style=for-the-badge&logo=python&logoColor=white" alt="Get Started" />
    </a>
    <a href="#why-people-would-actually-use-this">
      <img src="https://img.shields.io/badge/Why-People_Care-06B6D4?style=for-the-badge&logo=sparkles&logoColor=white" alt="Why people care" />
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

## What this is

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

## Why people would actually use this

This repo becomes interesting when you care about **instruction quality before expensive agent execution**.

### 1. It gives a system-level answer to weak prompts
Instead of manually editing one prompt, it explores a **small evolutionary search space**.

### 2. It produces inspectable artifacts, not hand-wavy claims
A run can emit:

- `result.json`
- `report.md`
- `lineage_mermaid`
- `genome_profile`
- `round_summaries`
- `uniqueness_thesis`

That makes the concept easier to test, share, and extend.

### 3. It is a useful prototype for bigger agent products
You can imagine this sitting before:

- coding agents
- research agents
- trading research loops
- evaluation pipelines
- orchestration layers
- prompt QA / benchmarking systems

### 4. It is easy to try
No API key, no hosted dependency, no external model call required for the current prototype.

---

## 30-second try

### Option A — run the demo

```bash
python demo.py
```

### Option B — use the built-in CLI entry

```bash
python -m fractal_prompt_foundry --rounds 4 --print-report
```

### Option C — run a custom mission JSON

```bash
python -m fractal_prompt_foundry \
  --mission-file examples/hyperliquid-mission.json \
  --rounds 4 \
  --output-dir artifacts/custom-run
```

Artifacts are written to:

- `artifacts/demo-run/result.json`
- `artifacts/demo-run/report.md`

---

## Architecture snapshot

<div align="center">
  <img src="assets/architecture.svg" alt="Fractal Prompt Foundry architecture snapshot" width="100%" />
</div>

---

## Why it stands out

### Prompt DNA
Prompts are treated like composable structures, not raw strings.

### Prompt genome profiling
Every winning prompt gets a **genome profile** with:

- genome ID
- prompt checksum
- lineage depth
- lane mix
- bullet density
- imperative density
- control density
- domain saturation
- pressure balance snapshot

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

### Product-level artifacts
Each run can emit:

- `result.json`
- `report.md`
- a Mermaid lineage graph of how the champion evolved
- round winners by generation
- a uniqueness thesis that explains why the run matters

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
- **Genome ID:** `6667f13ac0fb`

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

### Claude Code / Codex

This repo now ships an `AGENTS.md` at the root so Claude Code, Codex, and other agent-aware tools can inherit the intended development style automatically.

What it enforces:

- keep the prototype deterministic and local-first
- prefer stdlib and small diffs
- avoid premature modularization and unnecessary dependencies
- verify changes with `python demo.py` and `python test_foundry.py`

### Clone and run

```bash
git clone https://github.com/Blackleets/fractal-prompt-foundry.git
cd fractal-prompt-foundry
python demo.py
```

### Run tests

```bash
python test_foundry.py
```

### Use the packaged CLI locally

```bash
pip install -e .
fractal-foundry --mission-file examples/hyperliquid-mission.json --rounds 4 --print-report
```

---

## Example mission schema

```json
{
  "name": "mission-name",
  "goal": "What the target agent should achieve.",
  "constraints": ["Hard constraints go here."],
  "success_criteria": ["How the prompt should behave."],
  "deliverables": ["What the downstream agent must return."],
  "domain_terms": ["Optional vocabulary that should appear when relevant."]
}
```

See:

- `examples/hyperliquid-mission.json`

---

## Contributing

If you want to improve the project or submit ideas, start here:

- `CONTRIBUTING.md`

The easiest valuable contributions right now are:

- new mission examples
- scoring improvements
- better lineage / artifact visualization
- benchmark scenarios for real agent workflows

---

## Project structure

```text
fractal-prompt-foundry/
├── artifacts/
│   └── demo-run/
│       ├── report.md
│       └── result.json
├── assets/
│   ├── architecture.svg
│   ├── hero.svg
│   └── social-preview.svg
├── CONTRIBUTING.md
├── examples/
│   └── hyperliquid-mission.json
├── fractal_prompt_foundry.py
├── demo.py
├── test_foundry.py
├── pyproject.toml
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
- genome profiling
- lineage reporting
- JSON + markdown artifacts
- runnable CLI path
- runnable demo
- basic tests

---

## What would make people want it even more

If you want the repo to become more desirable to developers, the highest-leverage next upgrades are:

### Near-term upgrades
- swap the deterministic evaluator for real agent calls
- add side-by-side prompt diffs between generations
- include benchmark missions across coding / research / trading
- add JSON schema validation for mission files
- export SVG lineage graphs directly, not just Mermaid

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
