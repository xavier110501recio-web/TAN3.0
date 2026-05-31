import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ChatMessage, MapAnnotation, SkillName, Snapshot } from "../types";
import { snapshot, updateStore } from "../utils/storage";
import { generateCoachResponse } from "../utils/MockCoach";
import { pad, roman } from "../utils/format";
import { Shell } from "../components/Shell";
import { Stat } from "../components/Stat";
import { Celebration } from "../components/Celebration";
import { MissionCard } from "../components/MissionCard";
import { MapArtifact } from "../components/MapArtifact";
import { AnnotationDock } from "../components/AnnotationDock";

type DashboardVariant = "classic" | "split";
const DASHBOARD_VARIANT_KEY = "thesauce_dashboard_variant";

export function Dashboard() {
  const navigate = useNavigate();
  const [state, setState] = useState<Snapshot>(snapshot);
  const [variant, setVariant] = useState<DashboardVariant>(() => {
    if (typeof window === "undefined") return "classic";
    const stored = window.localStorage.getItem(DASHBOARD_VARIANT_KEY);
    return stored === "split" ? "split" : "classic";
  });
  const [annotations, setAnnotations] = useState<MapAnnotation[]>([]);
  const [sentToast, setSentToast] = useState<string | null>(null);
  const mission = state.missions.find((m) => m.mission_number === state.user.current_day) || state.missions.at(-1)!;
  const revenueWin = state.checkins.some((c) => /sale|sold|paid|customer|client|dollar|revenue|\$/i.test(c.note || ""));

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DASHBOARD_VARIANT_KEY, variant);
  }, [variant]);

  useEffect(() => {
    if (!sentToast) return;
    const t = setTimeout(() => setSentToast(null), 3200);
    return () => clearTimeout(t);
  }, [sentToast]);

  const folio = [
    "VOL. 01",
    `ZONE ${roman(state.user.current_zone)}`,
    `DAY ${pad(state.user.current_day)}`,
    `STREAK ${pad(state.streak.count)}`,
  ];

  function addAnnotation(selectedText: string, comment: string, context: MapAnnotation["context"]) {
    setAnnotations((prev) => [
      ...prev,
      { id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, selectedText, comment, context },
    ]);
  }

  function sendAnnotationsToCoach() {
    if (annotations.length === 0) return;
    const lines: string[] = ["I have feedback on the roadmap:", ""];
    for (const a of annotations) {
      if (a.context?.missionNumber) lines.push(`**Re: Mission ${pad(a.context.missionNumber)}**`);
      else if (a.context?.zone) lines.push(`**Re: Zone ${roman(a.context.zone)}**`);
      lines.push(`> "${a.selectedText}"`);
      lines.push(`Comment: ${a.comment}`);
      lines.push("");
    }
    const content = lines.join("\n").trim();
    const userMsg: ChatMessage = { role: "user", content, timestamp: new Date().toISOString() };
    const coach = generateCoachResponse(content, state.chat, state.user).response;
    const next: ChatMessage[] = [...state.chat, userMsg, { role: "coach", content: coach, timestamp: new Date().toISOString() }];
    updateStore("thesauce_chat_history", next);
    setState(snapshot());
    setSentToast(`${annotations.length} comment${annotations.length === 1 ? "" : "s"} sent to coach`);
    setAnnotations([]);
  }

  const variantToggle = (
    <div className="mb-section -mt-4 flex items-center gap-3">
      <span className="mono-folio text-sauce-muted">Layout</span>
      <div role="radiogroup" aria-label="Dashboard layout" className="flex divide-x divide-sauce-hairlineStrong border border-sauce-borderStrong">
        {(["classic", "split"] as DashboardVariant[]).map((v) => {
          const active = variant === v;
          return (
            <button
              key={v}
              role="radio"
              aria-checked={active}
              onClick={() => setVariant(v)}
              className={`flex items-center gap-2 px-3 py-1.5 mono-folio transition ${active ? "bg-sauce-gold/10 text-sauce-gold" : "text-sauce-cream hover:text-sauce-gold"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-sauce-gold" : "border border-sauce-borderStrong"}`} />
              {v === "classic" ? "A · Classic" : "B · Split"}
            </button>
          );
        })}
      </div>
      <span className="hidden mono-folio text-sauce-muted sm:inline">Beta — your pick is saved</span>
    </div>
  );

  const statsRow = (
    <section className="grid grid-cols-3 border-y border-sauce-hairlineStrong divide-x divide-sauce-hairlineStrong">
      <Stat label="Streak" value={state.streak.count} unit="days" />
      <Stat label="XP" value={state.user.execution_score} />
      <Stat label="Zone" value={state.user.current_zone} unit={`/ ${roman(state.user.current_zone)}`} />
    </section>
  );

  const skillsSection = (
    <section>
      <div className="mb-5 flex items-baseline justify-between">
        <p className="mono-folio text-sauce-creamMuted">Skills · live</p>
        <p className="mono-folio text-sauce-muted">/ 100</p>
      </div>
      <div className="flex flex-col">
        {(Object.entries(state.skills) as [SkillName, number][]).map(([k, v]) => (
          <div key={k} className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-sauce-hairline py-3 last:border-b">
            <div className="flex items-center gap-4">
              <span className="font-display text-lg font-medium capitalize tracking-editorial">{k.replace("_", " ")}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="relative h-px w-28 bg-sauce-hairlineStrong sm:w-44">
                <span className="absolute inset-y-0 left-0 bg-sauce-gold" style={{ width: `${v}%`, height: "1px" }} />
              </span>
              <span className="mono-folio tabular w-9 text-right text-sauce-gold">{pad(v)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <Shell folio={folio} title={`Day ${pad(state.user.current_day)}.`}>
      {variantToggle}
      {revenueWin && state.user.first_dollar_badge && <Celebration user={state.user} />}

      {variant === "classic" ? (
        <div className="flex flex-col gap-12">
          {statsRow}
          <section>
            <p className="mono-folio mb-4 text-sauce-creamMuted">Today's mission</p>
            <MissionCard mission={mission} state={state} onStateChange={() => setState(snapshot())} />
          </section>
          {skillsSection}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {statsRow}

          {/* Split: mission focus on the left, map on the right */}
          <div className="-mx-gutter md:mx-0 md:grid md:min-h-[640px] md:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] md:gap-0">
            <div className="px-gutter md:px-0 md:pr-8">
              <p className="mono-folio mb-4 text-sauce-creamMuted">Today's mission</p>
              <MissionCard mission={mission} state={state} onStateChange={() => setState(snapshot())} />
              <div className="mt-6 flex flex-col gap-3 border-t border-sauce-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="mono-folio text-sauce-muted">Want the full chat with the coach?</p>
                <button onClick={() => navigate("/coach")} className="btn-ghost">
                  Open the coach
                  <ArrowRight size={12} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="mt-10 border-t border-sauce-hairlineStrong md:mt-0 md:border-l md:border-t-0 md:max-h-[640px] md:overflow-y-auto md:no-scrollbar">
              <MapArtifact missions={state.missions} user={state.user} onAnnotate={addAnnotation} />
            </div>
          </div>

          {skillsSection}

          {/* Floating annotation dock on split variant */}
          {annotations.length > 0 && (
            <div className="fixed bottom-16 left-0 right-0 z-30 md:bottom-4 md:left-auto md:right-4 md:max-w-md">
              <AnnotationDock
                annotations={annotations}
                onRemove={(id) => setAnnotations((prev) => prev.filter((a) => a.id !== id))}
                onSend={sendAnnotationsToCoach}
                onClear={() => setAnnotations([])}
                sendLabel="Send to coach"
              />
            </div>
          )}
        </div>
      )}

      {/* Toast after sending annotations */}
      <AnimatePresence>
        {sentToast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 border border-sauce-gold/50 bg-sauce-ink/95 px-4 py-2 backdrop-blur md:bottom-6 md:left-auto md:right-6 md:translate-x-0"
          >
            <div className="flex items-center gap-3 mono-folio">
              <span className="text-sauce-gold">{sentToast}</span>
              <button onClick={() => navigate("/coach")} className="text-sauce-cream underline underline-offset-4 decoration-sauce-hairlineStrong hover:text-sauce-goldBright hover:decoration-sauce-goldBright">
                View in coach →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
