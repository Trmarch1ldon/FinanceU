import Link from "next/link";

import type { UserSummary } from "@/types/dashboard";

type UserChipProps = { user: UserSummary };

export function UserChip({ user }: UserChipProps) {
  return (
    <Link
      href="/profile"
      className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-panel-hover collapsed:justify-center collapsed:p-0"
    >
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-md border border-border-strong bg-panel font-mono text-[13px] text-accent"
      >
        {user.initials}
      </span>
      <span className="min-w-0 collapsed:hidden">
        <span className="block truncate text-[13px] text-fg">{user.name}</span>
        <span className="block truncate font-mono text-[11px] text-muted">@{user.handle}</span>
      </span>
    </Link>
  );
}
