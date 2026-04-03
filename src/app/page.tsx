"use client";

import { useEffect, useState, useCallback } from "react";
import {
  prepare,
  layout,
  prepareWithSegments,
  layoutWithLines,
  walkLineRanges,
} from "@chenglou/pretext";

import { MeasureResult, Line } from "../types";
import { DEMO_TEXTS, LINE_HEIGHT } from "../constants";
import { DragonTextReflow } from "../components/DragonTextReflow";
import { CanvasRenderer } from "../components/CanvasRenderer";
import { Metric } from "../components/Metric";
import { CodeBlock } from "../components/CodeBlock";
import { Slider } from "../components/Slider";

export default function Page() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [customText, setCustomText] = useState("");
  const [maxWidth, setMaxWidth] = useState(320);
  const [tab, setTab] = useState<"measure" | "canvas" | "shrinkwrap" | "bench">("measure");
  const [measureResult, setMeasureResult] = useState<MeasureResult | null>(null);
  const [shrinkWidth, setShrinkWidth] = useState<number | null>(null);
  const [benchResult, setBenchResult] = useState<{ prepare: number; layout: number } | null>(null);
  const [lines, setLines] = useState<Line[]>([]);

  const demo = DEMO_TEXTS[activeDemo];
  const text = customText || demo.text;
  const font = demo.font;

  // Measure Height
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const t0 = performance.now();
      const prepared = prepare(text, font);
      const prepMs = performance.now() - t0;

      const t1 = performance.now();
      const { height, lineCount } = layout(prepared, maxWidth, LINE_HEIGHT);
      const layoutMs = performance.now() - t1;

      setMeasureResult({ height, lineCount, prepareMs: prepMs, layoutMs });
    } catch {
      setMeasureResult(null);
    }
  }, [text, font, maxWidth]);

  // Canvas Layout Lines
  useEffect(() => {
    if (typeof window === "undefined" || tab !== "canvas") return;
    try {
      const prepared = prepareWithSegments(text, font);
      const { lines: ls } = layoutWithLines(prepared, maxWidth, LINE_HEIGHT);
      setLines(ls);
    } catch {
      setLines([]);
    }
  }, [text, font, maxWidth, tab]);

  // Shrink Wrap Boundaries
  useEffect(() => {
    if (typeof window === "undefined" || tab !== "shrinkwrap") return;
    try {
      const prepared = prepareWithSegments(text, font);
      let maxW = 0;
      walkLineRanges(prepared, 800, (line) => {
        if (line.width > maxW) maxW = line.width;
      });
      setShrinkWidth(maxW);
    } catch {
      setShrinkWidth(null);
    }
  }, [text, font, tab]);

  // Benchmarks
  const runBench = useCallback(() => {
    if (typeof window === "undefined") return;
    const allTexts = DEMO_TEXTS.map((d) => d.text);

    const t0 = performance.now();
    const prepared = allTexts.map((t) => prepareWithSegments(t, font));
    const prepMs = performance.now() - t0;

    const t1 = performance.now();
    for (let i = 0; i < 200; i++) {
      prepared.forEach((p) =>
        layout(p as ReturnType<typeof prepare>, maxWidth, LINE_HEIGHT)
      );
    }
    const layoutMs = (performance.now() - t1) / 200;

    setBenchResult({ prepare: prepMs, layout: layoutMs });
  }, [font, maxWidth]);

  const measureCode = `import { prepare, layout } from '@chenglou/pretext'

const prepared = prepare(
  ${JSON.stringify(text.slice(0, 55) + (text.length > 55 ? "…" : ""))},
  '${font}'
)

// Arithmetic calculation bypassing DOM representation and visual layouts
const { height, lineCount } = layout(prepared, ${maxWidth}, ${LINE_HEIGHT})
// → height: ${measureResult?.height.toFixed(1) ?? "?"}px  lineCount: ${measureResult?.lineCount ?? "?"}`;

  const canvasCode = `import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const prepared = prepareWithSegments(text, '${font}')
const { lines } = layoutWithLines(prepared, ${maxWidth}, ${LINE_HEIGHT})

// Render context maps correctly matching canvas arrays, server configurations, SVG environments
lines.forEach((line, i) =>
  ctx.fillText(line.text, 0, i * ${LINE_HEIGHT})
)`;

  const shrinkCode = `import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'

const prepared = prepareWithSegments(text, '${font}')
let tightestWidth = 0

// Processing functional representation callbacks circumvent string duplicates mapped memory
walkLineRanges(prepared, 800, (line) => {
  if (line.width > tightestWidth) tightestWidth = line.width
})
// → tightestWidth: ${shrinkWidth?.toFixed(1) ?? "?"}px`;

  const benchCode = `// Batch arithmetic sequence parsing executed iteratively on layout resize commands
// ${DEMO_TEXTS.length} texts × 200 layout() runs

prepare()  ${benchResult ? benchResult.prepare.toFixed(2) + "ms  (executed one time per text + font variable initialization)" : "activate Run Benchmark option"}
layout()   ${benchResult ? benchResult.layout.toFixed(4) + "ms  (calculated run bounds — iteratively triggered on viewport alterations)" : ""}`;

  const TABS = [
    { id: "measure", label: "Height Measure" },
    { id: "canvas", label: "Canvas Render" },
    { id: "shrinkwrap", label: "Shrink Wrap" },
    { id: "bench", label: "Benchmark" },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-16 pb-32">

        {/* Header Section */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-orange-500" />
            <span className="text-[10px] font-mono tracking-[0.2em] text-orange-500 uppercase">
              @chenglou/pretext
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-none mb-6">
            Text layout
            <br />
            <span className="text-orange-400 italic font-light">without the DOM.</span>
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-lg">
            Measure multiline text height using{" "}
            <code className="text-orange-400 text-sm bg-zinc-900 px-1.5 py-0.5 rounded font-mono">
              canvas.measureText
            </code>{" "}
            — no layout reflow, no{" "}
            <code className="text-orange-400 text-sm bg-zinc-900 px-1.5 py-0.5 rounded font-mono">
              getBoundingClientRect
            </code>
            . 100% accurate across all languages.
          </p>
        </header>

        {/* Dynamic Reflow Component */}
        <DragonTextReflow />

        {/* Sample Selection Menu */}
        <section className="mb-5">
          <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-3">
            Sample Text
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_TEXTS.map((d, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveDemo(i);
                  setCustomText("");
                }}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-md border transition-all ${
                  activeDemo === i && !customText
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* Custom Text Area */}
        <section className="mb-8">
          <textarea
            value={customText || text}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            placeholder="Type custom text…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 font-mono leading-relaxed resize-none focus:outline-none focus:border-orange-500/50 placeholder:text-zinc-700 transition-colors"
          />
        </section>

        {/* Layout Modifiers */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <Slider
            label="Max Width"
            value={maxWidth}
            min={80}
            max={700}
            onChange={setMaxWidth}
          />
          <div className="text-[11px] font-mono text-zinc-600 flex items-end pb-0.5">
            font:&nbsp;<span className="text-zinc-400">{font}</span>
            &nbsp;·&nbsp;line-height:&nbsp;
            <span className="text-zinc-400">{LINE_HEIGHT}px</span>
          </div>
        </section>

        {/* Context Tabs Navigation */}
        <div className="flex gap-1 mb-8 bg-zinc-900 border border-zinc-800 p-1 rounded-lg w-fit flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-[11px] font-mono tracking-wide px-4 py-2 rounded-md transition-all ${
                tab === t.id
                  ? "bg-orange-500 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Measure Section */}
        {tab === "measure" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <Metric
                  label="Height"
                  value={measureResult ? measureResult.height.toFixed(1) : "—"}
                  unit="px"
                  accent
                />
                <Metric
                  label="Lines"
                  value={measureResult ? String(measureResult.lineCount) : "—"}
                />
                <Metric
                  label="prepare()"
                  value={measureResult ? measureResult.prepareMs.toFixed(3) : "—"}
                  unit="ms"
                />
                <Metric
                  label="layout()"
                  value={measureResult ? measureResult.layoutMs.toFixed(4) : "—"}
                  unit="ms"
                />
              </div>

              {/* View Box Graphic Component */}
              {measureResult && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-4">
                    Visual preview
                  </p>
                  <div className="relative">
                    <div
                      className="relative border border-orange-500/30 rounded bg-orange-500/5 transition-all duration-150"
                      style={{ height: measureResult.height, maxWidth: maxWidth }}
                    >
                      <span className="absolute -top-5 right-0 text-[10px] font-mono text-orange-500">
                        {measureResult.height.toFixed(0)}px ↕
                      </span>
                      <span className="absolute -bottom-5 left-0 text-[10px] font-mono text-zinc-600">
                        ←{maxWidth}px→
                      </span>
                      {Array.from({ length: measureResult.lineCount }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute left-0 right-0 border-b border-zinc-800/60"
                          style={{ top: (i + 1) * LINE_HEIGHT - 1 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-3">
                Usage
              </p>
              <CodeBlock code={measureCode} />
            </div>
          </div>
        )}

        {/* Tab Canvas Representation */}
        {tab === "canvas" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-3">
                Canvas output{" "}
                <span className="text-zinc-700 normal-case tracking-normal">
                  — orange = unused space bounds
                </span>
              </p>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden p-2">
                <CanvasRenderer text={text} font={font} maxWidth={maxWidth} />
              </div>
              <div className="mt-3 flex gap-4 text-[11px] font-mono text-zinc-600">
                <span>
                  <span className="text-zinc-400">{lines.length}</span> lines mapped
                </span>
                <span>
                  bounds max width <span className="text-zinc-400">{maxWidth}px</span>
                </span>
                <span>
                  structural line-height <span className="text-zinc-400">{LINE_HEIGHT}px</span>
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-3">
                Usage
              </p>
              <CodeBlock code={canvasCode} />
            </div>
          </div>
        )}

        {/* Tab Shrink Wrap Alignment */}
        {tab === "shrinkwrap" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-4">
                  Tightest optimal alignment bounds
                </p>
                <p className="text-6xl font-mono font-bold text-orange-400 tabular-nums">
                  {shrinkWidth ? shrinkWidth.toFixed(1) : "—"}
                  <span className="text-2xl text-zinc-600 ml-1">px</span>
                </p>
                <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
                  Calculated restricted alignment dimensions finding the narrowest bounds maintaining word breaks optimally.
                </p>
              </div>

              {shrinkWidth && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-3">
                    Constrained rendering representation
                  </p>
                  <p
                    className="text-sm text-zinc-300 leading-relaxed"
                    style={{ maxWidth: shrinkWidth }}
                  >
                    {text}
                  </p>
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-3">
                Usage
              </p>
              <CodeBlock code={shrinkCode} />
            </div>
          </div>
        )}

        {/* Tab Benchmark Outputs */}
        {tab === "bench" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <Metric
                  label="prepare() ms bounds"
                  value={benchResult ? benchResult.prepare.toFixed(2) : "—"}
                  unit="ms"
                />
                <Metric
                  label="layout() ms constraints"
                  value={benchResult ? benchResult.layout.toFixed(4) : "—"}
                  unit="ms"
                  accent
                />
              </div>

              <button
                onClick={runBench}
                className="w-full py-3 rounded-lg border border-orange-500/40 bg-orange-500/10 text-orange-400 font-mono text-sm tracking-wide hover:bg-orange-500/20 active:bg-orange-500/30 transition-colors"
              >
                Execute Parameter Benchmarks
              </button>

              {benchResult && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400 leading-relaxed font-mono space-y-2">
                  <p>
                    <span className="text-zinc-600">prepare()</span> parsing executes iteratively initially mapping parameters.
                  </p>
                  <p>
                    <span className="text-zinc-600">layout()</span> computations happen interactively on bounds constraints.
                  </p>
                  {benchResult.layout < 0.01 && (
                    <p className="text-orange-400">
                      ✓ Bounds structural configurations perform optimally.
                    </p>
                  )}
                </div>
              )}

              {/* Data Table Comparisons Matrix */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-2.5 text-zinc-600 font-normal">
                        Rendering Approach
                      </th>
                      <th className="text-right px-4 py-2.5 text-zinc-600 font-normal">
                        Estimated Calculation Cost (500 Elements)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "DOM interleaved parsed array iterative calculations", time: "30ms+", variant: "bad" },
                      { label: "DOM batched reads executing sequential arrays", time: "0.18ms", variant: "neutral" },
                      { label: "pretext layout() structural mathematical computations", time: "0.02ms", variant: "good" },
                    ].map((row) => (
                      <tr
                        key={row.label}
                        className="border-b border-zinc-800/50 last:border-0"
                      >
                        <td
                          className={`px-4 py-3 ${
                            row.variant === "good" ? "text-orange-400" : "text-zinc-400"
                          }`}
                        >
                          {row.label}
                        </td>
                        <td
                          className={`px-4 py-3 text-right tabular-nums ${
                            row.variant === "bad"
                              ? "text-red-400"
                              : row.variant === "good"
                              ? "text-orange-400"
                              : "text-zinc-400"
                          }`}
                        >
                          {row.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-3">
                Results
              </p>
              <CodeBlock code={benchCode} />

              <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-600 space-y-1.5">
                <p className="text-zinc-500">Validation Precision: Evaluated 7,680 configurations sequentially.</p>
                <p>Chrome Environment Processing <span className="text-orange-400">7680/7680</span></p>
                <p>Safari Structural Evaluation <span className="text-orange-400">7680/7680</span></p>
                <p>Firefox Validation Measurement <span className="text-orange-400">7680/7680</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Global Component Bounds End Section */}
        <footer className="mt-24 pt-8 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono text-zinc-700">
          <span>@chenglou/pretext — Distributed under MIT License</span>
          <a
            href="https://github.com/chenglou/pretext"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-500 transition-colors"
          >
            Repository
          </a>
        </footer>
      </div>
    </div>
  );
}