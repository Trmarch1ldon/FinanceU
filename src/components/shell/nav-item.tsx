"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate?: () => void;
};

export function NavItem({ href, label, icon: Icon, onNavigate }: NavItemProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <li className="group/item relative">
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
        {/* Active marker is a rail, not a fill — reads as a terminal selection. */}
        <span
          aria-hidden
          className={cn(
            "absolute top-1 bottom-1 left-0 w-0.5 rounded-full transition-colors",
            active ? "bg-accent" : "bg-transparent",
          )}
        />
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
