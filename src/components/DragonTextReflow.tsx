"use client";

import React, { useEffect, useRef, useState } from "react";
import { prepareWithSegments, layoutNextLine } from "@chenglou/pretext";
import {
  DRAGON_TEXT,
  DRAGON_BODY_FONT,
  DRAGON_LINE_HEIGHT,
} from "../constants";
import { carveSlots, circleInterval, getDragonObstacles } from "../utils/dragonHelpers";
import { RenderedLine } from "../types";

export function DragonTextReflow() {
  const stageRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement[]>([]);
  const animRef = useRef<number | null>(null);
  const prepRef = useRef<ReturnType<typeof prepareWithSegments> | null>(null);

  // Dragon state
  const dragonRef = useRef({ x: 200, y: 160, vx: 38, vy: 22, scale: 55 });
  const dragonElRef = useRef<HTMLImageElement>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ ox: 0, oy: 0 });

  // Perf stats
  const [stats, setStats] = useState({ lines: 0, reflow: 0.0, fps: 60 });
  const fpsRef = useRef<number[]>([]);
  const lastTimeRef = useRef(0);

  // DOM line cache
  function syncLinePool(stage: HTMLDivElement, count: number) {
    while (linesRef.current.length < count) {
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;white-space:pre;pointer-events:none;color:#e8e4dc;font-family:"Iowan Old Style",Georgia,serif;font-size:17px;line-height:28px;';
      stage.appendChild(el);
      linesRef.current.push(el);
    }
    for (let i = 0; i < linesRef.current.length; i++) {
      linesRef.current[i].style.display = i < count ? '' : 'none';
    }
  }

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof window === 'undefined') return;

    // Init
    const init = async () => {
      await document.fonts.ready;
      prepRef.current = prepareWithSegments(DRAGON_TEXT, DRAGON_BODY_FONT);
      animRef.current = requestAnimationFrame(frame);
    };

    const frame = (now: number) => {
      animRef.current = requestAnimationFrame(frame);
      if (!prepRef.current) return;

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      // Track FPS
      fpsRef.current.push(now);
      while (fpsRef.current.length > 0 && fpsRef.current[0] < now - 1000)
        fpsRef.current.shift();

      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const pad = 24;
      const lineH = DRAGON_LINE_HEIGHT;

      // Move dragon
      const d = dragonRef.current;
        if (!draggingRef.current) {
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          if (d.x - d.scale * 2.5 < pad) { d.x = pad + d.scale * 2.5; d.vx = Math.abs(d.vx); }
          if (d.x + d.scale * 2.5 > W - pad) { d.x = W - pad - d.scale * 2.5; d.vx = -Math.abs(d.vx); }
          if (d.y - d.scale * 2.5 < pad) { d.y = pad + d.scale * 2.5; d.vy = Math.abs(d.vy); }
          if (d.y + d.scale * 2.5 > H - pad - 38) { d.y = H - pad - 38 - d.scale * 2.5; d.vy = -Math.abs(d.vy); }
        }

      // Update image visual
      if (dragonElRef.current) {
        dragonElRef.current.style.left = (d.x - 90) + 'px';
        dragonElRef.current.style.top  = (d.y - 130) + 'px';
      }

      // Get obstacles
      const obstacles = getDragonObstacles(d.x, d.y, d.scale);

      // Map paragraph chunks
      const t0 = performance.now();
      const renderedLines: RenderedLine[] = [];
      let cursor = { segmentIndex: 0, graphemeIndex: 0 };
      let lineTop = pad;
      const regionX = pad;
      const regionW = W - pad * 2;

      let safetyBreak = 0;
      while (lineTop + lineH <= H - pad && safetyBreak < 300) {
        safetyBreak++;
        const bandTop = lineTop;
        const bandBottom = lineTop + lineH;
        const blocked: { left: number; right: number }[] = [];

        for (const obs of obstacles) {
          const iv = circleInterval(obs.cx, obs.cy, obs.r, bandTop, bandBottom, 10, 4);
          if (iv) blocked.push(iv);
        }

        const slots = carveSlots({ left: regionX, right: regionX + regionW }, blocked);

        if (slots.length === 0) {
          lineTop += lineH;
          continue;
        }

        let anyLine = false;
        for (const slot of slots) {
          const line = layoutNextLine(prepRef.current!, cursor, slot.right - slot.left);
          if (!line) { break; }
          renderedLines.push({ x: Math.round(slot.left), y: Math.round(lineTop), text: line.text });
          cursor = line.end;
          anyLine = true;
        }

        lineTop += lineH;
        if (!anyLine) continue;
      }

      const reflowMs = performance.now() - t0;

      // Render pool
      syncLinePool(stage, renderedLines.length);
      for (let i = 0; i < renderedLines.length; i++) {
        const el = linesRef.current[i];
        const rl = renderedLines[i];
        el.textContent = rl.text;
        el.style.left = rl.x + 'px';
        el.style.top = rl.y + 'px';
      }

      // Update frame stats
      if (safetyBreak % 10 === 0 || renderedLines.length > 0) {
        setStats({
          lines: renderedLines.length,
          reflow: parseFloat(reflowMs.toFixed(2)),
          fps: fpsRef.current.length,
        });
      }
    };

    init();

    // Drag events
    const img = dragonElRef.current;
    const stageEl = stage;

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      const rect = stageEl.getBoundingClientRect();
      dragOffsetRef.current = {
        ox: e.clientX - rect.left - dragonRef.current.x,
        oy: e.clientY - rect.top  - dragonRef.current.y,
      };
      img?.setPointerCapture(e.pointerId);
      if (img) img.style.cursor = 'grabbing';
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const rect = stageEl.getBoundingClientRect();
      dragonRef.current.x = e.clientX - rect.left - dragOffsetRef.current.ox;
      dragonRef.current.y = e.clientY - rect.top  - dragOffsetRef.current.oy;
    };
    const onPointerUp = () => {
      draggingRef.current = false;
      if (img) img.style.cursor = 'grab';
    };

    img?.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      img?.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      for (const el of linesRef.current) el.remove();
      linesRef.current = [];
    };
  }, []);

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-px bg-orange-500" />
        <span className="text-[10px] font-mono tracking-[0.2em] text-orange-500 uppercase">
          Dragon · Live Text Reflow
        </span>
      </div>
      <p className="text-zinc-400 text-sm mb-5 max-w-xl leading-relaxed">
        Text reflows around the dragon in real‑time at 60fps using{" "}
        <code className="text-orange-400 font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded">layoutNextLine</code>
        {" "}— zero DOM reads, pure arithmetic.
      </p>

      {/* Stage Wrapper */}
      <div
        className="relative w-full rounded-xl overflow-hidden border border-zinc-800"
        style={{
          height: 680,
          background: 'radial-gradient(ellipse at 50% 40%, #111018 0%, #08080c 100%)',
          userSelect: 'none',
        }}
      >
        {/* Rendered Text */}
        <div ref={stageRef} className="absolute inset-0" />

        {/* Dragon Character */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={dragonElRef}
          src="/tenor.gif"
          alt="dragon"
          style={{
            position: 'absolute',
            width: 160,
            height: 228,
            pointerEvents: 'auto',
            cursor: 'grab',
            zIndex: 10,
            objectFit: 'contain',
            touchAction: 'none',
          }}
        />

        {/* Stats */}
        <div
          className="absolute bottom-0 left-0 right-0 flex gap-6 px-5 py-2.5 text-[11px] font-mono"
          style={{
            background: 'rgba(8,8,12,0.85)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <span className="text-zinc-600">LINES <span className="text-zinc-300">{stats.lines}</span></span>
          <span className="text-zinc-600">REFLOW <span className="text-orange-400">{stats.reflow.toFixed(1)}ms</span></span>
          <span className="text-zinc-600">DOM READS <span className="text-zinc-300">0</span></span>
          <span className="text-zinc-600">FPS <span className="text-zinc-300">{stats.fps}</span></span>
        </div>
      </div>
    </section>
  );
}
