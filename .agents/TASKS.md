# Task Board

**Claim a task BEFORE creating a branch.**

1. Put your name in `Owner`, set `Status` to `wip`, fill in `Branch`.
2. Commit **only** this file + your own status file. Push straight to `main`.
3. *Then* create the branch.

Rules that keep this file from becoming a merge-conflict pit:

- **Never move, delete, or reorder a row.** Status changes happen in place.
- **Never edit a row someone else owns.** Need it? Ask in `## Messages to <them>` in your status file.
- **Every edit you make here is one line.** Git merges single-line edits on different rows cleanly.
- Adding a batch of new tasks? Note it in your status file first and push quickly — appending rows at
  the bottom is the one operation here that can genuinely collide.
- Conflict anyway? Take `main`'s version and re-apply your single line. Never hand-merge this file.

`Status`: `open` → `wip` → `review` → `done`

## Foundation — sequential, DO NOT parallelize

These are the shared spine. Everything else imports them, so two people editing them at once is the
worst case this whole protocol exists to prevent. One owner at a time, in ID order.

**Agreed split (not yet claimed): F3 + F4 are Josh's.** Josh's agent claims them itself — a row with
a name on it that the owner's status file doesn't back is exactly the desync this board exists to
prevent.

| ID | Task | Owner | Status | Branch |
|----|------|-------|--------|--------|
| F1 | Scaffold Next.js + TS + Tailwind + shadcn/ui; add `npm run agents` alias | Thomas | done | main (bootstrap) |
| F2 | CI: run `npm run verify` (format:check + lint + typecheck + build) on PR | — | open | — |
| F3 | `GameModeDefinition` contract + mode registry — must include `tick()` + `isOver()`, see DECISIONS | Josh | review | feat/mode-contract |
| F4 | `useGameSession` engine: idle → playing → feedback → summary | — | open | — |
| F5 | Shared game chrome: QuestionCard, AnswerButton, ScoreBar, ComboMeter, Timer, LivesRow | — | open | — |
| F6 | Progress store: XP, levels, streak, badges (zustand + localStorage) | — | open | — |

## Question banks — parallel-safe

One file per topic, so these never touch each other.

| ID | Task | Owner | Status | Branch |
|----|------|-------|--------|--------|
| D1 | Question banks: accounting / three-statements | — | open | — |
| D2 | Question banks: ratios / valuation | — | open | — |
| D3 | Question banks: dcf / comps | — | open | — |
| D4 | Question banks: ma / lbo / mental-math | — | open | — |

## Game modes — parallel-safe after F3–F6 land

Each mode is a self-contained folder. Two people building two modes share exactly one line in
`registry.ts`.

| ID | Task | Owner | Status | Branch |
|----|------|-------|--------|--------|
| M1 | Classic — 10 questions, explanation after each (reference implementation) | — | open | — |
| M2 | Time Attack — 60s, combo multiplier, speed bonus | — | open | — |
| M3 | Survival — stock-survival: price decays while you think, correct answers spike it, run ends at delisting | — | open | — |
| M4 | Daily Challenge — date-seeded, one attempt, feeds the streak | — | open | — |

## Screens — parallel-safe

`U1a` ships these as placeholder empty states inside the shell; the rows below are the real versions.

| ID | Task | Owner | Status | Branch |
|----|------|-------|--------|--------|
| U1a | Dashboard — terminal shell, sidebar, ticker, stats, roadmap, heatmap, friends | Thomas | done | feat/dashboard |
| U5 | Leaderboard page — global + friends, real ranking | — | open | — |
| U6 | Friends page — add/search friends, activity feed | — | open | — |
| U7 | Settings page | — | open | — |
| U8 | Profile page | — | open | — |
| U9 | Remove the orphaned `/topics` route — not in nav since U3 was dropped | — | open | — |
| U1b | Wire dashboard to `registry.ts` + progress store, delete `data/mock/**` (needs F3, F6) | — | open | — |
| U2 | ~~Dashboard: level curve, streak calendar, badges~~ — absorbed into U1a | — | dropped | — |
| U3 | ~~Topics browser + per-topic mastery~~ — superseded by the skill roadmap in U1a | — | dropped | — |
