import { pad } from "../utils/format";

interface StatProps {
  label: string;
  value: number;
  unit?: string;
}

export function Stat({ label, value, unit }: StatProps) {
  return (
    <div className="flex flex-col gap-2 px-2 py-5 first:pl-0 last:pr-0 sm:px-5">
      <span className="mono-folio text-sauce-muted">{label}</span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-display text-[clamp(40px,6vw,56px)] font-medium tabular leading-none text-sauce-cream">{pad(value)}</span>
        {unit && <span className="mono-folio text-sauce-creamMuted">{unit}</span>}
      </span>
    </div>
  );
}
