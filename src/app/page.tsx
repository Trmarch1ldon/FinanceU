/**
 * Home — PLACEHOLDER.
 *
 * Task U1a replaces this with the real home shell: mode cards, XP/streak header.
 * It exists now only so `npm run dev` renders something and the palette is visible.
 * Owner of U1a: delete everything below and build it properly.
 */
import Link from "next/link";

const MODES = [
  { id: "classic", name: "Classic", tagline: "10 questions, learn as you go", task: "M1" },
  { id: "time-attack", name: "Time Attack", tagline: "60 seconds. Go.", task: "M2" },
  { id: "survival", name: "Survival", tagline: "3 lives, no mercy", task: "M3" },
  { id: "daily", name: "Daily Challenge", tagline: "One shot, keeps your streak", task: "M4" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">FinanceU</h1>
          <p className="mt-2 text-muted-foreground">Learn money the fun way.</p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-sm">
          <span className="font-semibold text-xp">0 XP</span>
          <span className="font-semibold text-streak">0 day streak</span>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {MODES.map((mode) => (
          <Link
            key={mode.id}
            href={`/play/${mode.id}`}
            className="rounded-lg border bg-card p-5 transition-colors hover:border-accent"
          >
            <h2 className="font-semibold text-card-foreground">{mode.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{mode.tagline}</p>
            <p className="mt-3 text-xs text-muted-foreground">not built yet — task {mode.task}</p>
          </Link>
        ))}
      </section>

      <nav className="mt-10 flex gap-5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-primary">
          Dashboard
        </Link>
        <Link href="/topics" className="hover:text-primary">
          Topics
        </Link>
      </nav>

      {/* Palette check — delete with the rest of this placeholder. */}
      <section className="mt-16 border-t pt-8">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Palette
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            ["primary", "bg-primary text-primary-foreground"],
            ["accent", "bg-accent text-accent-foreground"],
            ["correct", "bg-correct text-correct-foreground"],
            ["wrong", "bg-wrong text-wrong-foreground"],
            ["card", "bg-card text-card-foreground border"],
            ["muted", "bg-muted text-muted-foreground"],
          ].map(([label, cls]) => (
            <span key={label} className={`rounded-md px-3 py-2 ${cls}`}>
              {label}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
