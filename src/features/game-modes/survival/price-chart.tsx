"use client";

import { useEffect, useRef } from "react";

import type { LiveState } from "@/features/game-modes/types";

import { MARGIN_CALL as C } from "./config";
import { readMarket } from "./market";

type PriceChartProps = {
  live: LiveState;
  /** "live" scrolls the last minute; "full" fits the whole run, for the game-over screen. */
  span: "live" | "full";
  className?: string;
};

type Palette = Record<"up" | "down" | "muted" | "border" | "fg" | "panel" | "font", string>;

const AXIS_W = 64;
const PAD_TOP = 12;
const PAD_BOTTOM = 8;

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    up: v("--up"),
    down: v("--down"),
    muted: v("--muted"),
    border: v("--border"),
    fg: v("--fg"),
    panel: v("--panel"),
    // Canvas can't resolve var(), so read the family next/font registered on <body>.
    font: `10px ${getComputedStyle(document.body).getPropertyValue("--font-plex-mono").trim() || "ui-monospace"}, monospace`,
  };
}

/** `#rrggbb` at an alpha, for fills — canvas can't apply opacity to a CSS variable. */
function alpha(hex: string, a: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function draw(
  canvas: HTMLCanvasElement,
  live: LiveState,
  span: PriceChartProps["span"],
  p: Palette,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const { history, marks, ath, price } = readMarket(live.get().modeState);
  if (history.length === 0) return;

  const plotW = width - AXIS_W;
  const plotH = height - PAD_TOP - PAD_BOTTOM;

  // Live: a fixed one-minute window that scrolls once full. Full: the whole run.
  const windowSamples =
    span === "live" ? (C.liveWindowSec * 1000) / C.sampleMs : Math.max(history.length - 1, 1);
  const first = Math.max(0, history.length - 1 - windowSamples);

  let visibleMax: number = C.startPrice;
  for (let i = first; i < history.length; i++) visibleMax = Math.max(visibleMax, history[i]);
  // Zero is always on the axis: the distance to a margin call is the whole point.
  const yMax = Math.max(visibleMax, ath) * 1.12;

  const x = (i: number) => ((i - first) / windowSamples) * plotW;
  const y = (value: number) => PAD_TOP + plotH - (value / yMax) * plotH;

  // Grid and price axis.
  ctx.font = p.font;
  ctx.textBaseline = "middle";
  ctx.lineWidth = 1;
  const step = yMax > 400 ? 100 : yMax > 200 ? 50 : 25;
  for (let level = 0; level <= yMax; level += step) {
    const gy = Math.round(y(level)) + 0.5;
    ctx.strokeStyle = p.border;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(plotW, gy);
    ctx.stroke();
    ctx.fillStyle = p.muted;
    ctx.fillText(`$${level}`, plotW + 8, gy);
  }

  // Danger zone: the band a single wrong answer can't survive.
  ctx.fillStyle = alpha(p.down, 0.08);
  ctx.fillRect(0, y(C.dangerPrice), plotW, y(0) - y(C.dangerPrice));

  // All-time high, dashed.
  const athY = Math.round(y(ath)) + 0.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = p.muted;
  ctx.beginPath();
  ctx.moveTo(0, athY);
  ctx.lineTo(plotW, athY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = p.muted;
  ctx.fillText("ATH", 4, athY - 7);

  // Price line, coloured by where it stands against the open.
  const trend = price >= C.startPrice ? p.up : p.down;
  ctx.beginPath();
  for (let i = first; i < history.length; i++) {
    if (i === first) ctx.moveTo(x(i), y(history[i]));
    else ctx.lineTo(x(i), y(history[i]));
  }
  ctx.strokeStyle = trend;
  ctx.lineWidth = 1.75;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Area under the line, faint.
  const lastX = x(history.length - 1);
  ctx.lineTo(lastX, y(0));
  ctx.lineTo(x(first), y(0));
  ctx.closePath();
  const fill = ctx.createLinearGradient(0, PAD_TOP, 0, y(0));
  fill.addColorStop(0, alpha(trend, 0.16));
  fill.addColorStop(1, alpha(trend, 0));
  ctx.fillStyle = fill;
  ctx.fill();

  // Answer markers.
  for (let m = 0; m < marks.length; m += 2) {
    const index = Math.min(marks[m], history.length - 1);
    if (index < first) continue;
    ctx.beginPath();
    ctx.arc(x(index), y(history[index]), 3, 0, Math.PI * 2);
    ctx.fillStyle = marks[m + 1] > 0 ? p.up : p.down;
    ctx.fill();
    ctx.strokeStyle = p.panel;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Last price: a tag on the axis, like a terminal's.
  const lastY = y(history[history.length - 1]);
  ctx.fillStyle = trend;
  ctx.fillRect(plotW + 2, lastY - 8, AXIS_W - 4, 16);
  ctx.fillStyle = p.panel;
  ctx.fillText(history[history.length - 1].toFixed(2), plotW + 8, lastY);
}

/**
 * The run's price chart, on canvas. It subscribes to the session's live state and redraws at
 * most once a frame — React never re-renders for a tick.
 */
export function PriceChart({ live, span, className }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const palette = readPalette();
    let frame: number | null = null;
    const schedule = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        draw(canvas, live, span, palette);
      });
    };

    schedule();
    const unsubscribe = live.subscribe(schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);

    return () => {
      unsubscribe();
      resize.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [live, span]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Share price chart for this run"
    />
  );
}
