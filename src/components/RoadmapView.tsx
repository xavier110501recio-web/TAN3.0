import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Lock } from "lucide-react";
import type { Mission, User } from "../types";
import { pad, roman } from "../utils/format";

interface RoadmapViewProps {
  missions: Mission[];
  user: User;
}

const ZONE_META: Record<number, { name: string; range: string; reasoning: string }> = {
  1: { name: "Foundation", range: "Days 01–10", reasoning: "Define who you're for, what you offer, start the first conversations." },
  2: { name: "First contact", range: "Days 11–20", reasoning: "Real outreach, responses, content that lands. Iterate from market signal." },
  3: { name: "First dollar", range: "Days 21–30", reasoning: "Direct offers, follow-ups, money tracked. End with proof someone paid." },
};

export function RoadmapView({ missions, user }: RoadmapViewProps) {
  const zones = Array.from(new Set(missions.map((m) => m.zone))).sort((a, b) => a - b);
  const totalDone = missions.filter((m) => m.completed).length;
  const currentZone = user.current_zone;
  const [openZones, setOpenZones] = useState<Set<number>>(() => new Set([currentZone]));

  function toggleZone(zone: number) {
    setOpenZones((prev) => {
      const next = new Set(prev);
      if (next.has(zone)) next.delete(zone);
      else next.add(zone);
      return next;
    });
  }

  return (
    <article className="overflow-hidden rounded-lg border border-sauce-gold/40 bg-sauce-ink/60">
      <header className="border-b border-sauce-hairlineStrong px-5 py-4 md:px-6">
        <div className="flex items-center justify-between mono-folio">
          <span className="text-sauce-gold">Full map · {pad(totalDone)} / {pad(missions.length)} done</span>
          <span className="text-sauce-muted">Today's task is actionable</span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-none tracking-tightest text-sauce-cream md:text-3xl">
          The map.
        </h2>
      </header>

      {zones.map((zone) => {
        const items = missions.filter((m) => m.zone === zone);
        const done = items.filter((m) => m.completed).length;
        const meta = ZONE_META[zone];
        const isOpen = openZones.has(zone);
        return (
          <section key={zone} className="border-b border-sauce-hairlineStrong last:border-b-0">
            <button
              type="button"
              onClick={() => toggleZone(zone)}
              aria-expanded={isOpen}
              aria-controls={`zone-${zone}-missions`}
              className="group w-full px-5 py-5 text-left transition hover:bg-sauce-surface/40 md:px-6"
            >
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="mono-folio text-sauce-gold">Zone {roman(zone)} · {meta?.range}</p>
                  <h3 className="mt-2 font-display text-2xl font-medium tracking-editorial text-sauce-cream md:text-3xl">
                    {meta?.name}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="relative block h-px w-20 bg-sauce-hairlineStrong">
                      <span className="absolute inset-y-0 left-0 bg-sauce-gold" style={{ width: `${(done / items.length) * 100}%`, height: "1px" }} />
                    </span>
                    <span className="mono-folio tabular text-sauce-creamMuted">{pad(done)} / {pad(items.length)}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.6}
                    className={`text-sauce-creamMuted transition-transform duration-[280ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:text-sauce-gold ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
              {meta?.reasoning && (
                <p className="mt-3 max-w-[58ch] font-body text-caption leading-[1.6] text-sauce-creamMuted">{meta.reasoning}</p>
              )}
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`zone-${zone}-missions`}
                  key="open"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <ul>
                    {items.map((m) => {
                      const isCurrent = m.mission_number === user.current_day && !m.completed;
                      const locked = m.mission_number > user.current_day && !m.completed;
                      return (
                        <li key={m.mission_number} className={`border-t border-sauce-hairline px-5 py-4 md:px-6 ${locked ? "opacity-55" : ""}`}>
                          <div className="grid grid-cols-[40px_1fr_auto] items-baseline gap-4">
                            <span className={`mono-folio tabular ${isCurrent || m.completed ? "text-sauce-gold" : "text-sauce-muted"}`}>
                              {pad(m.mission_number)}
                            </span>
                            <div>
                              <div className="flex items-baseline gap-3 flex-wrap">
                                <h4 className="font-display text-xl font-medium tracking-editorial text-sauce-cream">{m.title}</h4>
                                {isCurrent && (
                                  <span className="mono-folio text-sauce-gold">Today · actionable</span>
                                )}
                              </div>
                              <p className="mt-1 mono-folio text-sauce-creamMuted">
                                {m.skill.replace("_", " ")} · +{m.xp} XP
                              </p>

                              {/* Today: full task + why */}
                              {isCurrent && (
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <p className="mono-folio mb-1 text-sauce-creamMuted">Task</p>
                                    <p className="font-body text-body leading-[1.6] text-sauce-cream">{m.task}</p>
                                  </div>
                                  <div>
                                    <p className="mono-folio mb-1 text-sauce-creamMuted">Why</p>
                                    <p className="font-body text-caption italic leading-[1.6] text-sauce-creamMuted">{m.why}</p>
                                  </div>
                                </div>
                              )}

                              {/* Upcoming: outcome preview */}
                              {locked && (
                                <div className="mt-3">
                                  <p className="mono-folio mb-1 text-sauce-creamMuted">What you'll get</p>
                                  <p className="font-body text-caption italic leading-[1.6] text-sauce-creamMuted">{m.why}</p>
                                </div>
                              )}
                            </div>
                            <span aria-hidden className="pt-1">
                              {m.completed ? (
                                <Check size={16} className="text-sauce-gold" />
                              ) : locked ? (
                                <Lock size={14} className="text-sauce-muted" />
                              ) : (
                                <span className="mono-folio text-sauce-gold">NOW</span>
                              )}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}

      <footer className="px-5 py-4 mono-folio text-sauce-muted md:px-6">
        Only today's mission is actionable. Upcoming missions unlock as you complete the one in front of you.
      </footer>
    </article>
  );
}
