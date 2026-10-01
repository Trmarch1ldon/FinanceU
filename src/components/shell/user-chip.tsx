import Link from "next/link";

import type { UserSummary } from "@/types/dashboard";

type UserChipProps = { user: UserSummary };

export function UserChip({ user }: UserChipProps) {
  return (
    <Link
      href="/profile"
      // p-1.5 inside the sidebar's px-3 puts the avatar's centre at 36px — the middle of
      // the collapsed rail — so it holds still while the rail narrows around it.
      className="flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-panel-hover collapsed:hover:bg-transparent"
    >
      <span
        aria-hidden
        className="grid size-9 shrink-0 place-items-center rounded-md border border-border-strong bg-panel font-mono text-[13px] text-accent"
      >
        {user.initials}
      </span>
      <span className="min-w-0 transition-opacity duration-150 collapsed:opacity-0">
        <span className="block truncate text-[13px] text-fg">{user.name}</span>
        <span className="block truncate font-mono text-[11px] text-muted">@{user.handle}</span>
      </span>
    </Link>
  );
}
