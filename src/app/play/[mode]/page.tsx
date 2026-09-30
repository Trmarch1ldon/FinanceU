/**
 * Game host — STUB.
 *
 * Resolves the mode from `src/features/game-modes/registry.ts` (task F3) and renders
 * its Component through the engine (task F4). Until those exist, it just echoes the
 * route param so the route is navigable.
 */
export default async function PlayPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold text-primary">{mode}</h1>
      <p className="mt-2 text-muted-foreground">
        Not built yet. The registry (F3) and engine (F4) land first, then the mode itself.
      </p>
    </main>
  );
}
