"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
  onNavigate?: () => void;
};

const isActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

/**
 * A nav list with one marker that travels between rows.
 *
 * The marker is positioned by writing to its style directly rather than through state:
 * an effect that calls setState would cascade a render, and the DOM is the thing being
 * synchronised here anyway. It also moves on pointerdown, so the click is acknowledged
 * in the same frame instead of after the route resolves.
 */
export function NavList({ items, ariaLabel, onNavigate }: NavListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const hasPlaced = useRef(false);
  const pathname = usePathname();

  const place = useCallback((row: HTMLElement | null, animate: boolean) => {
    const marker = markerRef.current;
    if (!marker) return;

    if (!row) {
      marker.style.opacity = "0";
      return;
    }

    // First placement shouldn't slide in from the top of the list.
    if (!animate) marker.style.transitionDuration = "0ms";

    marker.style.opacity = "1";
    marker.style.height = `${row.offsetHeight - 8}px`;
    marker.style.transform = `translateY(${row.offsetTop + 4}px)`;

    if (!animate) {
      requestAnimationFrame(() => {
        marker.style.transitionDuration = "";
      });
    }
  }, []);

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]') ?? null;
    place(active, hasPlaced.current);
    hasPlaced.current = true;
  }, [pathname, place]);

  const handlePointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    const row = (event.target as HTMLElement).closest("li");
    if (row) place(row, true);
  };

  return (
    <div className="relative">
      <span
        ref={markerRef}
        aria-hidden
        className="absolute left-0 w-0.5 rounded-full bg-accent opacity-0 transition-[transform,height] duration-[280ms] ease-out"
      />
      <ul
        ref={listRef}
        aria-label={ariaLabel}
        className="space-y-0.5"
        onPointerDown={handlePointerDown}
      >
        {items.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={isActive(item.href, pathname)}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
}
