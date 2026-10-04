"use client";

import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Swords,
  Timer,
  TrendingDown,
  Trophy,
  Users,
} from "lucide-react";

import { mockUser } from "@/data/mock/user";

import { NavList, type NavEntry } from "./nav-list";
import { RankBadge } from "./rank-badge";
import { UserChip } from "./user-chip";

const NAV: NavEntry[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/play/classic", label: "Classic", icon: ListChecks },
  { href: "/play/time-attack", label: "Time Attack", icon: Timer },
  { href: "/play/survival", label: "Margin Call", icon: TrendingDown },
  { href: "/play/takeover", label: "Hostile Takeover", icon: Swords },
  { href: "/play/daily", label: "Daily", icon: CalendarDays },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/friends", label: "Friends", icon: Users },
];

const SETTINGS_NAV: NavEntry[] = [{ href: "/settings", label: "Settings", icon: Settings }];

const isActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

const currentHrefFor = (pathname: string) =>
  [...NAV, ...SETTINGS_NAV].find((item) => isActive(item.href, pathname))?.href;

type SidebarProps = {
  collapsed: boolean;
  /** Omitted in the mobile drawer, which closes rather than collapses. */
  onToggle?: () => void;
  onNavigate?: () => void;
};

/**
 * Collapsing animates the rail's width, so nothing inside it may jump to a new position
 * when the state flips. Everything is anchored to stay put instead: icons and the avatar
 * sit at a fixed left offset that is already centred in the 72px rail, the toggle is
 * pinned to the right edge and rides it in, and text fades rather than disappearing.
 */
export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  // One highlight per sidebar instance, shared by both lists so it travels between them.
  // Unique per instance because the desktop rail and the drawer can both be mounted.
  const highlightId = useId();

  // The highlight follows the click immediately rather than the resolved route: on a
  // slow navigation, waiting for the pathname leaves the click unacknowledged. The
  // pending choice is dropped as soon as the route actually changes. Held here, not per
  // list, because both lists share the one highlight.
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [settledPath, setSettledPath] = useState(pathname);

  // Adjusted during render rather than in an effect, so a stale pending row never
  // paints for a frame after the route lands.
  if (pathname !== settledPath) {
    setSettledPath(pathname);
    setPendingHref(null);
  }

  const currentHref = currentHrefFor(pathname);
  const highlightedHref = pendingHref ?? currentHref;

  const handleSelect = (href: string) => {
    setPendingHref(href);
    onNavigate?.();
  };

  const listProps = { highlightedHref, currentHref, highlightId, onSelect: handleSelect };

  return (
    <div className="flex h-full flex-col border-r border-border bg-panel">
      <div className="relative flex h-14 shrink-0 items-center border-b border-border px-4">
        <span className="font-mono text-[13px] tracking-[0.14em] whitespace-nowrap text-fg transition-opacity duration-150 collapsed:pointer-events-none collapsed:opacity-0">
          FINANCE<span className="text-accent">U</span>
        </span>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="absolute top-1/2 right-5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted transition-colors hover:bg-panel-hover hover:text-fg"
          >
            {collapsed ? (
              <PanelLeftOpen size={16} aria-hidden />
            ) : (
              <PanelLeftClose size={16} aria-hidden />
            )}
          </button>
        )}
      </div>

      <div className="shrink-0 px-3 py-3">
        <UserChip user={mockUser} />
        <RankBadge xp={mockUser.xp} />
      </div>

      {/* Collapsed, the list is short enough to never scroll, and a scroll container
          would clip the hover labels that hang off the rail's edge. */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 collapsed:overflow-visible">
        <NavList items={NAV} ariaLabel="Main" {...listProps} />
      </nav>

      <div className="border-t border-border px-2 py-2">
        <NavList items={SETTINGS_NAV} ariaLabel="Settings" {...listProps} />
      </div>
    </div>
  );
}
