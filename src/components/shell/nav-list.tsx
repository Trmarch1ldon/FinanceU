"use client";

import type { LucideIcon } from "lucide-react";

import { NavItem } from "./nav-item";

export type NavEntry = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavListProps = {
  items: NavEntry[];
  ariaLabel: string;
  /** The row the highlight sits on — the clicked one, until the route lands. */
  highlightedHref: string | undefined;
  /** The row for the route actually showing, for aria-current. */
  currentHref: string | undefined;
  /** Shared by every list in one sidebar, so the highlight travels between them. */
  highlightId: string;
  onSelect: (href: string) => void;
};

export function NavList({
  items,
  ariaLabel,
  highlightedHref,
  currentHref,
  highlightId,
  onSelect,
}: NavListProps) {
  return (
    <ul aria-label={ariaLabel} className="space-y-0.5">
      {items.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          isHighlighted={item.href === highlightedHref}
          isCurrent={item.href === currentHref}
          highlightId={highlightId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
