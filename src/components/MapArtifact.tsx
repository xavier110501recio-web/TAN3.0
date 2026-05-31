import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import type { Mission, SkillName, User } from "../types";

interface MapArtifactProps {
  missions: Mission[];
  user: User;
  onAnnotate: (selectedText: string, comment: string, context: { missionNumber?: number; zone?: number; section?: string }) => void;
  className?: string;
}

const ZONE_META: Record<number, { name: string; range: string; reasoning: string }> = {
  1: {
    name: "Foundation",
    range: "Days 01–10",
    reasoning: "Define who you're for, what you offer, and start the first real customer conversations. Market research before anything else.",
  },
  2: {
    name: "First contact",
    range: "Days 11–20",
    reasoning: "Real outreach, handling responses, building content that lands. Iterate based on what the market tells you.",
  },
  3: {
    name: "First dollar",
    range: "Days 21–30",
    reasoning: "Direct offers, follow-ups, tracking money. End the sprint with proof someone paid.",
  },
};

function roman(n: number): string {
  return ["", "I", "II", "III", "IV", "V"][n] || String(n);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function primarySkills(missions: Mission[]): string[] {
  const tally = new Map<SkillName, number>();
  missions.forEach((m) => tally.set(m.skill, (tally.get(m.skill) || 0) + 1));
  return Array.from(tally.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k.replace("_", " "));
}

interface SelectionPopover {
  text: string;
  x: number;
  y: number;
  showInput: boolean;
  context: { missionNumber?: number; zone?: number; section?: string };
}

export function MapArtifact({ missions, user, onAnnotate, className }: MapArtifactProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<SelectionPopover | null>(null);
  const [comment, setComment] = useState("");

  const zones = useMemo(() => Array.from(new Set(missions.map((m) => m.zone))).sort((a, b) => a - b), [missions]);

  /* ─ Selection → popover ─ */
  useEffect(() => {
    const panel = containerRef.current;
    if (!panel) return;

    function handleMouseUp(e: MouseEvent) {
      if (popoverRef.current?.contains(e.target as Node)) return;
      requestAnimationFrame(() => {
        if (popoverRef.current?.contains(e.target as Node)) return;

        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) {
          setPopover(null);
          return;
        }
        const text = sel.toString().trim();
        if (!text || text.length < 2) {
          setPopover(null);
          return;
        }
        const range = sel.getRangeAt(0);
        if (!panel || !panel.contains(range.commonAncestorContainer)) {
          setPopover(null);
          return;
        }
        const rect = range.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();

        // Walk up the DOM to find data attributes for context
        let node: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
        if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        let missionNumber: number | undefined;
        let zone: number | undefined;
        let section: string | undefined;
        while (node && node !== panel) {
          if (!missionNumber && node.dataset?.missionNumber) missionNumber = Number(node.dataset.missionNumber);
          if (!zone && node.dataset?.zone) zone = Number(node.dataset.zone);
          if (!section && node.dataset?.section) section = node.dataset.section;
          node = node.parentElement;
        }

        setPopover({
          text,
          x: rect.left + rect.width / 2 - panelRect.left,
          y: rect.top - panelRect.top + panel.scrollTop - 42,
          showInput: false,
          context: { missionNumber, zone, section },
        });
      });
    }

    function handleMouseDown(e: MouseEvent) {
      if (popoverRef.current?.contains(e.target as Node)) return;
      setPopover(null);
    }

    panel.addEventListener("mouseup", handleMouseUp);
    panel.addEventListener("mousedown", handleMouseDown);
    return () => {
      panel.removeEventListener("mouseup", handleMouseUp);
      panel.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  function commit() {
    if (!popover || !comment.trim()) return;
    onAnnotate(popover.text, comment.trim(), popover.context);
    window.getSelection()?.removeAllRanges();
    setComment("");
    setPopover(null);
  }

  function flagOnly() {
    if (!popover) return;
    onAnnotate(popover.text, "(flagged for review)", popover.context);
    window.getSelection()?.removeAllRanges();
    setComment("");
    setPopover(null);
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sauce-hairlineStrong bg-sauce-black/95 px-5 py-3 backdrop-blur md:px-6">
        <span className="mono-folio text-sauce-gold">Full map · {missions.length} items</span>
        <span className="mono-folio text-sauce-muted">Select text to comment</span>
      </div>

      {/* Scrollable body with selection capture */}
      <div ref={containerRef} className="relative">
        {zones.map((zone) => {
          const items = missions.filter((m) => m.zone === zone);
          const done = items.filter((m) => m.completed).length;
          const meta = ZONE_META[zone];
          const skills = primarySkills(items);

          return (
            <section key={zone} data-zone={zone} className="border-b border-sauce-hairlineStrong">
              {/* Zone header */}
              <header data-section="zone-header" className="px-5 py-5 md:px-6 md:py-6">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="mono-folio text-sauce-gold">Zone {roman(zone)} · {meta?.range}</p>
                    <h3 className="mt-2 font-display text-3xl font-medium tracking-editorial text-sauce-cream md:text-4xl">
                      {meta?.name}
                    </h3>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="relative block h-px w-24 bg-sauce-hairlineStrong">
                      <span className="absolute inset-y-0 left-0 bg-sauce-gold" style={{ width: `${(done / items.length) * 100}%`, height: "1px" }} />
                    </span>
                    <span className="mono-folio tabular text-sauce-creamMuted">{pad(done)} / {pad(items.length)}</span>
                  </div>
                </div>
                {skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 mono-folio text-sauce-muted">
                    <span>Primary skills:</span>
                    {skills.map((s) => (
                      <span key={s} className="text-sauce-creamMuted">{s}</span>
                    ))}
                  </div>
                )}
                {meta?.reasoning && (
                  <p className="mt-3 max-w-[60ch] font-body text-caption leading-[1.6] text-sauce-creamMuted">
                    {meta.reasoning}
                  </p>
                )}
              </header>

              {/* Missions */}
              <ul>
                {items.map((m) => {
                  const isCurrent = m.mission_number === user.current_day && !m.completed;
                  const locked = m.mission_number > user.current_day && !m.completed;
                  return (
                    <li key={m.mission_number} data-mission-number={m.mission_number} className={`border-t border-sauce-hairline px-5 py-4 md:px-6 ${locked ? "opacity-50" : ""}`}>
                      <div className="grid grid-cols-[34px_1fr_auto] items-baseline gap-4">
                        <span className={`mono-folio tabular ${m.completed ? "text-sauce-gold" : isCurrent ? "text-sauce-gold" : "text-sauce-muted"}`}>
                          {m.completed ? "✓" : isCurrent ? "●" : locked ? "○" : "·"} {pad(m.mission_number)}
                        </span>
                        <div>
                          <h4 className="font-display text-xl font-medium tracking-editorial text-sauce-cream">{m.title}</h4>
                          <p className="mt-1 mono-folio text-sauce-creamMuted">
                            {m.skill.replace("_", " ")} · +{m.xp} XP{m.adjusted ? " · adjusted" : ""}
                          </p>
                        </div>
                        <span className="mono-folio text-sauce-muted">
                          {m.completed ? "DONE" : isCurrent ? "NOW" : locked ? "LOCK" : ""}
                        </span>
                      </div>
                      {isCurrent && (
                        <div className="mt-3 max-w-[60ch] font-body text-caption leading-[1.6] text-sauce-creamMuted">
                          <span className="mono-folio text-sauce-muted">Task —</span> {m.task}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {/* Floating selection popover */}
        {popover && (
          <div
            ref={popoverRef}
            className="absolute z-20 -translate-x-1/2"
            style={{ left: popover.x, top: popover.y }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            {!popover.showInput ? (
              <div className="flex items-stretch divide-x divide-sauce-hairlineStrong border border-sauce-gold/60 bg-sauce-ink shadow-[0_18px_42px_rgba(0,0,0,0.6)]">
                <button
                  type="button"
                  onClick={() => setPopover((p) => (p ? { ...p, showInput: true } : null))}
                  className="flex items-center gap-2 px-3 py-2 mono-folio text-sauce-gold transition hover:bg-sauce-gold/10"
                >
                  <MessageSquare size={11} strokeWidth={1.8} />
                  Comment for coach
                </button>
                <button
                  type="button"
                  onClick={flagOnly}
                  className="px-3 py-2 mono-folio text-sauce-creamMuted transition hover:bg-sauce-surface hover:text-sauce-cream"
                >
                  Flag
                </button>
                <button
                  type="button"
                  onClick={() => setPopover(null)}
                  className="px-2 text-sauce-muted transition hover:text-sauce-cream"
                  aria-label="Dismiss"
                >
                  <X size={12} strokeWidth={1.8} />
                </button>
              </div>
            ) : (
              <div className="w-72 border border-sauce-gold/60 bg-sauce-ink p-3 shadow-[0_18px_42px_rgba(0,0,0,0.6)]">
                <p className="mono-folio mb-2 line-clamp-1 italic text-sauce-creamMuted">
                  "{popover.text}"
                </p>
                <input
                  autoFocus
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") { setComment(""); setPopover(null); }
                  }}
                  placeholder="What about this? (Enter to send)"
                  className="w-full border-0 border-b border-sauce-hairlineStrong bg-transparent py-2 font-body text-caption text-sauce-cream outline-none placeholder:text-sauce-muted focus:border-sauce-gold"
                />
                <div className="mt-3 flex items-center justify-between mono-folio text-sauce-muted">
                  <button
                    type="button"
                    onClick={() => { setComment(""); setPopover(null); }}
                    className="transition hover:text-sauce-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={commit}
                    disabled={!comment.trim()}
                    className="text-sauce-gold transition hover:text-sauce-goldBright disabled:opacity-40"
                  >
                    Add ↵
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
