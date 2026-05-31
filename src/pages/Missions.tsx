import { ArrowUpRight, Check, Lock } from "lucide-react";
import { snapshot } from "../utils/storage";
import { pad, roman } from "../utils/format";
import { Shell } from "../components/Shell";

export function Missions() {
  const { user, missions } = snapshot();
  const folio = ["VOL. 01", `ZONE ${roman(user.current_zone)}`, "MISSION MAP"];

  // Group by zone
  const zones = Array.from(new Set(missions.map((m) => m.zone))).sort((a, b) => a - b);

  return (
    <Shell folio={folio} title="The map.">
      <p className="max-w-measure text-lede text-sauce-creamMuted">
        Thirty missions, three zones. One at a time, in order. Resistance is the point.
      </p>

      <div className="mt-12 flex flex-col gap-16">
        {zones.map((zone) => {
          const items = missions.filter((m) => m.zone === zone);
          return (
            <section key={zone}>
              <div className="mb-5 flex items-baseline gap-4">
                <span className="mono-folio text-sauce-gold">Zone {roman(zone)}</span>
                <span className="rule rule-strong flex-1" />
                <span className="mono-folio text-sauce-muted">{items.length} missions</span>
              </div>
              <ul className="flex flex-col">
                {items.map((m) => {
                  const isCurrent = m.mission_number === user.current_day;
                  const locked = m.mission_number > user.current_day;
                  return (
                    <li key={m.mission_number} className={`border-t border-sauce-hairline last:border-b ${locked ? "opacity-45" : ""}`}>
                      <div className="grid grid-cols-[44px_1fr_auto] items-center gap-4 py-4">
                        <span className={`mono-folio tabular ${m.completed ? "text-sauce-gold" : isCurrent ? "text-sauce-gold" : "text-sauce-muted"}`}>{pad(m.mission_number)}</span>
                        <div>
                          <h3 className="font-display text-xl font-medium tracking-editorial text-sauce-cream sm:text-2xl">{m.title}</h3>
                          <p className="mt-1 mono-folio text-sauce-creamMuted">
                            {m.skill.replace("_", " ")} · +{m.xp} XP
                          </p>
                        </div>
                        <span aria-hidden>
                          {m.completed ? <Check size={16} className="text-sauce-gold" /> : locked ? <Lock size={14} className="text-sauce-muted" /> : isCurrent ? <span className="mono-folio text-sauce-gold">Now</span> : <ArrowUpRight size={14} className="text-sauce-creamMuted" />}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
