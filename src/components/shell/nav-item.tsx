"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
};

/** One nav row. The active marker is NOT here — NavList owns a single marker that
 *  travels between rows, so clicking one visibly moves the selection. */
export function NavItem({ href, label, icon: Icon, active, onNavigate }: NavItemProps) {
  return (
    <li className="group/item relative" data-active={active ? "true" : undefined}>
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex items-center gap-3 rounded-md py-2 pr-3 pl-4 transition-colors",
          "collapsed:justify-center collapsed:px-0",
          active ? "bg-accent-dim text-accent" : "text-muted hover:bg-panel-hover hover:text-fg",
        )}
      >
        <Icon size={16} strokeWidth={1.75} className="shrink-0" aria-hidden />
        <span className="truncate text-[13px] whitespace-nowrap collapsed:hidden">{label}</span>
      </Link>

      {/* Tooltip, collapsed only. Hidden from AT — the link already has its label. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-[calc(100%+8px)] z-50 hidden -translate-y-1/2",
          "panel px-2 py-1 text-[11px] whitespace-nowrap text-fg opacity-0 transition-opacity",
          "group-focus-within/item:opacity-100 group-hover/item:opacity-100 collapsed:block",
        )}
      >
        {label}
      </span>
    </li>
  );
}
