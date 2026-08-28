"use client";

import * as React from "react";
import type { BalanceSeriesPointDTO } from "@/entities/dashboard/model/balance-series.dto";

interface BalanceCurveChartProps {
  points: BalanceSeriesPointDTO[];
  /** Color de la curva según el signo del saldo de cierre. */
  tone: "pos" | "neg";
}

const DURATION_MS = 900;
const PAD_X = 22;
const PAD_TOP = 14;
const PAD_BOTTOM = 24;

/**
 * Curva de saldo acumulado dibujada en Canvas. Decorativa (aria-hidden):
 * las cifras que representa ya están en texto dentro del hero.
 * Relee el token de color en cada frame, así sigue al tema.
 */
export function BalanceCurveChart({ points, tone }: BalanceCurveChartProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    if (!ctx || !parent || points.length < 2) return;

    const values = points.map((point) => point.cumulative);
    const rawMin = Math.min(0, ...values);
    const rawMax = Math.max(0, ...values);
    const span = rawMax - rawMin || 1;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let start: number | null = null;

    const draw = (progress: number) => {
      const rect = parent.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width === 0 || height === 0) return;

      const styles = getComputedStyle(parent);
      const color =
        styles
          .getPropertyValue(tone === "pos" ? "--app-pos" : "--app-neg")
          .trim() || "#1F7A63";
      const grid = styles.getPropertyValue("--border").trim() || "#e5e5e5";

      const baseY = height - PAD_BOTTOM;
      const topY = PAD_TOP;
      const x = (index: number) =>
        PAD_X + (width - PAD_X * 2) * (index / (points.length - 1));
      const y = (value: number) =>
        baseY - (baseY - topY) * ((value - rawMin) / span);

      ctx.clearRect(0, 0, width, height);

      // Grilla tenue
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      for (let line = 1; line <= 2; line++) {
        const lineY = baseY - (baseY - topY) * (line / 2.6);
        ctx.beginPath();
        ctx.moveTo(PAD_X, lineY);
        ctx.lineTo(width - PAD_X, lineY);
        ctx.stroke();
      }

      const revealed = Math.max(
        2,
        Math.floor(progress * (points.length - 1)) + 1,
      );

      // Relleno de área
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.moveTo(x(0), y(values[0]));
      for (let i = 1; i < revealed; i++) ctx.lineTo(x(i), y(values[i]));
      ctx.lineTo(x(revealed - 1), baseY);
      ctx.lineTo(x(0), baseY);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      // Línea
      ctx.beginPath();
      ctx.moveTo(x(0), y(values[0]));
      for (let i = 1; i < revealed; i++) ctx.lineTo(x(i), y(values[i]));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();

      // Punto final
      const last = revealed - 1;
      ctx.beginPath();
      ctx.arc(x(last), y(values[last]), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(1);
    };

    const animate = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      draw(eased);
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();

    if (!prefersReduced) {
      raf = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [points, tone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
