# Agent Coordination Protocol

Two people — **Thomas** and **Josh** — each drive their own Claude agent against this one repo. These
files are how the two agents talk to each other. Follow this literally; it is not advisory.

## Why it is shaped this way

- **Status files have exactly one writer.** A single shared log would be the hottest merge conflict in
  the repo. You read the other agent's file; you only ever write your own. Messages you send live in
  *your* file. Replies live in *theirs*.
- **`TASKS.md` is shared, so every edit to it is one line.** Rows are permanent and never move.
- **Claims are pushed to `main` before the branch exists.** A claim sitting on a feature branch is
  invisible to the other agent, which defeats the entire point.
- **Reads come from `origin/main`, never the local working copy.** Your local `main` says nothing
  about what the other agent started ten minutes ago. Staleness is the real failure mode here, not
  conflicts.

## 1. Session start — before reading any app code

Run this, or `./scripts/agents.sh`, which does it for you:

```bash
git fetch origin
git show origin/main:.agents/TASKS.md
git show origin/main:.agents/status-josh.md      # if you are Thomas
git show origin/main:.agents/status-thomas.md    # if you are Josh
```

Then:

- Read the other agent's `## Now`. What are they holding right now?
- Read `## Messages to <you>` in their file and act on anything addressed to you.
- Check how fresh their claim is. `./scripts/agents.sh` flags claims older than 24h — a stale `wip`
  usually means an abandoned session, but **ask the human before assuming it is free.**

## 2. Claiming work — before the branch exists

1. **Pick a task whose `Owner` is `—`.** Respect the Foundation section's sequential ordering.
2. **Check for path overlap** against the other agent's `Claimed paths`. If it overlaps: **stop.**
   Pick different work, or write a request under `## Messages to <them>` and do something else while
   you wait. Do not "just be careful" — the whole protocol is the alternative to being careful.
3. **Write the claim.** Two files: the `TASKS.md` row (`Owner`, `Status: wip`, `Branch`) and your own
   `## Now` block.
4. **Commit and push straight to `main`:**

   ```bash
   git add .agents/TASKS.md .agents/status-thomas.md
   git commit -m "chore(agents): claim M2 time-attack"
   git push origin main
   ```

   This is the **only** commit allowed to go directly to `main`. It touches nothing but `.agents/`.
   If the push is rejected, `git pull --rebase`, re-apply your one line, push again.

5. **Now** create the branch off fresh `main`:

   ```bash
   git switch -c feat/time-attack-mode
   ```

   This step is enforced, not just documented: the pre-commit hook (installed by `npm install`)
   rejects any commit to `main` that touches anything outside `.agents/`. If you forgot to branch,
   you'll find out at commit time rather than after pushing.

## 3. While working

- Stay inside your claimed paths. Wandering outside them is how you break the other agent's branch.
- Need a shared file (see `CLAUDE.md` for the list)? Claim it in your `## Now` first, push, make the
  change small and focused, and get it merged fast so the other agent isn't blocked.
- Discovered a new task? Add a row to `TASKS.md` on `main` (not on your branch — a row nobody can see
  isn't a row).

## 4. Finishing

1. Open the PR. Set your `TASKS.md` row to `Status: review`.
2. After merge: `Status: done`, prepend a `## Done` entry naming the paths you actually touched, and
   clear your `## Now` back to `_Nothing claimed._`. Push to `main`.

An accurate `## Done` list is what lets the other agent understand the repo without reading every diff.

## 5. Interrupted, or out of context mid-task

**Update your `## Now` with where you actually got to before you stop.** Add a `- **State:**` line.

A stale `wip` with no `Done` entry and no `State` note is the one situation the other agent cannot
recover from — they can't tell whether the work is half-finished, abandoned, or about to land.

## 6. When things conflict

- **`TASKS.md`** — take `main`'s version, re-apply your single line. Never hand-merge it.
- **Your status file** — cannot conflict. One writer, and the pre-commit hook blocks you from staging
  the other person's. If it somehow conflicts anyway, yours is authoritative.
- **`package-lock.json`** — take `main`'s version, re-run `npm install`, commit the result. Never
  hand-merge a lockfile.
- **Source files** — if you hit a real conflict in app code, the protocol was skipped somewhere. Fix
  the merge, then say so in `## Messages to <them>` so it doesn't recur.

## Quick reference

| Situation | Do |
|---|---|
| Starting a session | `./scripts/agents.sh` |
| Starting work | Claim in `TASKS.md` + `## Now` → push to `main` → *then* branch |
| Need something they own | `## Messages to <them>`, then work on something else |
| Their claim looks stale | Ask the human. Do not assume. |
| Stopping mid-task | Update `## Now` with a `State:` line first |
| Task merged | `Status: done`, prepend `## Done`, clear `## Now` |
| Hook blocked your commit | Read it — you either forgot to branch, or forgot `npm run format` |
