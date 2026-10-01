"use client";

import {
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
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
  { href: "/play/survival", label: "Survival", icon: TrendingDown },
  { href: "/play/daily", label: "Daily", icon: CalendarDays },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/friends", label: "Friends", icon: Users },
];

const SETTINGS_NAV: NavEntry[] = [{ href: "/settings", label: "Settings", icon: Settings }];

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-panel">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3 collapsed:px-2">
        <span className="font-mono text-[13px] tracking-[0.14em] text-fg collapsed:hidden">
          FINANCE<span className="text-accent">U</span>
          <span
            aria-hidden
            className="cursor-blink ml-1 inline-block w-[7px] translate-y-px bg-accent align-middle text-transparent"
          >
            &nbsp;
          </span>
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-panel-hover hover:text-fg"
        >
          {collapsed ? (
            <PanelLeftOpen size={16} aria-hidden />
          ) : (
            <PanelLeftClose size={16} aria-hidden />
          )}
        </button>
      </div>

      <div className="space-y-3 px-3 py-3 collapsed:px-2">
        <UserChip user={mockUser} />
        <RankBadge xp={mockUser.xp} />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <NavList items={NAV} ariaLabel="Main" onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-border px-2 py-2">
        <NavList items={SETTINGS_NAV} ariaLabel="Settings" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
