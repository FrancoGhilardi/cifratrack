"use client";

import { useEffect, useRef } from "react";
import { generateBalanceCurve } from "./balance-curve.points";

const POINT_COUNT = 20;
const DURATION_MS = 1400;

/** Convierte "oklch(...)"/"#hex" computado a un color usable por Canvas. */
function readAccent(el: HTMLElement): string {
  const v = getComputedStyle(el).getPropertyValue("--auth-panel-accent").trim();
  return v || "#3FCBA4";
}

/**
 * Curva de saldo ascendente dibujada en Canvas. Decorativa (aria-hidden).
 * Se adapta al tema (relee el token de acento) y respeta reduced-motion.
 */
export function BalanceCurve() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    if (!ctx || !parent) return;

    const pts = generateBalanceCurve(POINT_COUNT);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let start: number | null = null;

    const hexOrColorWithAlpha = (color: string, alpha: number) => {
      // Para tokens no-hex (oklch), usamos globalAlpha en su lugar.
      if (color.startsWith("#")) {
        const h = color.replace("#", "");
        const full =
          h.length === 3
            ? h
                .split("")
                .map((c) => c + c)
                .join("")
            : h;
        const r = parseInt(full.slice(0, 2), 16);
        const g = parseInt(full.slice(2, 4), 16);
        const b = parseInt(full.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      return color;
    };

    const draw = (progress: number) => {
      const rect = parent.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      const accent = readAccent(parent);
      const isHex = accent.startsWith("#");

      ctx.clearRect(0, 0, W, H);

      const baseY = H * 0.92;
      const topY = H * 0.3;
      const n = pts.length;
      const reveal = Math.max(2, Math.floor(progress * (n - 1)) + 1);
      const X = (i: number) => W * pts[i].x;
      const Y = (i: number) => baseY - (baseY - topY) * pts[i].y;

      // grilla tenue
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let g = 1; g <= 3; g++) {
        const gy = baseY - (baseY - topY) * (g / 3.4);
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // relleno de área
      ctx.save();
      if (isHex) {
        const grad = ctx.createLinearGradient(0, topY, 0, baseY);
        grad.addColorStop(0, hexOrColorWithAlpha(accent, 0.16));
        grad.addColorStop(1, hexOrColorWithAlpha(accent, 0));
        ctx.fillStyle = grad;
      } else {
        ctx.globalAlpha = 0.14;
        ctx.fillStyle = accent;
      }
      ctx.beginPath();
      ctx.moveTo(X(0), Y(0));
      for (let i = 1; i < reveal; i++) ctx.lineTo(X(i), Y(i));
      ctx.lineTo(X(reveal - 1), baseY);
      ctx.lineTo(X(0), baseY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // línea
      ctx.beginPath();
      ctx.moveTo(X(0), Y(0));
      for (let i = 1; i < reveal; i++) ctx.lineTo(X(i), Y(i));
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();

      // punto final
      const ei = reveal - 1;
      ctx.beginPath();
      ctx.arc(X(ei), Y(ei), 4, 0, Math.PI * 2);
      ctx.fillStyle = accent;
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

    const animate = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      draw(eased);
      if (p < 1) raf = requestAnimationFrame(animate);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    if (prefersReduced) {
      draw(1);
    } else {
      raf = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
