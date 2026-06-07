import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import type { CheckIn, CheckInOutcome, Mission, Snapshot } from "../types";
import { readStore, snapshot, updateStore } from "../utils/storage";
import { inferProofShape, looksLikeRevenue, pad, personalize, randomDone } from "../utils/format";
import { emitShareToast } from "../utils/toastBus";
import { Typing } from "./Typing";

interface MissionCardProps {
  mission: Mission;
  state?: Snapshot;
  onStateChange?: () => void;
  compact?: boolean;
  locked?: boolean;
  dense?: boolean;
  hideFolio?: boolean;
  dayLabel?: number;
  notice?: string | null;
  loading?: boolean;
  onRequestCoach?: (prompt: string) => void;
  proofMode?: boolean;
}

type CoachIntent = "too_hard" | "adjust" | "need_help";
type ResponseValue = "done" | CoachIntent;

const COACH_PROMPTS: Record<CoachIntent, string> = {
  too_hard: "Too hard because: ",
  adjust: "Adjust because: ",
  need_help: "Help because: ",
};

export function MissionCard({ mission, state, onStateChange, compact = false, locked = false, dense = false, hideFolio = false, dayLabel, notice = null, loading = false, onRequestCoach, proofMode = false }: MissionCardProps) {
  const [pendingDone, setPendingDone] = useState(false);
  const [localMission, setLocalMission] = useState<Mission>(mission);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (celebrating) return;
    setLocalMission(mission);
  }, [mission, celebrating]);

  const [oldXp, setOldXp] = useState(state?.user?.execution_score || 0);
  const [newXp, setNewXp] = useState(state?.user?.execution_score || 0);
  const [oldStreak, setOldStreak] = useState(state?.streak?.count || 0);
  const [newStreak, setNewStreak] = useState(state?.streak?.count || 0);
  const user = state?.user || readStore("thesauce_user");
  const checkins = state?.checkins || readStore("thesauce_checkins");
  const adjustedCount = checkins.filter((c) => c.mission_number === localMission.mission_number && c.outcome === "adjusted").length;

  const options: [ResponseValue, string][] = [
    ["done", "Done"],
    ["too_hard", "Too hard"],
    ...(adjustedCount >= 2 ? [] : ([["adjust", "Adjust"]] as [ResponseValue, string][])),
    ["need_help", "Help"],
  ];

  function handleSelect(value: ResponseValue) {
    if (value === "done") {
      setPendingDone(true);
      return;
    }
    setPendingDone(false);
    onRequestCoach?.(COACH_PROMPTS[value]);
  }

  function saveCheckin(outcome: CheckInOutcome, note: string | null = null): CheckIn[] {
    const next: CheckIn[] = [...readStore("thesauce_checkins"), {
      date: new Date().toISOString(),
      mission_number: localMission.mission_number,
      outcome,
      obstacle: null,
      note,
      mood: null,
    }];
    updateStore("thesauce_checkins", next);
    return next;
  }

  function completeMission(proofNote: string | null = null) {
    const snap = snapshot();
    const current = localMission;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();
    const streak = { ...snap.streak };
    const userNext = { ...snap.user };
    const skills = { ...snap.skills };
    const missions = snap.missions.map((m) => m.mission_number === current.mission_number ? { ...current, completed: true, completed_at: now } : m);
    setOldXp(userNext.execution_score);
    setOldStreak(streak.count);
    skills[current.skill] = Math.min(100, (skills[current.skill] || 0) + 8);
    userNext.execution_score += current.xp;
    userNext.current_day += 1;
    userNext.current_zone = userNext.current_day > 20 ? 3 : userNext.current_day > 10 ? 2 : 1;
    if (!userNext.first_dollar_badge) {
      const todayPrefix = today;
      const recentChats = [
        ...readStore("thesauce_dashboard_chat"),
        ...readStore("thesauce_chat_history"),
      ]
        .filter((m) => m.role === "user" && m.timestamp.startsWith(todayPrefix))
        .map((m) => m.content);
      if (recentChats.some(looksLikeRevenue)) userNext.first_dollar_badge = true;
    }
    if (streak.last_checkin_date !== today) {
      streak.count += 1;
      streak.last_checkin_date = today;
      streak.longest = Math.max(streak.longest, streak.count);
    }
    updateStore("thesauce_user", userNext);
    updateStore("thesauce_missions", missions);
    updateStore("thesauce_skills", skills);
    updateStore("thesauce_streak", streak);
    saveCheckin("completed", proofNote);
    setNewXp(userNext.execution_score);
    setNewStreak(streak.count);
    setCelebrating(true);
    setCelebrationMessage(randomDone(streak.count));
    setPendingDone(false);
    onStateChange?.();
    if (current.shareable) {
      setTimeout(() => emitShareToast({
        intent: "share-win",
        mission: current,
        defaultText: "",
      }), 900);
    }
  }

  if (loading) {
    return (
      <section className="border-y border-sauce-hairlineStrong py-12 text-center">
        <p className="mono-folio mb-4 text-sauce-gold">Re-typesetting</p>
        <p className="font-display text-2xl italic text-sauce-creamMuted">Finding a better fit…</p>
        <Typing />
      </section>
    );
  }

  const nextMission = state?.missions?.find((m) => m.mission_number === localMission.mission_number + 1);
  const previewMission = state?.missions?.find((m) => m.mission_number === localMission.mission_number + 2);

  if (celebrating) {
    return (
      <section className="relative animate-success-flash border-y border-sauce-gold/50 py-10">
        <Confetti />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_240px] md:gap-12">
          <div>
            <p className="mono-folio mb-3 text-sauce-gold">Mission complete</p>
            <p className="font-display text-[clamp(28px,4vw,40px)] font-medium italic leading-[1.15] tracking-editorial text-sauce-cream">
              “{celebrationMessage}”
            </p>
          </div>
          <div className="grid grid-cols-2 border-y border-sauce-hairlineStrong divide-x divide-sauce-hairlineStrong md:border-l md:border-y-0 md:pl-0">
            <div className="flex flex-col gap-1 px-3 py-4">
              <span className="mono-folio text-sauce-muted">XP</span>
              <span className="font-display text-2xl font-medium tabular text-sauce-gold">{oldXp} → {newXp}</span>
            </div>
            <div className="flex flex-col gap-1 px-3 py-4">
              <span className="mono-folio text-sauce-muted">Streak</span>
              <span className="font-display text-2xl font-medium tabular text-sauce-gold">{oldStreak} → {newStreak}</span>
            </div>
          </div>
        </div>
        {nextMission && (
          <div className="mt-12">
            <p className="mono-folio mb-4 text-sauce-creamMuted">Up next</p>
            <MissionCard mission={nextMission} state={snapshot()} onStateChange={onStateChange} onRequestCoach={onRequestCoach} proofMode={proofMode} />
          </div>
        )}
        {previewMission && (
          <div className="mt-8 opacity-40">
            <MissionCard mission={previewMission} state={snapshot()} compact locked />
          </div>
        )}
      </section>
    );
  }

  const skillLabel = localMission.skill.replace("_", " ").toUpperCase();

  return (
    <section className={`relative border-y ${locked ? "border-sauce-hairline opacity-50" : "border-sauce-gold/45"}`}>
      <AnimatePresence initial={false}>
        {notice && (
          <motion.p
            key={notice}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden border-b border-sauce-hairline py-3 mono-folio text-sauce-gold"
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Mission folio strip */}
      {!hideFolio && (
        <div className="flex items-center justify-between border-b border-sauce-hairline py-3 mono-folio">
          <span className="text-sauce-gold">
            MISSION {pad(localMission.mission_number)}
            {dayLabel !== undefined && (
              <span className="text-sauce-creamMuted"> · DAY {pad(dayLabel)}</span>
            )}
          </span>
          <span className="text-sauce-creamMuted">{skillLabel} · +{localMission.xp} XP</span>
        </div>
      )}

      {/* Title + body — dense mode stacks single column; default puts numeral in the margin */}
      <div className={`grid grid-cols-1 gap-6 py-8 md:py-10 ${dense ? "" : "md:grid-cols-[1fr_140px] md:gap-12"}`}>
        <div className="md:order-1">
          <h2 className={`font-display font-semibold leading-[0.95] tracking-tightest text-sauce-cream ${dense ? "text-[clamp(28px,3vw,36px)]" : compact ? "text-[clamp(28px,4vw,36px)]" : "text-[clamp(36px,5vw,56px)]"}`}>
            {localMission.title}
          </h2>

          <div className={`mt-8 grid grid-cols-1 gap-6 ${dense ? "" : "md:grid-cols-2"}`}>
            <div>
              <p className="mono-folio mb-2 text-sauce-creamMuted">Task</p>
              <p className="font-body text-body leading-[1.6] text-sauce-cream">{personalize(localMission.task, user)}</p>
            </div>
            <div>
              <p className="mono-folio mb-2 text-sauce-creamMuted">Why</p>
              <p className="font-body text-caption italic leading-[1.65] text-sauce-creamMuted">{personalize(localMission.why, user)}</p>
            </div>
          </div>
        </div>

        {/* Giant marginal numeral — default layout only */}
        {!dense && (
          <div className="hidden md:order-2 md:flex md:items-start md:justify-end">
            <span aria-hidden className="figure-display text-[180px] text-sauce-gold opacity-90">
              {pad(localMission.mission_number)}
            </span>
          </div>
        )}
      </div>

      {!compact && !locked && !celebrating && adjustedCount >= 2 && (
        <p className="border-t border-sauce-hairline py-4 mono-folio italic text-sauce-creamMuted">
          You've tried two versions of this. Sometimes the resistance is the point. Try completing this one.
        </p>
      )}

      {!compact && !locked && !celebrating && (
        proofMode ? (
          <ProofOfWork
            mission={localMission}
            onSubmit={(note) => completeMission(note)}
            onCoachIntent={(intent) => onRequestCoach?.(COACH_PROMPTS[intent])}
            dense={dense}
          />
        ) : (
          <ResponseControls
            options={options}
            pendingDone={pendingDone}
            onSelect={handleSelect}
            onConfirmDone={completeMission}
            onCancelDone={() => setPendingDone(false)}
          />
        )
      )}
    </section>
  );
}

interface ResponseControlsProps {
  options: [ResponseValue, string][];
  pendingDone: boolean;
  onSelect: (value: ResponseValue) => void;
  onConfirmDone: () => void;
  onCancelDone: () => void;
}

function ResponseControls({ options, pendingDone, onSelect, onConfirmDone, onCancelDone }: ResponseControlsProps) {
  return (
    <div className="border-t border-sauce-hairlineStrong">
      <div role="group" aria-label="How did it go" className="grid grid-cols-2 divide-x divide-y divide-sauce-hairlineStrong sm:grid-cols-4 sm:divide-y-0 [&>*:nth-child(3)]:!border-l-0 sm:[&>*:nth-child(3)]:!border-l">
        {options.map(([value, label], i) => {
          const active = value === "done" && pendingDone;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={`group flex flex-col items-start gap-1 px-4 py-4 text-left transition ${active ? "text-sauce-gold" : "text-sauce-cream hover:text-sauce-gold"}`}
            >
              <span className={`mono-folio ${active ? "text-sauce-gold" : "text-sauce-muted group-hover:text-sauce-gold"}`}>0{i + 1}</span>
              <span className="font-display text-xl font-medium tracking-editorial">{label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {pendingDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden border-t border-sauce-hairlineStrong"
          >
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="mono-folio text-sauce-creamMuted">
                Confirm — locking in completion. <span className="text-sauce-muted">You can't undo this.</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancelDone}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-sauce-borderStrong px-3 py-2 mono-folio text-sauce-creamMuted transition hover:border-sauce-gold hover:text-sauce-gold"
                >
                  <X size={11} strokeWidth={1.8} />
                  Cancel
                </button>
                <button type="button" onClick={onConfirmDone} className="btn-gold !px-4 !py-2.5 !text-[11px]">
                  Confirm done
                  <ArrowRight size={12} strokeWidth={2} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProofOfWorkProps {
  mission: Mission;
  onSubmit: (note: string) => void;
  onCoachIntent: (intent: CoachIntent) => void;
  dense?: boolean;
}

function ProofOfWork({ mission, onSubmit, onCoachIntent, dense = false }: ProofOfWorkProps) {
  const [note, setNote] = useState("");
  const shape = inferProofShape(mission);
  const canSubmit = note.trim().length > 0;

  const textareaEl = (
    <textarea
      value={note}
      onChange={(e) => setNote(e.target.value)}
      placeholder={shape.placeholder}
      rows={4}
      className="no-scrollbar block w-full resize-none rounded-lg border border-sauce-hairlineStrong bg-sauce-ink/60 px-4 py-3 font-body text-body leading-[1.5] text-sauce-cream placeholder:text-sauce-muted focus:border-sauce-gold focus:outline-none"
    />
  );

  const actionRow = (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <CoachChip label="Too hard" onClick={() => onCoachIntent("too_hard")} />
        <CoachChip label="Adjust" onClick={() => onCoachIntent("adjust")} />
        <CoachChip label="Help" onClick={() => onCoachIntent("need_help")} />
      </div>
      <button
        type="button"
        onClick={() => canSubmit && onSubmit(note.trim())}
        disabled={!canSubmit}
        className="inline-flex items-center gap-2 rounded-sm bg-sauce-gold px-5 py-2.5 mono-folio text-sauce-black transition hover:bg-sauce-goldBright disabled:cursor-not-allowed disabled:bg-sauce-borderStrong disabled:text-sauce-muted disabled:hover:bg-sauce-borderStrong"
      >
        Submit work
        <ArrowRight size={12} strokeWidth={2} />
      </button>
    </div>
  );

  const criteriaBlock = (
    <div>
      <p className="mono-folio mb-3 text-sauce-creamMuted">We'll look for</p>
      <ul className="flex flex-col gap-2.5">
        {shape.lookFor.map((item, i) => (
          <li key={i} className="flex gap-2.5 font-body text-caption leading-[1.5] text-sauce-cream">
            <span aria-hidden className="mt-[7px] inline-block h-1 w-1 shrink-0 rounded-full bg-sauce-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  if (dense) {
    return (
      <div className="border-t border-sauce-hairlineStrong">
        <div className="flex flex-col gap-6 px-4 py-6">
          <div>
            <p className="mono-folio mb-3 text-sauce-gold">Proof of work</p>
            {textareaEl}
            {actionRow}
          </div>
          <div className="border-t border-sauce-hairline pt-6">
            {criteriaBlock}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-sauce-hairlineStrong">
      <div className="grid grid-cols-1 gap-7 px-4 py-6 md:grid-cols-[1fr_260px] md:gap-10 md:px-5 md:py-7">
        {/* Criteria — top on mobile, right column on desktop */}
        <div className="order-1 border-b border-sauce-hairline pb-6 md:order-2 md:border-b-0 md:border-l md:pb-0 md:pl-8">
          {criteriaBlock}
        </div>
        {/* Submission */}
        <div className="order-2 md:order-1">
          <p className="mono-folio mb-3 text-sauce-gold">Proof of work</p>
          {textareaEl}
          {actionRow}
        </div>
      </div>
    </div>
  );
}

function CoachChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-sauce-hairlineStrong bg-sauce-ink/60 px-3 py-1.5 mono-folio text-sauce-creamMuted transition hover:border-sauce-gold hover:bg-sauce-surface/60 hover:text-sauce-gold"
    >
      {label}
    </button>
  );
}

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${10 + i * 7}%`,
            ["--cx" as string]: `${(i - 6) * 16}px`,
            ["--cy" as string]: `${90 + (i % 3) * 20}px`,
            ["--cr" as string]: `${80 + i * 30}deg`,
            animationDelay: `${i * 30}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
