# Decisions

Append-only. One entry per decision that another agent could otherwise undo by accident — stack
choices, architectural contracts, conventions with a real reason behind them.

**Append at the bottom. Never edit or delete an existing entry.** Superseding one? Add a new entry
that says so and link back. Because this file is append-only at the bottom, two agents adding entries
at once can collide — note it in your status file first, or just push immediately.

Not for: task status (that's `TASKS.md`), or what you did today (that's your status file).

---

### 2026-09-29 — Next.js + TypeScript + Tailwind + shadcn/ui

Front-end-heavy product with a possible backend later. App Router, heavily represented in model
training data, so AI-driven work stays on rails. shadcn components are copied into the repo rather
than imported from a package, so they can be edited freely.

### 2026-09-29 — Mock data only for v1; progress in localStorage

No server, no accounts. Content lives in typed fixtures under `src/data/questions/`. Player progress
(XP, level, streak, badges) persists to `localStorage` via zustand `persist` — gamification is
meaningless if it resets on reload. The data-access layer stays thin so a real API can replace the
fixtures without touching UI.

### 2026-09-29 — Every game mode is a self-contained folder behind one contract

`GameModeDefinition` in `src/features/game-modes/types.ts` is the contract; `registry.ts` lists one
line per mode. A mode supplies rules, scoring, and presentation — never its own quiz mechanics, which
live in `src/lib/engine/`.

This is primarily a *collaboration* decision, not an aesthetic one: it means two people can build two
game modes simultaneously while sharing exactly one line of code.

### 2026-09-29 — Coordination via single-writer status files + a one-line-per-row task board

See `PROTOCOL.md`. Status files have one writer each so they cannot conflict; `TASKS.md` rows are
permanent so every edit is a single line; claims are pushed to `main` before the branch exists so they
are visible without a merge.

### 2026-09-29 — No barrel files

No `index.ts` re-export files anywhere. Every feature touches them, which makes them permanent
conflict magnets for two parallel agents. Import from the concrete path instead.

### 2026-09-29 — Palette: navy & gold on cream

`--primary #1E3A5F` (navy), `--accent #D4A24C` (gold), `--background #FDFBF7` (cream), with
`--correct #2F855A` and `--wrong #C53030` for answer feedback. Chosen for credibility — it reads as a
finance product rather than a generic quiz app.

Gold carries all reward work (XP, streaks, badges, combo) rather than a separate warm ramp; a hotter
streak color was considered and skipped as not worth the extra token. Easy to revisit.

In dark mode **gold becomes `--primary`**, because navy on a navy ground is invisible.

Use the semantic tokens (`bg-primary`, `text-xp`, `bg-correct`, …). The raw `navy-*` and `gold-*`
scales exist as raw material — don't reach for them in components, and never use a raw Tailwind green
or red for answer feedback.

### 2026-09-29 — Tailwind v4, so no `tailwind.config.ts`

v4 is CSS-first: the theme lives in `@theme` inside `src/app/globals.css`. One fewer shared file to
contend over, and the palette sits next to the stylesheet that uses it. If you go looking for a config
file, there isn't one — that's deliberate, not an oversight.

### 2026-09-29 — TypeScript 5.9.3 and ESLint 9, NOT the latest of either

Tried `latest` for both first. Both broke `npm run lint`, in different ways:

- **TypeScript 7.0.2** — `typescript-eslint` (bundled inside `eslint-config-next`) requires
  `>=4.8.4 <6.1.0` and hard-errors on TS 7: *"typescript-eslint does not support TS 7.0."* Typecheck
  and build were fine; only lint died. Tracking issue: typescript-eslint#10940.
- **ESLint 10.11.0** — `eslint-plugin-react@7.37` (also bundled by `eslint-config-next`) calls an API
  ESLint 10 removed: *"contextOrFilename.getFilename is not a function"*.

So: **TypeScript `^5.9.3`, ESLint `^9.39.5`.** Don't "helpfully" bump either past those until
`eslint-config-next` ships updated bundled plugins. Verified: lint, typecheck, and build all clean.

### 2026-09-29 — The scaffold landed directly on `main` (bootstrap exception)

`F1` was pushed to `main` rather than through a PR. A repo with no `package.json` has nothing
meaningful to review a scaffold against, and both people need it present before anything else can
start. This is a one-off: from `F3` onward every task goes through a branch and a PR.

### 2026-09-29 — Prettier owns formatting, import order, and Tailwind class order

`npm run format` before committing; `npm run verify` (format:check + lint + typecheck + build) before
opening a PR.

Three plugins do real work here, and all three exist to stop two people generating churn in each
other's files:

- **`prettier-plugin-tailwindcss`** — sorts class strings. Without it, two agents write the same
  classes in different orders and every shared component diffs forever. It reads
  `src/app/globals.css` (v4 has no config file), so it knows our custom tokens like `bg-correct`.
- **`@ianvs/prettier-plugin-sort-imports`** — groups imports `react` → `next` → third-party → `@/…` →
  relative. This replaced ESLint's `import/order`, which warned but couldn't fix, and whose resolver
  fails to load under flat config and spammed a warning onto every file with imports.
- **`eslint-config-prettier`** — last in the ESLint array, switching off stylistic rules so the linter
  and formatter never disagree.

ESLint keeps only rules with actual semantics: `no-explicit-any` (error), `eqeqeq`, `no-var`,
`prefer-const`, `no-unused-vars`, `no-console`, and explicit type imports.

**Markdown is excluded from Prettier on purpose.** Prettier pads markdown table columns to align them,
so editing one cell reflows every row — which would destroy the single-line-edit property that keeps
`.agents/TASKS.md` merge-free. There is no upside to formatting our docs, so `*.md` is in
`.prettierignore`.

### 2026-09-29 — A committed pre-commit hook, because instructions get skipped

`CLAUDE.md` telling an agent to branch before working is guidance, and guidance gets skipped mid-flow.
`scripts/git-hooks/pre-commit` makes it mechanical: it rejects any commit to `main` touching anything
outside `.agents/`, and rejects unformatted files.

Installed via the `prepare` script setting `core.hooksPath=scripts/git-hooks` on `npm install` — so the
hook is version-controlled and both people get it, with no husky or lint-staged dependency.
`.git/hooks/` can't do this; it isn't committed.

Escape hatch is `git commit --no-verify`. The scaffold's own bootstrap commit needed it, since by
definition it puts app code on `main`.
