import React from "react";

export function Slider({
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
