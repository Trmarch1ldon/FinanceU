# FinanceU

A quiz-first, heavily gamified finance learning app. Multiple game modes, XP, streaks, badges.

**Two people work in this repo — Thomas and Josh — each with their own Claude agent.** The rules below
exist so the two agents don't overwrite each other's work. They are not optional.

---

## Which one of us are you?

Everything else depends on getting this right — which status file you write, which one you only read.

**You are whoever `git config user.name` / `user.email` says you are.** Don't infer it from the
conversation.

| Person | Matches on | Writes | Reads only |
|---|---|---|---|
| **Thomas** | `thomas`, `trmarchildon`, `trmarch1ldon` | `.agents/status-thomas.md` | `.agents/status-josh.md` |
| **Josh** | `josh`, `jfurts` | `.agents/status-josh.md` | `.agents/status-thomas.md` |

`./scripts/agents.sh` resolves it and prints "you are …" at the top — that line is the authority. If it
can't tell, it stops and says so rather than guessing; pass the name (`./scripts/agents.sh josh`) or set
`FINANCEU_AGENT=josh`, and add the alias to `aliases_for()` in `scripts/agents.sh` so it's permanent.

**Never write to the other person's status file, whatever the reason.**

## Before you touch anything

Run this first, every session, before reading app code:

```bash
./scripts/agents.sh
```

It fetches `origin/main` and prints: what the other agent has claimed right now, which tasks are open,
and any messages addressed to you. Read the full ritual in `.agents/PROTOCOL.md`.

**Do not skip this.** Your local files say nothing about what the other agent started ten minutes ago.

## Before you start work

1. **Claim a task in `.agents/TASKS.md`** — your name in `Owner`, `Status: wip`, branch name.
2. **Write your `## Now` block** in `.agents/status-<you>.md` — task, branch, claimed paths, start time.
3. **Commit those two files and push straight to `main`.** This is the only commit that ever goes
   directly to `main`.
4. **Then** create your branch — `git switch -c feat/<thing>`.

Claiming after branching is useless — the other agent can't see it. And the pre-commit hook will
block you from committing app code to `main` anyway, so branching isn't optional.

## Hard rules

- **Never edit a path listed in the other agent's `## Now`.** No exceptions. Ask via
  `## Messages to <them>` in your own status file and work on something else meanwhile.
- **Never edit the other agent's status file.** One writer per file, always.
- **Never edit a `TASKS.md` row you don't own.** Never move, reorder, or delete rows.
- **Never work on an unclaimed task.** Claim it first, push, then work.
- **If the other agent's claim looks stale (>24h), ask the human.** Don't assume it's free.
- **Update your `## Now` before you stop mid-task.** A stale `wip` with no state note is the one thing
  the other agent cannot recover from.

## Getting started

```bash
npm install     # also installs the git hooks (see below)
npm run dev
```

`npm install` points `core.hooksPath` at `scripts/git-hooks`, which installs a **pre-commit hook that
blocks** two things:

1. **Committing app code to `main`.** Only claim commits (`.agents/` only) are allowed there. If you
   forgot to branch, the hook tells you and stops the commit.
2. **Editing the other person's status file.** One writer per file, enforced rather than trusted.
3. **Committing unformatted code.** Run `npm run format && git add -u`.

Bypass with `git commit --no-verify` only when you mean it.

There is **no `tailwind.config.ts`** — Tailwind v4 is CSS-first. The palette and every design token
live in `src/app/globals.css` under `@theme`. Don't create a config file looking for them.

## Shared files — claim before editing

Editing any of these forces the other person to rebase, so claim them in your `## Now` first, keep the
change small, and get it merged fast:

- `src/app/globals.css` — the palette and all design tokens
- `src/features/game-modes/types.ts` — the mode contract
- `src/features/game-modes/registry.ts` — one line per mode; add your line, push quickly
- `src/lib/engine/**` — shared quiz mechanics
- `src/components/game/**` — shared game chrome
- `package.json`
- `.prettierrc.json`, `eslint.config.mjs` — changing either reformats or re-lints the whole repo, so a
  casual tweak turns into a diff across every file the other person is working in
- `CLAUDE.md`, `.agents/PROTOCOL.md`

## Conventions that prevent conflicts

These are structural, not stylistic — each one removes a file that two agents would otherwise both edit.

- **No barrel files.** No `index.ts` re-exports, anywhere. Import from the concrete path.
- **One component per file.** No grab-bag modules.
- **Question data: one file per topic** (`src/data/questions/budgeting.ts`, `credit.ts`, …). Never one
  big `questions.ts`.
- **Types: one file per domain** in `src/types/`. No god-object `types.ts`.
- **Each game mode is a self-contained folder** under `src/features/game-modes/<mode>/`.
- **`registry.ts` is one line per mode**, sorted by id.
- **`src/components/ui/**` is shadcn-generated** — add via the CLI, wrap rather than hand-edit.
- **Lockfile conflicts are never hand-merged.** Take `main`'s version, re-run `npm install`, commit.

## Code style

Two agents writing in the same repo produce two dialects unless something forces one. Most of that is
automated — don't argue with the tools, just run them.

```bash
npm run format     # rewrites files: formatting, import order, Tailwind class order
npm run verify     # format:check + lint + typecheck + build — run before every PR
```

**Run `npm run format` before you commit.** Otherwise the next person's formatter rewrites your lines
and their diff is full of your code, which is how you get conflicts in files nobody meaningfully
changed.

### Automated — don't hand-maintain these

- **Formatting** — Prettier. 100 char lines, double quotes, semicolons, trailing commas.
- **Import order** — Prettier sorts them: `react` → `next` → third-party → `@/…` → relative, blank
  line between groups. Never reorder imports by hand.
- **Tailwind class order** — Prettier sorts classes, and it knows our custom tokens. Write them in any
  order; it fixes them.
- **No `any`** — lint error. Use `unknown` and narrow.
- **`===`, `const`, no `var`, no stray `console.log`** — lint enforced (`console.warn`/`error` are fine).

Markdown is deliberately **not** formatted: Prettier pads table columns, so one cell edit reflows the
whole table, which would wreck the single-line-edit property that keeps `.agents/TASKS.md`
conflict-free.

### Not automated — follow these by hand

**Naming**

- Files and folders: `kebab-case` — `question-card.tsx`, `use-game-session.ts`, `time-attack/`.
- Components: `PascalCase`. Hooks: `useThing`. Types: `PascalCase`. Constants: `SCREAMING_SNAKE`.
- Booleans read as assertions: `isCorrect`, `hasStreak`, `canRetry`.

**Exports**

- **Named exports everywhere**, except Next's route files (`page.tsx`, `layout.tsx`) which must
  default-export. One main thing per file.
- No barrel/`index.ts` re-export files. Import from the concrete path.

**Types**

- `type` over `interface` unless you genuinely need declaration merging or `extends`.
- Props type sits directly above its component and is named `<Component>Props`.
- Derive rather than duplicate: `Pick<Question, "id" | "topic">` beats retyping fields.
- Persisted shapes stay serializable — ISO date strings, plain objects. No `Date`, `Map`, or class
  instances in anything that touches `localStorage`.

**Components**

- Server Components by default. `"use client"` only where you need state, effects, or handlers, and put
  it on the leaf-most component that needs it — not on a whole page.
- Shared chrome in `components/game/` is presentational: props in, no store reads, no mode logic.
- Colors come from semantic tokens — `bg-primary`, `text-xp`, `bg-correct`, `bg-wrong`. **Never a raw
  Tailwind `green-500`/`red-500` for answer feedback**, and don't reach for the raw `navy-*`/`gold-*`
  scales in components.

**Logic**

- Engine helpers in `lib/engine/` are pure functions — same input, same output, no store access. They
  get reused across every mode.
- A game mode never re-implements answer checking, question selection, or combo tracking. If you're
  writing that inside a mode, it belongs in the engine.

**Comments**

- Explain *why*, not *what*. The code says what it does.
- Worth a comment: a non-obvious constraint, a workaround with a reason, a tricky invariant.
- Not worth a comment: narrating the next line, or restating a good function name.

## Where things go

Every stub file names its owning task in a header comment. Files are kebab-case.

```
src/
  app/
    layout.tsx                fonts, metadata, <body>
    globals.css               palette + design tokens (CLAIM-REQUIRED)
    page.tsx                  home — currently a placeholder, U1a replaces it
    play/[mode]/page.tsx      game host — resolves the mode from the registry
    dashboard/page.tsx        U2 — level curve, streak calendar, badges
    topics/page.tsx           U3 — topic browser, per-topic mastery
  components/
    ui/                       shadcn primitives — CLI-generated, don't hand-edit
    game/                     F5 shared chrome (CLAIM-REQUIRED): question-card,
                              answer-button, score-bar, combo-meter, timer,
                              lives-row, result-summary
  features/game-modes/
    types.ts                  F3 — GameModeDefinition contract (CLAIM-REQUIRED)
    registry.ts               F3 — one line per mode
    <mode>/mode.ts            the GameModeDefinition
    <mode>/view.tsx           the mode's presentation
    classic/ time-attack/ survival/ daily/
  lib/
    utils.ts                  cn() — shadcn needs this
    engine/                   F4 (CLAIM-REQUIRED): use-game-session, scoring,
                              select-questions
    progress/                 F6: store, xp, badges
  data/questions/             D1–D4, one file per topic
  types/                      question.ts, progress.ts
```

Don't invent new top-level folders. If you need one, add a `.agents/DECISIONS.md` entry saying why.

## The game mode contract

This is what makes parallel work possible — two people building two modes share exactly one line of
code (their registry entry).

```ts
export type GameModeDefinition = {
  id: string;                  // url segment, e.g. "time-attack"
  name: string;
  tagline: string;
  icon: LucideIcon;
  rules: { questionCount?: number; timeLimitSec?: number; lives?: number; difficultyRamp?: boolean };
  scoring: (ctx: ScoringContext) => number;
  Component: React.ComponentType<GameModeProps>;
};
```

`useGameSession` (in `src/lib/engine/`) owns the shared state machine — `idle → playing → feedback →
summary` — plus question selection, combo tracking, and XP emission. **A mode supplies rules, scoring,
and presentation. It never re-implements quiz mechanics.** If you find yourself rewriting answer
checking inside a mode, the logic belongs in the engine.

## Stack

Next 16.3 (App Router) · React 19.3 · TypeScript 5.9 · Tailwind 4.3 · shadcn/ui · zustand 5 · npm · Node 24

`npm run lint`, `npm run typecheck`, and `npm run build` all pass on a clean install — keep them that way.

Mock data only — no server, no accounts. Content in typed fixtures; progress in `localStorage`.

## Commits

Small and scoped, conventional-commit prefixes: `feat:`, `fix:`, `chore(agents):`, `docs:`.
Short-lived branches, squash-merged into `main` via PR. Claim commits are the only direct pushes.

## Current state

`F1` (scaffold) is **done** — configs, palette, and the full `src/` skeleton of stubs are in. Every
route renders, so `npm run dev` works from the start.

Nothing else is implemented. Remaining foundation tasks `F3`–`F6` are **sequential** — they're the
shared spine everything imports. `F3` (`src/types/question.ts` plus the mode contract) unblocks the
most work, so it goes first.

Current split: Thomas on `U1a` (home shell), `F3`+`F4` agreed to Josh but not yet claimed.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
