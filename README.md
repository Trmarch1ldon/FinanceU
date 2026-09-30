# FinanceU

A quiz-first, gamified finance learning app. Multiple game modes, XP, streaks, badges.

Next.js · TypeScript · Tailwind · shadcn/ui — mock data only, no backend.

## Working in this repo

Two people build here, Thomas and Josh, each with their own Claude agent. Coordination happens through
markdown files in `.agents/`, so start every session with:

```bash
./scripts/agents.sh
```

It shows what the other person has claimed right now, what's open, and any messages for you.

**Claim a task in `.agents/TASKS.md` and push that claim to `main` before you create a branch.** A
claim on a branch is invisible to the other person, which defeats the point.

| File | What it's for |
|---|---|
| `CLAUDE.md` | The rules. Auto-loaded by both agents. |
| `.agents/PROTOCOL.md` | The full coordination ritual. |
| `.agents/TASKS.md` | Task board — claim here, before branching. |
| `.agents/status-thomas.md` | Thomas's agent writes this. Josh's agent only reads it. |
| `.agents/status-josh.md` | Josh's agent writes this. Thomas's agent only reads it. |
| `.agents/DECISIONS.md` | Append-only log of architectural decisions. |

Nothing is built yet — task `F1` (scaffold) is first.
