import { ArrowRight, Map as MapIcon } from "lucide-react";
import type { Mission, User } from "../types";
import { generatePlanSummary } from "../utils/MockCoach";

interface BriefingCardProps {
  user: User;
  firstMission: Mission;
  onOpenMission: () => void;
  onOpenMap?: () => void;
  showMapButton?: boolean;
  timestamp?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function roman(n: number): string {
  return ["", "I", "II", "III", "IV", "V"][n] || String(n);
}

function formatTime(iso?: string) {
  if (!iso) return "Just now";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const PHASES: { roman: string; name: string; range: string }[] = [
  { roman: "I", name: "Foundation", range: "Days 01–10" },
  { roman: "II", name: "First contact", range: "Days 11–20" },
  { roman: "III", name: "First dollar", range: "Days 21–30" },
];

export function BriefingCard({ user, firstMission, onOpenMission, onOpenMap, showMapButton = true, timestamp }: BriefingCardProps) {
  const plan = generatePlanSummary(user);
  const dumpExcerpt = user.raw_dump?.trim().slice(0, 220) || user.goal || "";
  const dumpTruncated = (user.raw_dump?.length || 0) > 220;
  const name = user.name?.trim() || "Builder";
  const attachments = user.attachments || [];
  const connections = user.connections || [];

  return (
    <article className="border border-sauce-gold/40 bg-sauce-ink/60">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-sauce-hairlineStrong px-5 py-3 mono-folio">
        <span className="text-sauce-gold">The Coach · Briefing</span>
        <span className="text-sauce-muted">{formatTime(timestamp)}</span>
      </header>

      {/* Greeting */}
      <section className="px-5 pt-6 sm:px-7">
        <p className="mono-folio text-sauce-creamMuted">Issue 01 · For {name}</p>
        <h2 className="mt-3 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[0.98] tracking-tightest text-sauce-cream">
          Your map is built.<br />
          <span className="italic text-sauce-gold">30 missions, 3 zones, your time.</span>
        </h2>
        <p className="mt-4 max-w-[56ch] font-body text-body leading-[1.6] text-sauce-cream">
          {plan.blockerResponse}
        </p>
        <p className="mt-3 max-w-[56ch] font-body text-caption italic leading-[1.6] text-sauce-creamMuted">
          {plan.outcomeStatement}
        </p>
      </section>

      {/* Phases */}
      <section className="px-5 pt-8 sm:px-7">
        <p className="mono-folio mb-3 text-sauce-creamMuted">Phases</p>
        <ol className="flex flex-col">
          {PHASES.map((p, i) => (
            <li key={p.roman} className="grid grid-cols-[36px_1fr_120px] items-baseline gap-3 border-t border-sauce-hairline py-3 last:border-b">
              <span className="mono-folio text-sauce-gold">{p.roman}</span>
              <div>
                <h3 className="font-display text-lg font-medium tracking-editorial text-sauce-cream">{p.name}</h3>
                <p className="mt-0.5 max-w-[48ch] font-body text-caption text-sauce-creamMuted">{plan.phaseDescriptions[i]}</p>
              </div>
              <span className="mono-folio text-right text-sauce-muted">{p.range}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* What we picked up */}
      <section className="px-5 pt-8 sm:px-7">
        <p className="mono-folio mb-3 text-sauce-creamMuted">We picked up</p>
        <blockquote className="border-l-0 border-t border-sauce-hairlineStrong pt-3 font-display text-lg italic leading-[1.5] text-sauce-cream sm:text-xl">
          "{dumpExcerpt}{dumpTruncated ? "…" : ""}"
        </blockquote>
        {(attachments.length > 0 || connections.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {connections.map((c) => (
              <Chip key={c.id} kind="NOTION" label={c.title} />
            ))}
            {attachments.map((a) => (
              <Chip key={a.id} kind="FILE" label={a.name} />
            ))}
          </div>
        )}
        {(attachments.length > 0 || connections.length > 0) && (
          <p className="mt-3 mono-folio text-sauce-muted">
            Referenced in your roadmap. Disconnect anytime in settings.
          </p>
        )}
      </section>

      {/* Mission 01 */}
      <section className="mt-8 border-t border-sauce-gold/40 bg-sauce-surface/40 px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex items-center justify-between border-b border-sauce-hairlineStrong pb-2 mono-folio">
          <span className="text-sauce-gold">Mission {pad(firstMission.mission_number)} · Zone {roman(firstMission.zone)}</span>
          <span className="text-sauce-creamMuted">{firstMission.skill.replace("_", " ").toUpperCase()} · +{firstMission.xp} XP</span>
        </div>
        <h3 className="mt-4 font-display text-[clamp(24px,3.5vw,32px)] font-semibold leading-[0.98] tracking-tightest text-sauce-cream">
          {firstMission.title}
        </h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mono-folio mb-2 text-sauce-creamMuted">Task</p>
            <p className="font-body text-body leading-[1.6] text-sauce-cream">{personalize(firstMission.task, user)}</p>
          </div>
          <div>
            <p className="mono-folio mb-2 text-sauce-creamMuted">Why</p>
            <p className="font-body text-caption italic leading-[1.65] text-sauce-creamMuted">{personalize(firstMission.why, user)}</p>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <footer className="flex flex-col gap-3 border-t border-sauce-hairlineStrong px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <span className="mono-folio text-sauce-muted">Ask me anything below ↓</span>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {showMapButton && onOpenMap && (
            <button type="button" onClick={onOpenMap} className="btn-ghost md:hidden">
              <MapIcon size={12} strokeWidth={1.8} />
              Show full map
            </button>
          )}
          <button type="button" onClick={onOpenMission} className="btn-gold">
            Open Mission {pad(firstMission.mission_number)}
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </footer>
    </article>
  );
}

function Chip({ kind, label }: { kind: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 border border-sauce-borderStrong bg-sauce-surface px-2.5 py-1.5">
      <span className="mono-folio text-sauce-gold">{kind}</span>
      <span className="rule-vertical h-3" />
      <span className="font-body text-caption text-sauce-cream max-w-[200px] truncate">{label}</span>
    </span>
  );
}

function personalize(text: string, user: User | null): string {
  return String(text || "").replaceAll("[NICHE]", user?.niche || "your niche");
}
