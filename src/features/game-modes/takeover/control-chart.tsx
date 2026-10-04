"use client";

import { useEffect, useRef } from "react";

import type { MatchView } from "@/lib/engine/versus/player";

import { TAKEOVER as C } from "./config";
import type { MatchState } from "./match/types";

type ControlChartProps = { view: MatchView<MatchState>; className?: string };

type Palette = Record<"amber" | "rival" | "up" | "down" | "muted" | "border" | "font", string>;

const AXIS_W = 44;

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const mono = getComputedStyle(document.body).getPropertyValue("--font-plex-mono").trim();
  return {
    amber: v("--terminal-amber"),
    rival: v("--rival"),
    up: v("--up"),
    down: v("--down"),
    muted: v("--muted"),
    border: v("--border"),
    font: `10px ${mono || "ui-monospace"}, monospace`,
  };
}

function alpha(hex: string, a: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function draw(canvas: HTMLCanvasElement, state: MatchState, p: Palette) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width === 0 || height === 0) return;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.font = p.font;
  ctx.textBaseline = "middle";

  const plotW = width - AXIS_W;
  const pad = 8;
  // The x axis is the whole match, so the line grows across it; sudden death stretches it.
  const span = Math.max(C.matchMs, state.elapsed + C.sampleMs);
  const x = (t: number) => (t / span) * plotW;
  const y = (control: number) => pad + (height - pad * 2) * (1 - control / 100);

  // Grid at 25 / 50 / 75 / 100.
  for (const level of [0, 25, 50, 75, 100]) {
    const gy = Math.round(y(level)) + 0.5;
    ctx.strokeStyle = p.border;
    ctx.setLineDash(level === 50 ? [5, 5] : []);
    ctx.strokeStyle = level === 50 ? p.muted : p.border;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(plotW, gy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = p.muted;
    ctx.fillText(`${level}%`, plotW + 6, gy);
  }

  // Points: every sample, then the live value now.
  const points: [number, number][] = state.history.map((c, i) => [x(i * C.sampleMs), y(c)]);
  points.push([x(state.elapsed), y(state.control)]);

  // Shade between the line and 50%: amber where the player holds the majority, cyan where the
  // opponent does. Two clipped fills of the same shape.
  const mid = y(50);
  const area = new Path2D();
  area.moveTo(points[0][0], mid);
  for (const [px, py] of points) area.lineTo(px, py);
  area.lineTo(points[points.length - 1][0], mid);
  area.closePath();
  for (const [top, color] of [
    [true, p.amber],
    [false, p.rival],
  ] as const) {
    ctx.save();
    ctx.beginPath();
    if (top) ctx.rect(0, 0, plotW, mid);
    else ctx.rect(0, mid, plotW, height - mid);
    ctx.clip();
    ctx.fillStyle = alpha(color, 0.22);
    ctx.fill(area);
    ctx.restore();
  }

  // The line itself.
  ctx.beginPath();
  points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.strokeStyle = state.control >= 50 ? p.amber : p.rival;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.lineWidth = 1;

  // Answer markers: green right, red wrong — ringed in the colour of whoever answered.
  for (let i = 0; i < state.marks.length; i += 3) {
    const sample = Math.min(state.marks[i], state.history.length - 1);
    const isCorrect = state.marks[i + 2] === 1;
    ctx.beginPath();
    ctx.arc(x(sample * C.sampleMs), y(state.history[sample]), 3, 0, Math.PI * 2);
    ctx.fillStyle = isCorrect ? p.up : p.down;
    ctx.fill();
    ctx.strokeStyle = state.marks[i + 1] === 1 ? p.amber : p.rival;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  // Live point.
  const [lx, ly] = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = state.control >= 50 ? p.amber : p.rival;
  ctx.fill();
}

/** Control % over the match. Canvas, redrawn at most once a frame from the match feed. */
export function ControlChart({ view, className }: ControlChartProps) {
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
        draw(canvas, view.get(), palette);
      });
    };
    schedule();
    const unsubscribe = view.subscribe(schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);
    return () => {
      unsubscribe();
      resize.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [view]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Control of the company over the match"
    />
  );
}
