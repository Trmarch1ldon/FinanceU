/**
 * Terminal cell flash: the background lights green or red for a moment when a number changes.
 * Web Animations, not a CSS class toggle, so restarting it mid-flash needs no forced reflow —
 * dozens of cells can flash a second without layout work.
 */
import { TERMINAL as T } from "./terminal-config";

const FLASH = {
  up: "rgba(0, 192, 118, 0.38)",
  down: "rgba(255, 77, 79, 0.38)",
} as const;

let reduced: boolean | null = null;
const prefersReducedMotion = () =>
  (reduced ??= window.matchMedia("(prefers-reduced-motion: reduce)").matches);

export function flash(el: HTMLElement, direction: "up" | "down") {
  if (prefersReducedMotion()) return;
  el.animate([{ backgroundColor: FLASH[direction] }, { backgroundColor: "transparent" }], {
    duration: T.flashMs,
    easing: "ease-out",
  });
}

/** Write a number's text and flash the cell if it moved. Returns the direction, if any. */
export function setCell(el: HTMLElement | null, text: string, value: number, previous: number) {
  if (!el || el.textContent === text) return;
  el.textContent = text;
  if (value !== previous) flash(el, value > previous ? "up" : "down");
}
