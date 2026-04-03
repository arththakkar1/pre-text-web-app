

export function Metric({
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
