# Status — Josh

_Last updated: 2026-10-01_

**Only Josh's agent writes to this file.** Thomas's agent reads it and never edits it.
Replies belong in `status-thomas.md`, under
`## Messages to Josh`.

Keep the four headings below exactly as they are — `scripts/agents.sh` parses them.

## Now

- **Task:** F3 (`Question` type + `GameModeDefinition` contract + registry)
- **Branch:** `feat/mode-contract`
- **Claimed paths:** `src/types/question.ts`, `src/features/game-modes/types.ts`, `src/features/game-modes/registry.ts`, `src/data/questions/**`, `.gitattributes`, TASKS.md rows D1–D4
- **Started:** 2026-10-01
- **State:** PR #1 approved with changes; applying Thomas's review (ModeState arrays, 4-tuple choices, rename question stubs, `.gitattributes`)

<!-- Replace this whole section when you start work. It is a claim, not a history — one entry only.
- **Task:** M2 (Time Attack)
- **Branch:** `feat/time-attack-mode`
- **Claimed paths:** `src/features/game-modes/time-attack/**`, `src/data/questions/credit.ts`
- **Started:** 2026-09-29T13:40Z
- **State:** timer + combo working; results screen not started
-->

## Next

_Nothing queued._

## Messages to Thomas

- 2026-10-01: Thanks for the review — taking all four: widening `ModeState` to `number | number[]` (keeps the price series engine-carried and serializable), 4-tuple `choices` + `answerIndex: 0|1|2|3`, renaming the question stubs to the nine IB topics with D1–D4 updated, and `.gitattributes`. All in PR #1. Your `/play/*` nav point is noted for F4.

- 2026-10-01: **F3 is up as PR #1 — please review.** Contract has your `tick` + `isOver`, plus `onAnswer` (Survival's price spike on a correct answer) and `modeState` for the price itself. Details in `DECISIONS.md` on the branch.
- 2026-10-01: **Topics switched to the IB track** to match your dashboard: `accounting`, `three-statements`, `ratios`, `valuation`, `dcf`, `comps`, `ma`, `lbo`, `mental-math` — same ids as your mock roadmap/topics. That means the empty `data/questions/{budgeting,credit,…}.ts` stubs and D1–D4 rows are out of date. Want me to add a task to rename them, or will you?
- 2026-10-01: Heads-up for Windows: with `core.autocrlf=true` every file checks out CRLF and `format:check` fails on all 70 files. I set `autocrlf=false` locally. A `.gitattributes` with `* text=auto eol=lf` would stop it happening to either of us — OK to add?

- 2026-10-01: Pulled `main`, read your notes. Claiming F3 now; F4 right after it lands. `tick?()` + `isOver?()` going into the contract for Survival as you asked.

<!-- Anything Thomas's agent needs to know. Newest first. Date every line.
- 2026-09-29: ComboMeter now lives in components/game/ — reuse it, don't write a second one.
- 2026-09-29: I need a time bonus in GameModeDefinition.scoring. Adding a field; object if it breaks Classic.
-->

## Done (newest first)

<!-- Prepend one line per finished task. Name the paths you actually touched.
- 2026-09-29 — M2 Time Attack shipped (PR #4). Touched features/game-modes/time-attack/** + one line in registry.ts.
-->
