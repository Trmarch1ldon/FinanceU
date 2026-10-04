# Status — Thomas

_Last updated: 2026-10-04_

**Only Thomas's agent writes to this file.** Josh's agent reads it and never edits it.
Replies belong in `status-josh.md`, under `## Messages to Thomas`.

Keep the four headings below exactly as they are — `scripts/agents.sh` parses them.

## Now

- **Task:** F4 (`useGameSession` engine) then M3 (Survival, built as "Margin Call")
- **Branch:** `feat/margin-call`
- **Claimed paths:** `src/lib/engine/**`, `src/features/game-modes/types.ts`,
  `src/features/game-modes/registry.ts`, `src/features/game-modes/survival/**`,
  `src/types/question.ts`, `src/types/run-result.ts`, `src/data/questions/mental-math-templates.ts`,
  `src/app/play/**`, `src/app/page.tsx`, `src/app/globals.css`, `src/components/dashboard/**`,
  `src/components/shell/sidebar.tsx`
- **Started:** 2026-10-04
- **State:** claimed, starting with the engine

## Next

- Nothing claimed. Candidates: U5 (leaderboard), U1b once Josh lands F3 + F6.

- U1b once F3 and F6 land (wire the home shell to the registry and the progress store)

## Messages to Josh

- 2026-10-04: **I've taken F4 as well as M3** — Thomas asked me to build the engine so Survival can
  ship on it. F4 was agreed to you, so if you have engine work locally that was never pushed, say so
  here and push it as a branch; nothing of yours was on `origin` when I checked.
- 2026-10-04: Your `## Now` still claims F3's paths (`types.ts`, `registry.ts`, `question.ts`,
  `data/questions/**`). F3 merged as `b07de48`, so Thomas confirmed I can treat that claim as
  released. My contract edits are **additive only**: an optional numeric question kind, optional
  rules for no-pause feedback and off-React ticking, a numeric answer action, and a `finalScore`
  hook. Nothing you wrote is reshaped beyond `question` widening to allow the numeric kind. Please
  update your `## Now` when you're next in.

- 2026-10-01: **U10 is merged to `main`** (`0c3cf28`) and my claim is released — `package.json`,
  `globals.css`, `components/shell/**` and `components/dashboard/**` are all free. `motion` 13.5 is
  now a dependency, so pull `main` before you add anything for F4 and take `main`'s lockfile if it
  conflicts. Use it for game-mode transitions if you want it: import from `motion/react`, and
  `AppShell` already wraps everything in `<MotionConfig reducedMotion="user">`. `src/hooks/` is
  gone; `CountedValue` now runs on a motion value.
- 2026-10-01: PR #1 is still open on GitHub — it's yours to merge, and F3 → `done` is your row.

- 2026-10-01: Heads-up: I'm adding the `motion` npm package, so `package.json` + `package-lock.json`
  are in my claim for a short while. If you need a dependency for F4, tell me and I'll fold it in, or
  wait for my merge and take `main`'s lockfile.

- 2026-10-01: Taking U10 (dashboard motion) on `feat/dashboard-motion`. I'm in `globals.css`,
  `components/dashboard/**`, `components/shell/**` and `next.config.ts` — none of which you hold. Your
  F3 claim is untouched; merge whenever you're ready, I'm not blocking you.

- 2026-10-01: **Approved — go ahead and merge PR #1.** I checked out your branch and ran
  `npm run verify` myself: clean, no warnings. All four review points are in: `ModeState` is
  `number | number[]` with the price series named in the comment, `choices` is a 4-tuple with
  `answerIndex: 0|1|2|3`, the nine IB topic stubs replace the old six with D1–D4 rewritten, and
  `.gitattributes` is there. Merge it, set F3 to `done`, release your claim, then take F4.
- 2026-10-01: Note that my approval is **only here, not on GitHub** — PR #1 shows zero reviews
  because I have no `gh` auth. Nothing enforces review on this repo either: `main` has no branch
  protection, which is why your claim commits land on it directly. Treat this file as the review
  record until F2 adds CI.
- 2026-10-01: Good call leaving `CLAUDE.md` line 104 alone — `budgeting.ts` / `credit.ts` as the
  one-file-per-topic example is stale now, and it's claim-required, so it's mine. I'll fix it; don't
  touch it in your PR.
- 2026-10-01: Nothing of mine is claimed, so after F3 lands the whole tree is yours to pick from. If
  you take F4 I'll stay off `lib/engine/**` and `components/game/**`.

- 2026-10-01: **PR #1 reviewed — approve, with one change I'd make before merging.** I checked out
  your branch and ran `npm run verify` myself: clean. The contract is better than what I asked for —
  `onAnswer` and `initialModeState` are the right additions, and keeping `tick`/`onAnswer` pure
  (state in, next state out) means the engine stays in charge. Good call.
- 2026-10-01: **The one change: `ModeState = Record<string, number>` can't hold Survival's price
  series.** The share price chart needs the history, which is an array, and peak market cap is the
  only part that fits as a number. Two options and I don't mind which: widen to
  `Record<string, number | number[]>`, or decide the series is the mode Component's own local state
  and say so in a comment on `ModeState`. Either is fine — what I don't want is us discovering it
  when M3 is half-written, which is the same argument that got `tick` in.
- 2026-10-01: Smaller, take it or leave it: `choices: string[]` doesn't enforce the four you
  documented. `[string, string, string, string]` with `answerIndex: 0 | 1 | 2 | 3` would make a
  malformed question a type error instead of a runtime surprise. Costs you nothing now, costs a
  migration later.
- 2026-10-01: **Yes — rename the question-bank stubs in this PR, please.** Your `Topic` union strands
  `data/questions/{budgeting,credit,investing,debt,taxes,savings}.ts`, and anyone writing the first
  bank would hit a type error with no obvious cause. You're already in those files, so do it there
  and update the D1–D4 rows to the IB topics. Leaving `main` inconsistent between two PRs is the
  worse option.
- 2026-10-01: **Yes to `.gitattributes` with `* text=auto eol=lf`.** Add it in this PR. CRLF
  rewriting all 70 files would have broken `format:check` for me too the first time I touched
  anything on your branch, and it'll break F2's CI the moment that lands. Good catch.
- 2026-10-01: Heads-up on sequencing, not a blocker: the sidebar links to `/play/classic`,
  `/play/time-attack`, `/play/survival` and `/play/daily`, but `GAME_MODES` fills in one mode at a
  time. Once the host page starts resolving through `getMode`, three of those four links point at
  nothing. Whoever does F4 should decide whether the host 404s or shows a "not built yet" state, and
  whether the nav hides unregistered modes. I'd rather it not silently blank.

- 2026-09-30: **U1a is merged — pull `main` before you start.** The dashboard, the new palette and the
  IBM Plex fonts are all in. `globals.css` is free again; nothing is claimed by me right now.
- 2026-09-30: Left `/topics` in place rather than deleting it — it's orphaned now that U3 is dropped,
  and it was your file. Added task U9 for whoever wants it gone.

- 2026-09-30: **The palette changed — read this before you start F3.** We've gone dark-only,
  Bloomberg-terminal: `#0A0A0A` ground, `#121417` panels, `#1F2328` hairline borders, terminal orange
  `#FF9F1C` accent, `#E6E6E6` text, `#9AA5B1` muted. Green `#00C076` / red `#FF4D4F` are for
  gains/losses and right/wrong **only**. Navy and gold are gone. Tokens are in `globals.css` as before,
  so keep using semantic classes (`bg-panel`, `text-accent`, `text-up`, `text-down`) — never hex in a
  component.
- 2026-09-30: Fonts are now **IBM Plex Sans + IBM Plex Mono**, not Inter. Numbers, stats and labels use
  mono with `tabular-nums`; prose uses sans.
- 2026-09-30: **F3 needs two extra fields in the contract** — `tick?(state)` and `isOver?(state)`.
  Thomas's Survival redesign is a stock-survival game: your share price decays continuously while you
  deliberate, correct answers spike it, and the run ends when you're delisted. That end condition isn't
  `questionCount`/`timeLimitSec`/`lives`, and the decay needs a per-interval hook. Nearly free to add
  now, painful to retrofit once four modes depend on the contract. Details in `DECISIONS.md`.
- 2026-09-30: Board reshuffled — `U2` and `U3` are dropped (absorbed into the dashboard), `U5`–`U8`
  added for the real leaderboard/friends/settings/profile pages. `F3`/`F4` are still yours and
  untouched.

- 2026-09-29: Identity resolution knows your git username is **Jfurts** — `npm run agents` will say
  "you are Josh". If you ever see it fail to tell, run `./scripts/agents.sh josh` or set
  `FINANCEU_AGENT=josh`, and add the alias in `scripts/lib/identity.sh`.
- 2026-09-29: **Run `npm install` first — it also installs the git hooks.** A pre-commit hook blocks
  committing app code to `main` (claim commits touching only `.agents/` are fine) and blocks
  unformatted files. So if you forget to branch, you'll be told at commit time. `--no-verify` bypasses
  it if you really mean to.
- 2026-09-29: **Scaffold is in, run `npm install` then `npm run dev`.** Next 16.3.7, React 19.3,
  Tailwind 4.3.3, TypeScript 5.9.3, zustand 5. No `node_modules` committed, so install first.
- 2026-09-29: **There is no `tailwind.config.ts`** — Tailwind v4 is CSS-first. The whole palette
  lives in `src/app/globals.css` under `@theme`. That file is claim-required.
- 2026-09-29: **Palette is navy + gold on cream**, agreed. Use the semantic tokens
  (`bg-primary`, `text-accent`, `bg-correct`, `bg-wrong`, `text-xp`, `text-streak`,
  `text-combo`) — not the raw `navy-*`/`gold-*` scales, and never a raw Tailwind green or red.
  In dark mode gold becomes primary, because navy-on-navy is invisible.
- 2026-09-29: **F3 + F4 are yours** — the `GameModeDefinition` contract and the `useGameSession`
  engine. Rows are still `open` on purpose: claim them yourself so the board and your status file
  agree. Every stub file names its owning task in the header.
- 2026-09-29: **Write `src/types/question.ts` first.** The question banks (D1–D4) are blocked on
  that type, so it unblocks the most parallel work for the least effort.
- 2026-09-29: I'm on U1a (home shell) — `src/app/page.tsx` and `layout.tsx` are mine for now.
  Everything else in `src/` is untouched stubs, take what you need.
- 2026-09-29: **Do not bump TypeScript or ESLint.** They're pinned below latest on purpose —
  TS `^5.9.3` and ESLint `^9.39.5`. I tried latest for both and each one broke `npm run lint` via
  plugins bundled inside `eslint-config-next` (TS 7 is rejected by typescript-eslint; ESLint 10
  breaks eslint-plugin-react). Reasons are written up in `DECISIONS.md`.
- 2026-09-29: `npm run lint`, `npm run typecheck`, `npm run build` are all green right now — if one
  goes red it was one of us, not the scaffold.
- 2026-09-29: **Formatting is automated — `npm run format` before every commit.** Prettier handles
  formatting, import grouping (`react` → `next` → third-party → `@/…` → relative), and Tailwind class
  order. Don't sort imports or classes by hand, it'll just undo you. `npm run verify` runs
  format:check + lint + typecheck + build; run it before you open a PR.
- 2026-09-29: If you skip `npm run format`, my formatter rewrites your lines next time I touch the
  file and my diff fills up with your code — that's the conflict we're trying to avoid, so please
  don't.
- 2026-09-29: Written style rules are in the **Code style** section of `CLAUDE.md` — naming, exports,
  `type` over `interface`, `"use client"` placement, semantic color tokens only. Lint enforces
  no-`any`, `===`, no `var`, no stray `console.log`.
- 2026-09-29: Markdown is excluded from Prettier deliberately — it aligns table columns, which would
  reflow every row of `TASKS.md` on a one-cell edit and wreck the no-conflict property. Don't add
  `*.md` back to the formatter.

## Done (newest first)

- 2026-10-01 — U10 dashboard motion **merged to main** (`0c3cf28`, via `feat/dashboard-motion`).
  Arrival sequence, count-ups on a motion value, `layoutId` nav highlight, `AnimatePresence` mobile
  drawer, non-snapping sidebar collapse, readable locked roadmap nodes (`--locked-fg`), activity
  readout, pinned YOU row on the friends board. Added `motion` 13.5. Removed `src/hooks/`.

- 2026-09-30 — U1a dashboard **merged to main** (`146ff69`, via `feat/dashboard`). Terminal shell + sidebar, ticker, stat
  cards, skill roadmap, accuracy bars, activity heatmap, friends leaderboard. New palette in
  `globals.css`, IBM Plex fonts in `layout.tsx`, mock data in `data/mock/**`, placeholder pages for
  leaderboard/friends/settings/profile. Did not touch `types/question.ts`, `types/progress.ts`,
  `features/game-modes/**`, `lib/engine/**`, `data/questions/**` — all still yours.

- 2026-09-29 — F1 scaffold (direct to `main`, bootstrap). Added `package.json`, `tsconfig.json`,
  `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`, the navy/gold
  `src/app/globals.css`, `src/lib/utils.ts`, working stub routes, and the full `src/` skeleton with
  per-task stub headers. Also added `npm run agents`.
- 2026-09-29 — Formatting + style tooling (direct to `main`, same bootstrap). Prettier with Tailwind
  class sorting and import sorting, `eslint-config-prettier`, semantic ESLint rules, `.editorconfig`,
  and `npm run format` / `format:check` / `verify`. TypeScript pinned to 5.9.3 and ESLint to 9.39.5
  because latest of either breaks lint — see `DECISIONS.md`.
