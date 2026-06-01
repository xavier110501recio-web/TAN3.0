import type { SkillName, Skills } from "../types";
import { pad } from "../utils/format";

interface SkillsListProps {
  skills: Skills;
}

export function SkillsList({ skills }: SkillsListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="mono-folio text-sauce-muted">Skills</span>
        <span className="mono-folio text-sauce-muted">/ 100</span>
      </div>
      <ul className="flex flex-col">
        {(Object.entries(skills) as [SkillName, number][]).map(([k, v]) => (
          <li key={k} className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-sauce-hairline py-2 last:border-b">
            <span className="font-body text-[12px] capitalize leading-none text-sauce-creamMuted">
              {k.replace("_", " ")}
            </span>
            <div className="flex items-center gap-2">
              <span className="relative block h-px w-14 bg-sauce-hairlineStrong">
                <span className="absolute inset-y-0 left-0 bg-sauce-gold" style={{ width: `${v}%`, height: "1px" }} />
              </span>
              <span className="mono-folio tabular w-5 text-right text-sauce-gold">{pad(v)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
