"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { motion, type Transition } from "motion/react";

import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  isHighlighted: boolean;
  isCurrent: boolean;
  highlightId: string;
  onSelect: (href: string) => void;
};

/** A spring so a second click mid-slide redirects smoothly instead of restarting. */
const HIGHLIGHT_SLIDE: Transition = { type: "spring", bounce: 0, visualDuration: 0.28 };

/** One nav row. The highlight (fill + edge marker) is a single shared layout element:
 *  it renders only in the highlighted row, and Motion slides it from the previous one. */
export function NavItem({
  href,
  label,
  icon: Icon,
  isHighlighted,
  isCurrent,
  highlightId,
  onSelect,
}: NavItemProps) {
  return (
    <li className="group/item relative">
      {isHighlighted && (
        <motion.span
          layoutId={highlightId}
          transition={HIGHLIGHT_SLIDE}
          aria-hidden
          className="absolute inset-0 rounded-md bg-accent-dim"
        >
          <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-accent" />
        </motion.span>
      )}

      <Link
        href={href}
        onClick={() => onSelect(href)}
        aria-current={isCurrent ? "page" : undefined}
        className={cn(
          // pl-5 inside the nav's px-2 centres the icon at 36px — the middle of the
          // collapsed rail — so icons hold still while the rail narrows.
          "relative flex items-center gap-3 overflow-hidden rounded-md py-2 pr-3 pl-5 transition-colors",
          isHighlighted ? "text-accent" : "text-muted hover:bg-panel-hover hover:text-fg",
        )}
      >
        <Icon size={16} strokeWidth={1.75} className="shrink-0" aria-hidden />
        <span className="truncate text-[13px] whitespace-nowrap transition-opacity duration-150 collapsed:opacity-0">
          {label}
        </span>
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
