"use client";

import { useEffect, useRef } from "react";

import type { LiveState } from "@/features/game-modes/types";

import { MARGIN_CALL as C } from "../config";
import { readMarket } from "../market";
import { buildCandles, buildMomentum, buildVolume, movingAverage, unpackMarks } from "./candles";
import { TERMINAL as T } from "./terminal-config";

type CandleChartProps = {
  live: LiveState;
  /** "live" shows the last few dozen candles; "full" fits the whole run (tear sheet). */
  span: "live" | "full";
  className?: string;
};

type Palette = {
  up: string;
  down: string;
  muted: string;
  bar: string;
  border: string;
  panel: string;
  amber: string;
  font: string;
};

const AXIS_W = 58;

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  // Canvas can't resolve var(), so read the family next/font registered on <body>.
  const mono = getComputedStyle(document.body).getPropertyValue("--font-plex-mono").trim();
  return {
    up: v("--up"),
    down: v("--down"),
    muted: v("--muted"),
    bar: v("--bar"),
    border: v("--border"),
    panel: v("--panel"),
    amber: v("--terminal-amber"),
    font: `10px ${mono || "ui-monospace"}, monospace`,
  };
}

function alpha(hex: string, a: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function draw(
  canvas: HTMLCanvasElement,
  live: LiveState,
  span: CandleChartProps["span"],
  p: Palette,
) {
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

  const { history, marks, ath, price } = readMarket(live.get().modeState);
  if (history.length === 0) return;

  const candles = buildCandles(history);
  // The forming candle closes on the live price, not the last 100ms sample — otherwise a run
  // that ends between samples shows a last price that isn't $0.
  const forming = candles[candles.length - 1];
  forming.close = price;
  forming.high = Math.max(forming.high, price);
  forming.low = Math.min(forming.low, price);
  const unpacked = unpackMarks(marks);
  const volume = buildVolume(candles.length, unpacked);
  const momentum = buildMomentum(candles.length, unpacked);
  const maShort = movingAverage(candles, T.maShort);
  const maLong = movingAverage(candles, T.maLong);

  // Live: the window grows with the run (20 → 45 slots), so an opening minute isn't four
  // candles lost in an empty chart, then scrolls once full.
  const slots =
    span === "live"
      ? Math.min(T.liveCandles, Math.max(20, candles.length + 4))
      : Math.max(candles.length, 10);
  const first = Math.max(0, candles.length - slots);

  // Panes: price on top, then volume, then momentum.
  const plotW = width - AXIS_W;
  const gap = 6;
  const priceH = Math.round(height * 0.64);
  const volTop = priceH + gap;
  const volH = Math.round(height * 0.14);
  const momTop = volTop + volH + gap;
  const momH = height - momTop - 2;

  const slotW = plotW / slots;
  const bodyW = Math.max(1, Math.min(14, slotW * 0.62));
  const cx = (i: number) => (i - first) * slotW + slotW / 2;

  // Price scale: zero always on the axis — the distance to a margin call is the game.
  let top: number = C.startPrice;
  for (let i = first; i < candles.length; i++) top = Math.max(top, candles[i].high);
  const yMax = Math.max(top, ath) * 1.1;
  const y = (value: number) => 8 + (priceH - 12) * (1 - value / yMax);

  // Grid + axis labels.
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
    ctx.fillText(level.toFixed(0), plotW + 6, gy);
  }

  // Danger band.
  ctx.fillStyle = alpha(p.down, 0.07);
  ctx.fillRect(0, y(C.dangerPrice), plotW, y(0) - y(C.dangerPrice));

  // ATH.
  const athY = Math.round(y(ath)) + 0.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = alpha(p.amber, 0.7);
  ctx.beginPath();
  ctx.moveTo(0, athY);
  ctx.lineTo(plotW, athY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = p.amber;
  ctx.fillText(`ATH ${ath.toFixed(2)}`, 4, athY - 7);

  // Candles.
  for (let i = first; i < candles.length; i++) {
    const c = candles[i];
    const color = c.close >= c.open ? p.up : p.down;
    const x = Math.round(cx(i)) + 0.5;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y(c.high));
    ctx.lineTo(x, y(c.low));
    ctx.stroke();
    const yo = y(c.open);
    const yc = y(c.close);
    ctx.fillStyle = color;
    ctx.fillRect(x - bodyW / 2, Math.min(yo, yc), bodyW, Math.max(1, Math.abs(yc - yo)));
  }

  // Moving averages, muted so they inform without competing with price.
  const drawMa = (series: (number | null)[], color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    let started = false;
    for (let i = first; i < series.length; i++) {
      const value = series[i];
      if (value === null) continue;
      if (!started) ctx.moveTo(cx(i), y(value));
      else ctx.lineTo(cx(i), y(value));
      started = true;
    }
    ctx.stroke();
    ctx.lineWidth = 1;
  };
  drawMa(maLong, p.bar);
  drawMa(maShort, alpha(p.muted, 0.8));

  // Last-price tag, coloured by the latest move.
  const last = candles[candles.length - 1];
  const tagColor = last.close >= last.open ? p.up : p.down;
  const tagY = y(last.close);
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = alpha(tagColor, 0.6);
  ctx.beginPath();
  ctx.moveTo(cx(candles.length - 1), Math.round(tagY) + 0.5);
  ctx.lineTo(plotW, Math.round(tagY) + 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = tagColor;
  ctx.fillRect(plotW + 1, tagY - 8, AXIS_W - 2, 16);
  ctx.fillStyle = "#0a0a0a";
  ctx.fillText(last.close.toFixed(2), plotW + 6, tagY);

  // Volume pane.
  ctx.strokeStyle = p.border;
  ctx.beginPath();
  ctx.moveTo(0, volTop - gap / 2 + 0.5);
  ctx.lineTo(width, volTop - gap / 2 + 0.5);
  ctx.stroke();
  let volMax = 1;
  for (let i = first; i < volume.length; i++) volMax = Math.max(volMax, volume[i].size);
  for (let i = first; i < volume.length; i++) {
    const bar = volume[i];
    const h = (bar.size / volMax) * (volH - 4);
    ctx.fillStyle =
      bar.tone === "up" ? alpha(p.up, 0.85) : bar.tone === "down" ? alpha(p.down, 0.85) : p.bar;
    ctx.fillRect(cx(i) - bodyW / 2, volTop + volH - h, bodyW, h);
  }
  ctx.fillStyle = p.muted;
  ctx.fillText("VOL", plotW + 6, volTop + 8);

  // Momentum pane, 0–100 with 30/70 guides.
  ctx.strokeStyle = p.border;
  ctx.beginPath();
  ctx.moveTo(0, momTop - gap / 2 + 0.5);
  ctx.lineTo(width, momTop - gap / 2 + 0.5);
  ctx.stroke();
  const my = (value: number) => momTop + 2 + (momH - 4) * (1 - value / 100);
  ctx.setLineDash([2, 4]);
  for (const guide of [30, 70]) {
    ctx.strokeStyle = p.border;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(my(guide)) + 0.5);
    ctx.lineTo(plotW, Math.round(my(guide)) + 0.5);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.strokeStyle = p.amber;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  for (let i = first; i < momentum.length; i++) {
    if (i === first) ctx.moveTo(cx(i), my(momentum[i]));
    else ctx.lineTo(cx(i), my(momentum[i]));
  }
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = p.muted;
  ctx.fillText(`MOM ${momentum[momentum.length - 1].toFixed(0)}`, plotW + 6, momTop + 8);
}

/** Candles, MAs, volume and momentum on one canvas. Redraws at most once a frame from the
 *  live feed — React never re-renders for a tick. */
export function CandleChart({ live, span, className }: CandleChartProps) {
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
      aria-label="Candlestick chart with volume and momentum"
    />
  );
}
