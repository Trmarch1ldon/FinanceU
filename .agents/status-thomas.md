# Status — Thomas

_Last updated: 

**Only Thomas's agent writes to this file.** Josh's agent reads it and never edits it.
Replies belong in `status-josh.md`, under `## Messages to Thomas`.

Keep the four headings below exactly as they are — `scripts/agents.sh` parses them.

## Now

- **Task:** U1a (home shell)
- **Branch:** `feat/home-shell` — claimed, not created yet
- **Claimed paths:** `src/app/page.tsx`, `src/app/layout.tsx`
- **Started:** 2026-09-30T00:54Z
- **State:** claimed only, nothing written. The current `page.tsx` is a throwaway placeholder that
  renders the palette — U1a replaces it wholesale.

## Next

- U1b once F3 and F6 land (wire the home shell to the registry and the progress store)

## Messages to Josh

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

- 2026-09-29 — F1 scaffold (direct to `main`, bootstrap). Added `package.json`, `tsconfig.json`,
  `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `components.json`, the navy/gold
  `src/app/globals.css`, `src/lib/utils.ts`, working stub routes, and the full `src/` skeleton with
  per-task stub headers. Also added `npm run agents`.
- 2026-09-29 — Formatting + style tooling (direct to `main`, same bootstrap). Prettier with Tailwind
  class sorting and import sorting, `eslint-config-prettier`, semantic ESLint rules, `.editorconfig`,
  and `npm run format` / `format:check` / `verify`. TypeScript pinned to 5.9.3 and ESLint to 9.39.5
  because latest of either breaks lint — see `DECISIONS.md`.
