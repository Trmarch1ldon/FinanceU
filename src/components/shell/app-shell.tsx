"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, MotionConfig, type Transition } from "motion/react";

import { Sidebar } from "./sidebar";

const STORAGE_KEY = "fu:sidebar";

/** `<html data-sidebar>` is the single source of truth for the collapsed state: an
 *  inline script in layout.tsx sets it before first paint, CSS sizes the rail from it,
 *  and React subscribes to it here. Keeping a parallel useState copy would mean two
 *  things to keep in sync and a hydration mismatch on the first render. */
function subscribeToSidebar(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-sidebar"],
  });
  return () => observer.disconnect();
}

const readSidebar = () => document.documentElement.getAttribute("data-sidebar") === "collapsed";

/** The server has no DOM, so it always renders expanded; the pre-paint script means
 *  the user never sees that state. */
const readSidebarOnServer = () => false;

/** No overshoot: a panel that bounces past its edge reads as a toy, not a terminal. */
const DRAWER_SLIDE: Transition = { type: "spring", bounce: 0, visualDuration: 0.28 };
const BACKDROP_FADE: Transition = { duration: 0.2, ease: "easeOut" };

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribeToSidebar, readSidebar, readSidebarOnServer);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next = root.getAttribute("data-sidebar") !== "collapsed";

    if (next) root.setAttribute("data-sidebar", "collapsed");
    else root.removeAttribute("data-sidebar");

    try {
      localStorage.setItem(STORAGE_KEY, next ? "collapsed" : "expanded");
    } catch {
      // Private windows and blocked site data. The toggle still works this session.
    }
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, closeDrawer]);

  return (
    // "user" drops transform and layout animation for reduced-motion users but keeps the
    // fades, so the drawer still appears and disappears rather than teleporting.
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        {/* Desktop: fixed rail whose width animates with --sidebar-w. */}
        <aside
          className="fixed inset-y-0 left-0 z-40 hidden w-(--sidebar-w) transition-[width] duration-[250ms] ease-out md:block"
          aria-label="Sidebar"
        >
          <Sidebar collapsed={collapsed} onToggle={toggle} />
        </aside>

        {/* Mobile: hamburger + slide-out drawer. */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="grid size-9 place-items-center rounded-md border border-border text-muted transition-colors hover:text-fg"
          >
            <Menu size={18} aria-hidden />
          </button>
          <span className="font-mono text-[13px] tracking-[0.14em]">
            FINANCE<span className="text-accent">U</span>
          </span>
        </header>

        {/* React unmounts on close, so only AnimatePresence can give the drawer an exit. */}
        <AnimatePresence>
          {drawerOpen && (
            <div key="drawer" className="fixed inset-0 z-50 md:hidden">
              <motion.button
                type="button"
                aria-label="Close navigation"
                onClick={closeDrawer}
                className="absolute inset-0 bg-black/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={BACKDROP_FADE}
              />
              <motion.div
                data-drawer
                className="absolute inset-y-0 left-0 w-[280px]"
                initial={{ transform: "translateX(-100%)" }}
                animate={{ transform: "translateX(0%)" }}
                exit={{ transform: "translateX(-100%)" }}
                transition={DRAWER_SLIDE}
              >
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close navigation"
                  className="absolute top-3 -right-11 grid size-9 place-items-center rounded-md border border-border bg-panel text-muted"
                >
                  <X size={16} aria-hidden />
                </button>
                {/* Drawer is never collapsed, and has no collapse toggle — closing it is the
                    collapse. Navigating from it closes it, so a tap never leaves the page
                    hidden behind the panel. */}
                <Sidebar collapsed={false} onNavigate={closeDrawer} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <main className="transition-[padding] duration-[250ms] ease-out md:pl-(--sidebar-w)">
          {children}
        </main>
      </div>
    </MotionConfig>
  );
}
