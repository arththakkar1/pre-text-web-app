"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  prepare,
  layout,
  prepareWithSegments,
  layoutWithLines,
  walkLineRanges,
  layoutNextLine,
} from "@chenglou/pretext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MeasureResult {
  height: number;
  lineCount: number;
  prepareMs: number;
  layoutMs: number;
}

interface Line {
  text: string;
  width: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEMO_TEXTS = [
  {
    label: "English",
    text: "The quick brown fox jumps over the lazy dog. Typography is the art and technique of arranging type to make written language legible, readable and appealing when displayed. Good typography is invisible — it guides the eye without calling attention to itself. The best typographers are those who understand that their work exists to serve the reader, not to showcase their own skill. Line length, leading, kerning, and weight all conspire to create an experience that feels effortless when done right and exhausting when done wrong.",
    font: "16px Georgia",
  },
  {
    label: "Mixed CJK + Arabic + Emoji",
    text: "AGI 春天到了. بدأت الرحلة 🚀 こんにちは世界. The future is multilingual — 미래는 다국어입니다. 文字は人類の最も偉大な発明の一つ。 العالم يتحدث بألف لغة 🌏 한국어, 日本語, 中文, हिंदी — all flowing together in one line. Typography must handle them all, seamlessly, without flinching. 这就是 pretext 的力量。",
    font: "16px Arial",
  },
  {
    label: "Japanese",
    text: "羅生門の下で雨やみを待っていた。すると、梯子の中段に、一人の男が蹲っているのを見た。火の光が、かすかに、その男の右の頬を照らした。短い白髪まじりのひげと、やせ細った頬に、朱雀大路の雨の音は絶えず聞こえていた。老婆は右手に松の木片に火をともしたものを持って、その屍骸の一つの顔を覗き込むように眺めていた。",
    font: "16px Arial",
  },
  {
    label: "Arabic RTL",
    text: "في يوم من الأيام، كان هناك ملك عادل يحكم مملكة واسعة. كان الناس يعيشون في سعادة وسلام تحت حكمه الرشيد. وكان الملك يحرص على أن يسمع شكاوى رعاياه بنفسه، ويعمل على حل مشاكلهم بالعدل والإنصاف. وذات يوم، جاءه رجل فقير يشكو من ظلم وقع عليه، فأنصفه الملك وأعاد إليه حقه كاملاً غير منقوص.",
    font: "16px Arial",
  },
  {
    label: "Hindi Devanagari",
    text: "ईदगाह पर बड़ी चहल-पहल थी। हामिद अपने दादा के साथ मेले में आया था। उसके पास केवल तीन पैसे थे। लेकिन उसकी आँखों में एक अजीब चमक थी। वह जानता था कि आज वह कुछ ऐसा लेकर जाएगा जो सबसे अलग होगा। मेले में खिलौने थे, मिठाइयाँ थीं, और न जाने क्या-क्या। पर हामिद का मन किसी और चीज़ पर था।",
    font: "16px Arial",
  },
  {
    label: "Korean",
    text: "한글은 조선 시대 세종대왕이 창제한 문자로, 과학적이고 체계적인 구조를 갖추고 있다. 누구나 쉽게 배우고 쓸 수 있도록 설계되었으며, 현재 전 세계에서 가장 독창적인 문자 체계 중 하나로 평가받는다. 한국의 문학과 역사는 이 문자를 통해 수백 년간 기록되어 왔으며, 오늘날에도 디지털 환경에서 완벽하게 작동한다.",
    font: "16px Arial",
  },
  {
    label: "Thai",
    text: "ภาษาไทยเป็นภาษาประจำชาติของประเทศไทย มีอักษรไทยที่เป็นเอกลักษณ์และวรรณคดีอันเก่าแก่ยาวนาน การเขียนไม่มีช่องว่างระหว่างคำ ทำให้การตัดคำเป็นเรื่องที่ซับซ้อน ภาษาไทยมีเสียงวรรณยุกต์ห้าระดับซึ่งทำให้ความหมายของคำเปลี่ยนแปลงไปตามระดับเสียง วรรณคดีไทยมีความงดงามและลึกซึ้งมาตั้งแต่โบราณกาล",
    font: "16px Arial",
  },
  {
    label: "Greek",
    text: "Η ελληνική γλώσσα είναι μια από τις παλαιότερες γλώσσες του κόσμου με αδιάκοπη λογοτεχνική παράδοση από τον Όμηρο έως σήμερα. Η Ιλιάδα και η Οδύσσεια αποτελούν θεμέλια της δυτικής λογοτεχνίας. Η ελληνική αλφάβητος αποτέλεσε τη βάση για το λατινικό και το κυριλλικό αλφάβητο. Σήμερα η γλώσσα εξακολουθεί να εμπλουτίζει την επιστημονική και φιλοσοφική ορολογία του κόσμου.",
    font: "16px Arial",
  },
  {
    label: "Hebrew RTL",
    text: "עברית היא שפה שמית הנכתבת מימין לשמאל. היא שפת התנ״ך, ולאחר אלפי שנים של שימוש כשפה דתית, היא חודשה כשפה מדוברת על ידי אליעזר בן-יהודה בסוף המאה התשע עשרה. כיום היא השפה הרשמית של מדינת ישראל ומדוברת על ידי מיליוני אנשים ברחבי העולם. ספרות עברית עשירה נכתבת בה מאז ימי קדם ועד ימינו.",
    font: "16px Arial",
  },
  {
    label: "Russian Cyrillic",
    text: "Россия — самая большая по площади страна в мире. Её культура, литература и история оказали огромное влияние на весь мир. Великие русские писатели, такие как Толстой, Достоевский и Чехов, создали произведения, которые до сих пор читают и изучают во всём мире. Русский язык является одним из шести официальных языков Организации Объединённых Наций и распространён на огромных территориях.",
    font: "16px Arial",
  },
  {
    label: "Bengali",
    text: "বাংলা ভাষা বিশ্বের অন্যতম প্রধান ভাষা। রবীন্দ্রনাথ ঠাকুর এই ভাষায় সাহিত্য রচনা করে নোবেল পুরস্কার লাভ করেন। বাংলাদেশ ও ভারতের পশ্চিমবঙ্গে এই ভাষা প্রচলিত। ১৯৫২ সালের ভাষা আন্দোলন বাংলা ভাষার মর্যাদা রক্ষায় এক ঐতিহাসিক সংগ্রাম, যা আন্তর্জাতিক মাতৃভাষা দিবসের স্বীকৃতি অর্জন করেছে।",
    font: "16px Arial",
  },
];

const LINE_HEIGHT = 26;

// ─── Dragon Text Reflow Demo ─────────────────────────────────────────────────

const DRAGON_BODY_FONT = '17px "Iowan Old Style", Georgia, serif';
const DRAGON_LINE_HEIGHT = 28;
const DRAGON_TEXT = `It was the third candle the abbess had confiscated, and Sable had nodded gravely each time and stolen another from the chapel stores. She kept reading by its unsteady light, hunched beneath her wool blanket in the scriptorium where the novices slept on straw pallets between the copying desks.

It was the bestiary that held her. Not the psalter, not the gospels, not the lives of saints with their wooden sufferings. The bestiary. Some brother at Lindisfarne had painted it two centuries ago, and his creatures had a quality she could not name, a weight to them, as if they had been observed from life rather than copied from pattern books. His lions looked hungry. His basilisks looked bored.

And his dragon, coiled in the lower margin of the forty-seventh leaf, looked like it was breathing. She had watched it for six nights before she was certain. The movement was slight, almost imperceptible at first — a subtle rise and fall of the serpentine chest, the barely-there flutter of the wing membrane. But it was real. The dragon breathed.

She pressed her palm flat against the vellum. The surface was cool and smooth, worn soft by two centuries of handling. The dragon coiled in the lower margin, its proportions wrong in the way that illuminated creatures always were — too large for any ecology, anatomically dreamlike — but bearing some strange internal coherence to its wrongness. It looked like something that hunted. It looked like something that could land. His lions looked hungry. His basilisks looked bored. And this dragon looked patient.

She thought about patience. About a brother at Lindisfarne, two hundred years ago, grinding pigments in the cold. Mixing lamp black and oak gall ink and some red that might have been vermilion or might have been the dried body of an insect. Working by the same unsteady candlelight. Watching something for six nights before he touched the brush to vellum. She wondered what he had watched. She wondered if he had also pressed his palm to a surface and felt something press back. The text flows where the dragon allows.`;

const MIN_SLOT_WIDTH = 40;

function carveSlots(
  base: { left: number; right: number },
  blocked: { left: number; right: number }[]
): { left: number; right: number }[] {
  let slots = [base];
  for (const iv of blocked) {
    const next: { left: number; right: number }[] = [];
    for (const s of slots) {
      if (iv.right <= s.left || iv.left >= s.right) { next.push(s); continue; }
      if (iv.left > s.left) next.push({ left: s.left, right: iv.left });
      if (iv.right < s.right) next.push({ left: iv.right, right: s.right });
    }
    slots = next;
  }
  return slots.filter((s) => s.right - s.left >= MIN_SLOT_WIDTH);
}

// Compute horizontal blocked interval for a circle in a line band
function circleInterval(
  cx: number, cy: number, r: number,
  bandTop: number, bandBottom: number,
  hPad: number, vPad: number
): { left: number; right: number } | null {
  const top = bandTop - vPad;
  const bottom = bandBottom + vPad;
  if (top >= cy + r || bottom <= cy - r) return null;
  const minDy = cy >= top && cy <= bottom ? 0 : cy < top ? top - cy : cy - bottom;
  if (minDy >= r) return null;
  const maxDx = Math.sqrt(r * r - minDy * minDy);
  return { left: cx - maxDx - hPad, right: cx + maxDx + hPad };
}

// Dragon body is approximated by 3 overlapping circles for obstacle purposes
type DragonObstacle = { cx: number; cy: number; r: number }[];

function getDragonObstacles(x: number, y: number, scale: number): DragonObstacle {
  // body, head, tail — scaled around center (x,y)
  return [
    { cx: x,        cy: y,       r: scale * 1.1 },  // body
    { cx: x + scale * 1.3, cy: y - scale * 0.6, r: scale * 0.55 }, // head
    { cx: x - scale * 1.1, cy: y + scale * 0.5, r: scale * 0.5  }, // tail curl
  ];
}

type RenderedLine = { x: number; y: number; text: string };

function DragonTextReflow() {
  const stageRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement[]>([]);
  const animRef = useRef<number | null>(null);
  const prepRef = useRef<ReturnType<typeof prepareWithSegments> | null>(null);

  // Dragon state (mutable, no react state for perf)
  const dragonRef = useRef({ x: 200, y: 160, vx: 38, vy: 22, scale: 55 });
  const dragonElRef = useRef<HTMLImageElement>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ ox: 0, oy: 0 });

  // Perf stats
  const [stats, setStats] = useState({ lines: 0, reflow: 0.0, fps: 60 });
  const fpsRef = useRef<number[]>([]);
  const lastTimeRef = useRef(0);

  // Pool of line div elements
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

    // Prepare text (async after fonts ready)
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

      // FPS tracking
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

      // Update image position — offset by half the rendered size to center on (d.x, d.y)
      if (dragonElRef.current) {
        dragonElRef.current.style.left = (d.x - 90) + 'px';
        dragonElRef.current.style.top  = (d.y - 130) + 'px';
      }

      // Get obstacles (circles approximating dragon body)
      const obstacles = getDragonObstacles(d.x, d.y, d.scale);

      // Layout text around dragon
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

      // Sync DOM line pool
      syncLinePool(stage, renderedLines.length);
      for (let i = 0; i < renderedLines.length; i++) {
        const el = linesRef.current[i];
        const rl = renderedLines[i];
        el.textContent = rl.text;
        el.style.left = rl.x + 'px';
        el.style.top = rl.y + 'px';
      }

      // Update stats every ~10 frames
      if (safetyBreak % 10 === 0 || renderedLines.length > 0) {
        setStats({
          lines: renderedLines.length,
          reflow: parseFloat(reflowMs.toFixed(2)),
          fps: fpsRef.current.length,
        });
      }
    };

    init();

    // Drag support
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

      {/* Stage */}
      <div
        className="relative w-full rounded-xl overflow-hidden border border-zinc-800"
        style={{
          height: 680,
          background: 'radial-gradient(ellipse at 50% 40%, #111018 0%, #08080c 100%)',
          userSelect: 'none',
        }}
      >
        {/* Text lines rendered imperatively by rAF loop */}
        <div ref={stageRef} className="absolute inset-0" />

        {/* Dragon character image — draggable */}
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

        {/* Stats bar */}
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

// ─── Canvas Renderer ─────────────────────────────────────────────────────────

function CanvasRenderer({
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
      // silent
    }
  }, [text, font, maxWidth]);

  return (
    <div className="overflow-x-auto">
      <canvas ref={canvasRef} className="block rounded-lg" />
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function Metric({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800">
      <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
        {label}
      </span>
      <span
        className={`text-xl font-mono font-medium tabular-nums ${
          accent ? "text-orange-400" : "text-zinc-100"
        }`}
      >
        {value}
        {unit && <span className="text-sm text-zinc-500 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

// ─── Code Block ──────────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="relative group">
      <pre className="text-xs font-mono leading-relaxed text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 text-[10px] font-mono tracking-wider text-zinc-500 hover:text-orange-400 transition-colors px-2 py-1 rounded bg-zinc-900 border border-zinc-800 opacity-0 group-hover:opacity-100"
      >
        {copied ? "COPIED" : "COPY"}
      </button>
    </div>
  );
}

// ─── Slider ──────────────────────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  unit = "px",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
          {label}
        </label>
        <span className="text-sm font-mono text-orange-400 tabular-nums">
          {value}
          <span className="text-zinc-500">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none bg-zinc-800 accent-orange-500 cursor-pointer"
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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

  // Measure height
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

  // Lines for canvas tab
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

  // Shrink wrap
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

  // Benchmark
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

// Pure arithmetic — no DOM, no reflow
const { height, lineCount } = layout(prepared, ${maxWidth}, ${LINE_HEIGHT})
// → height: ${measureResult?.height.toFixed(1) ?? "?"}px  lineCount: ${measureResult?.lineCount ?? "?"}`;

  const canvasCode = `import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const prepared = prepareWithSegments(text, '${font}')
const { lines } = layoutWithLines(prepared, ${maxWidth}, ${LINE_HEIGHT})

// Render to canvas — also works for SVG, WebGL, server-side
lines.forEach((line, i) =>
  ctx.fillText(line.text, 0, i * ${LINE_HEIGHT})
)`;

  const shrinkCode = `import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'

const prepared = prepareWithSegments(text, '${font}')
let tightestWidth = 0

// Callbacks not strings — avoids building line copies
walkLineRanges(prepared, 800, (line) => {
  if (line.width > tightestWidth) tightestWidth = line.width
})
// → tightestWidth: ${shrinkWidth?.toFixed(1) ?? "?"}px`;

  const benchCode = `// Batch layout on resize — pure arithmetic hot path
// ${DEMO_TEXTS.length} texts × 200 layout() runs

prepare()  ${benchResult ? benchResult.prepare.toFixed(2) + "ms  (one-time per text+font)" : "click Run Benchmark →"}
layout()   ${benchResult ? benchResult.layout.toFixed(4) + "ms  (per run — call on every resize)" : ""}`;

  const TABS = [
    { id: "measure", label: "Height Measure" },
    { id: "canvas", label: "Canvas Render" },
    { id: "shrinkwrap", label: "Shrink Wrap" },
    { id: "bench", label: "Benchmark" },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-6 py-16 pb-32">

        {/* ── Header ── */}
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

        {/* ── Dragon Demo ── */}
        <DragonTextReflow />

        {/* ── Demo selector ── */}
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

        {/* ── Text input ── */}
        <section className="mb-8">
          <textarea
            value={customText || text}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            placeholder="Type custom text…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-200 font-mono leading-relaxed resize-none focus:outline-none focus:border-orange-500/50 placeholder:text-zinc-700 transition-colors"
          />
        </section>

        {/* ── Controls ── */}
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

        {/* ── Tabs ── */}
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

        {/* ── Tab: Height Measure ── */}
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

              {/* Visual box */}
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

        {/* ── Tab: Canvas Render ── */}
        {tab === "canvas" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-3">
                Canvas output{" "}
                <span className="text-zinc-700 normal-case tracking-normal">
                  — orange = unused space
                </span>
              </p>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden p-2">
                <CanvasRenderer text={text} font={font} maxWidth={maxWidth} />
              </div>
              <div className="mt-3 flex gap-4 text-[11px] font-mono text-zinc-600">
                <span>
                  <span className="text-zinc-400">{lines.length}</span> lines
                </span>
                <span>
                  max <span className="text-zinc-400">{maxWidth}px</span>
                </span>
                <span>
                  line-height <span className="text-zinc-400">{LINE_HEIGHT}px</span>
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

        {/* ── Tab: Shrink Wrap ── */}
        {tab === "shrinkwrap" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-4">
                  Tightest container width
                </p>
                <p className="text-6xl font-mono font-bold text-orange-400 tabular-nums">
                  {shrinkWidth ? shrinkWidth.toFixed(1) : "—"}
                  <span className="text-2xl text-zinc-600 ml-1">px</span>
                </p>
                <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
                  The narrowest container where the text still wraps at the right word
                  boundaries — no DOM, no guessing.
                </p>
              </div>

              {shrinkWidth && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <p className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mb-3">
                    Text at tight width
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

        {/* ── Tab: Benchmark ── */}
        {tab === "bench" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <Metric
                  label="prepare() total"
                  value={benchResult ? benchResult.prepare.toFixed(2) : "—"}
                  unit="ms"
                />
                <Metric
                  label="layout() per run"
                  value={benchResult ? benchResult.layout.toFixed(4) : "—"}
                  unit="ms"
                  accent
                />
              </div>

              <button
                onClick={runBench}
                className="w-full py-3 rounded-lg border border-orange-500/40 bg-orange-500/10 text-orange-400 font-mono text-sm tracking-wide hover:bg-orange-500/20 active:bg-orange-500/30 transition-colors"
              >
                Run Benchmark ({DEMO_TEXTS.length} texts × 200 runs)
              </button>

              {benchResult && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400 leading-relaxed font-mono space-y-2">
                  <p>
                    <span className="text-zinc-600">prepare()</span> runs once per
                    text+font. Cache and reuse it.
                  </p>
                  <p>
                    <span className="text-zinc-600">layout()</span> is pure
                    arithmetic — call freely on every resize.
                  </p>
                  {benchResult.layout < 0.01 && (
                    <p className="text-orange-400">
                      ✓ Sub-0.01ms per layout — no throttling needed.
                    </p>
                  )}
                </div>
              )}

              {/* Comparison table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-4 py-2.5 text-zinc-600 font-normal">
                        Approach
                      </th>
                      <th className="text-right px-4 py-2.5 text-zinc-600 font-normal">
                        ~Cost (500 items)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "DOM interleaved reflow", time: "30ms+", variant: "bad" },
                      { label: "DOM batched reads", time: "0.18ms", variant: "neutral" },
                      { label: "pretext layout()", time: "0.02ms", variant: "good" },
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
                <p className="text-zinc-500">Accuracy: 7,680 tests across 4 fonts × 8 sizes × 8 widths × 30 texts</p>
                <p>Chrome &nbsp;<span className="text-orange-400">7680/7680</span></p>
                <p>Safari &nbsp;<span className="text-orange-400">7680/7680</span></p>
                <p>Firefox <span className="text-orange-400">7680/7680</span></p>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="mt-24 pt-8 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono text-zinc-700">
          <span>@chenglou/pretext — MIT</span>
          <a
            href="https://github.com/chenglou/pretext"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-500 transition-colors"
          >
            github →
          </a>
        </footer>
      </div>
    </div>
  );
}