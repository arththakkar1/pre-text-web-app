"use client";

import React, { useEffect, useRef } from "react";
import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import { LINE_HEIGHT } from "../constants";

export function CanvasRenderer({
  text,
  font,
  maxWidth,
}: {
  text: string;
  font: string;
  maxWidth: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const prepared = prepareWithSegments(text, font);
      const { lines, height } = layoutWithLines(prepared, maxWidth, LINE_HEIGHT);

      const dpr = window.devicePixelRatio || 1;
      const pad = 24;
      const cw = maxWidth + pad * 2;
      const ch = Math.max(height + pad * 2, 80);

      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.scale(dpr, dpr);

      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, cw, ch);

      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pad + maxWidth, 0);
      ctx.lineTo(pad + maxWidth, ch);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = font;
      ctx.textBaseline = "top";

      lines.forEach((line, i) => {
        const y = pad + i * LINE_HEIGHT;
        ctx.fillStyle = "rgba(249,115,22,0.07)";
        ctx.fillRect(pad + line.width, y, maxWidth - line.width, LINE_HEIGHT - 4);
        ctx.fillStyle = "#fafaf9";
        ctx.fillText(line.text, pad, y + 4);
      });

      ctx.strokeStyle = "#27272a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, 0);
      ctx.lineTo(pad, ch);
      ctx.stroke();
    } catch {
      // Handle parsing robustly across unexpected segments
    }
  }, [text, font, maxWidth]);

  return (
    <div className="overflow-x-auto">
      <canvas ref={canvasRef} className="block rounded-lg" />
    </div>
  );
}
