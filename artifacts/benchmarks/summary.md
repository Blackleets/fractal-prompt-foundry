# Fractal Prompt Foundry Benchmark Suite

## Portfolio summary
- Missions: `3`
- Average evolved winner score: `0.923`
- Average delta vs seed: `0.221`
- Evolution beat seed rate: `1.0`

## Lane frequency across winners
- critic: `3`
- architect: `3`
- operator: `3`

## Mission results
| Mission | Winner style | Winner score | Delta vs seed | Beat seed? |
|---|---|---:|---:|---|
| hyperliquid-agent-loop | `critic+architect+operator` | 0.932 | 0.204 | True |
| support-triage-agent | `operator+critic+architect` | 0.906 | 0.229 | True |
| code-review-agent | `critic+architect+operator` | 0.931 | 0.229 | True |

## hyperliquid-agent-loop
- Goal: Design a prompt for an autonomous trading research agent that studies Hyperliquid market structure and proposes low-risk experiments.
- Winner: `r3-mut-5` / `critic+architect+operator` / `0.932`
- Seed baseline: `seed-3` / `0.727`
- Score delta: `0.204`

### Metric deltas
- coverage: `+0.000`
- structure: `+0.000`
- actionability: `+0.000`
- refinement: `+0.800`
- evolutionary_gain: `+0.850`
- novelty: `-0.211`
- anti_vague: `+0.000`

### Added lines vs seed
- ROLE LANE: CRITIC+ARCHITECT+OPERATOR
- Merge the strengths of critic+architect and operator+architect. Preserve operational clarity, inject critique and edge-case pressure, and make the final output feel decisively executable.
- REFINEMENT PRESSURE:
- - Force one measurable validation step.
- - Add a failure-mode paragraph.
- - State a prioritised next action at the end.
- - Add one compact system map: inputs, decision layer, safety layer, outputs.
- - Specify one observability block with logs, metrics, and abort conditions.
- - Name the weakest assumption and how to falsify it before acting.
- - Tag this refinement pass as round 3, variant 5 in the internal planning logic.

## support-triage-agent
- Goal: Design a prompt for an autonomous support triage agent that classifies inbound tickets, identifies urgency, and proposes safe next actions for a human support team.
- Winner: `r3-mut-5` / `operator+critic+architect` / `0.906`
- Seed baseline: `seed-2` / `0.677`
- Score delta: `0.229`

### Metric deltas
- coverage: `+0.000`
- structure: `+0.000`
- actionability: `+0.125`
- refinement: `+0.800`
- evolutionary_gain: `+0.850`
- novelty: `-0.209`
- anti_vague: `+0.050`

### Added lines vs seed
- ROLE LANE: OPERATOR+CRITIC+ARCHITECT
- Merge the strengths of operator+critic and operator+architect. Preserve operational clarity, inject critique and edge-case pressure, and make the final output feel decisively executable.
- REFINEMENT PRESSURE:
- - Force one measurable validation step.
- - Add a failure-mode paragraph.
- - State a prioritised next action at the end.
- - Add one compact system map: inputs, decision layer, safety layer, outputs.
- - Specify one observability block with logs, metrics, and abort conditions.
- - Name the weakest assumption and how to falsify it before acting.
- - Tag this refinement pass as round 3, variant 5 in the internal planning logic.

## code-review-agent
- Goal: Design a prompt for an autonomous code review agent that inspects pull requests, surfaces concrete defects, and recommends the safest next engineering action.
- Winner: `r3-mut-5` / `critic+architect+operator` / `0.931`
- Seed baseline: `seed-3` / `0.702`
- Score delta: `0.229`

### Metric deltas
- coverage: `+0.000`
- structure: `+0.000`
- actionability: `+0.125`
- refinement: `+0.800`
- evolutionary_gain: `+0.850`
- novelty: `-0.213`
- anti_vague: `+0.050`

### Added lines vs seed
- ROLE LANE: CRITIC+ARCHITECT+OPERATOR
- Merge the strengths of critic+architect and operator+architect. Preserve operational clarity, inject critique and edge-case pressure, and make the final output feel decisively executable.
- REFINEMENT PRESSURE:
- - Force one measurable validation step.
- - Add a failure-mode paragraph.
- - State a prioritised next action at the end.
- - Add one compact system map: inputs, decision layer, safety layer, outputs.
- - Specify one observability block with logs, metrics, and abort conditions.
- - Name the weakest assumption and how to falsify it before acting.
- - Tag this refinement pass as round 3, variant 5 in the internal planning logic.
