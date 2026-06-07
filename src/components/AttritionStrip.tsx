import { quitRateAt } from "../data/quitRates";
import { pad } from "../utils/format";

export function AttritionStrip({ dayNum, hideBottomBorder = false }: { dayNum: number; hideBottomBorder?: boolean }) {
  const safeDay = Math.max(1, Math.min(30, dayNum));
  const quitRate = quitRateAt(safeDay);
  const survivorRate = 100 - quitRate;
  const segments = 20;
  const lost = Math.round((quitRate / 100) * segments);
  return (
    <section className={`border-t border-sauce-hairlineStrong py-4 md:py-6 ${hideBottomBorder ? "" : "border-b"}`}>
      {/* Mobile: ultra-compact strip — title, bar, single stat line */}
      <div className="flex flex-col gap-2.5 md:hidden">
        <span className="mono-folio text-sauce-gold">The attrition curve · Day {pad(dayNum)}</span>
        <div className="flex gap-[3px]">
          {Array.from({ length: segments }).map((_, i) => (
            <span
              key={i}
              className={`h-6 flex-1 ${i < lost ? "bg-sauce-muted/35" : "bg-sauce-gold"}`}
              aria-hidden
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mono-folio text-sauce-muted">
          <span><span className="text-sauce-creamMuted">{lost}</span> quit</span>
          <span aria-hidden>·</span>
          <span><span className="text-sauce-gold">{segments - lost}</span> still moving</span>
          <span aria-hidden>·</span>
          <span className="text-sauce-cream">{rankFor(survivorRate)}</span>
        </div>
      </div>

      {/* Desktop: full editorial layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="flex flex-col gap-2">
            <span className="mono-folio text-sauce-gold">The attrition curve · Day {pad(dayNum)}</span>
            <p className="font-display text-[clamp(26px,3.6vw,38px)] font-medium italic leading-[1.1] tracking-editorial text-sauce-cream">
              <span className="text-sauce-gold tabular not-italic">{quitRate}%</span> of users quit before finishing this mission.
            </p>
            <p className="mono-folio text-sauce-creamMuted">
              You're in the {survivorRate}% who didn't. Keep it that way.
            </p>
          </div>
          <AttritionBar percent={quitRate} />
        </div>
        <div className="mt-6 grid grid-cols-3 divide-x divide-sauce-hairline border-t border-sauce-hairline">
          <MiniStat label="Quit before this mission" value={`${quitRate}%`} />
          <MiniStat label="Made it this far" value={`${survivorRate}%`} />
          <MiniStat label="Survivor rank" value={rankFor(survivorRate)} />
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 first:pl-0">
      <span className="mono-folio text-sauce-muted">{label}</span>
      <span className="font-display text-2xl font-medium tabular text-sauce-cream">{value}</span>
    </div>
  );
}

function AttritionBar({ percent }: { percent: number }) {
  const segments = 20;
  const lost = Math.round((percent / 100) * segments);
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-[3px]">
        {Array.from({ length: segments }).map((_, i) => {
          const isLost = i < lost;
          return (
            <span
              key={i}
              className={`h-7 w-[6px] ${isLost ? "bg-sauce-muted/35" : "bg-sauce-gold"}`}
              aria-hidden
            />
          );
        })}
      </div>
      <span className="mono-folio text-sauce-muted">
        <span className="text-sauce-creamMuted">{lost}</span> quit · <span className="text-sauce-gold">{segments - lost}</span> still moving
      </span>
    </div>
  );
}

function rankFor(survivorRate: number): string {
  if (survivorRate >= 90) return "Top 90%";
  if (survivorRate >= 75) return "Top 75%";
  if (survivorRate >= 50) return "Top half";
  if (survivorRate >= 35) return "Top third";
  if (survivorRate >= 25) return "Top quarter";
  return `Top ${survivorRate}%`;
}
