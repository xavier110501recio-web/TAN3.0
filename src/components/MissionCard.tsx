import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ChatMessage, CheckIn, CheckInOutcome, Mission, Snapshot } from "../types";
import { readStore, snapshot, updateStore } from "../utils/storage";
import { generateAlternativeMission, generateCoachResponse } from "../utils/MockCoach";
import { pad, personalize, randomDone } from "../utils/format";
import { Typing } from "./Typing";

interface MissionCardProps {
  mission: Mission;
  state?: Snapshot;
  onStateChange?: () => void;
  compact?: boolean;
  locked?: boolean;
  message?: string | null;
}

type CardSelection = "done" | "too_hard" | "adjust" | "need_help" | null;

export function MissionCard({ mission, state, onStateChange, compact = false, locked = false, message = null }: MissionCardProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CardSelection>(null);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"normal" | "loading">("normal");
  const [localMission, setLocalMission] = useState<Mission>(mission);
  const [doneMessage, setDoneMessage] = useState<string | null>(message);
  const [celebrating, setCelebrating] = useState(false);
  const [oldXp, setOldXp] = useState(state?.user?.execution_score || 0);
  const [newXp, setNewXp] = useState(state?.user?.execution_score || 0);
  const [oldStreak, setOldStreak] = useState(state?.streak?.count || 0);
  const [newStreak, setNewStreak] = useState(state?.streak?.count || 0);
  const user = state?.user || readStore("thesauce_user");
  const checkins = state?.checkins || readStore("thesauce_checkins");
  const adjustedCount = checkins.filter((c) => c.mission_number === localMission.mission_number && c.outcome === "adjusted").length;

  const options: [Exclude<CardSelection, null>, string][] = [
    ["done", "Done"],
    ["too_hard", "Too hard"],
    ...(adjustedCount >= 2 ? [] : ([["adjust", "Adjust"]] as [Exclude<CardSelection, null>, string][])),
    ["need_help", "Help"],
  ];

  function submit() {
    if (selected === "done") completeMission();
    if (selected === "too_hard") showSimplified();
    if (selected === "adjust") adjustMission();
    if (selected === "need_help") openCoach();
  }

  function saveCheckin(outcome: CheckInOutcome): CheckIn[] {
    const next: CheckIn[] = [...readStore("thesauce_checkins"), {
      date: new Date().toISOString(),
      mission_number: localMission.mission_number,
      outcome,
      obstacle: outcome === "completed" ? null : note || null,
      note: note || null,
      mood: null,
    }];
    updateStore("thesauce_checkins", next);
    return next;
  }

  function completeMission() {
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
    if (/sale|sold|paid|customer|client|dollar|revenue|\$/i.test(note)) userNext.first_dollar_badge = true;
    if (streak.last_checkin_date !== today) {
      streak.count += 1;
      streak.last_checkin_date = today;
      streak.longest = Math.max(streak.longest, streak.count);
    }
    updateStore("thesauce_user", userNext);
    updateStore("thesauce_missions", missions);
    updateStore("thesauce_skills", skills);
    updateStore("thesauce_streak", streak);
    saveCheckin("completed");
    setNewXp(userNext.execution_score);
    setNewStreak(streak.count);
    setCelebrating(true);
    setDoneMessage(randomDone(streak.count));
    setSelected(null);
    onStateChange?.();
  }

  function showSimplified() {
    saveCheckin("too_hard");
    setDoneMessage("Too hard usually means too vague. Here's a smaller version of the same task:");
    setLocalMission({ ...localMission, task: localMission.simplified_task || localMission.task, simplified: true });
    setSelected(null);
    onStateChange?.();
  }

  function adjustMission() {
    saveCheckin("adjusted");
    setMode("loading");
    setTimeout(() => {
      const snap = snapshot();
      const alternative = generateAlternativeMission(localMission, snap.user, note);
      const missions = snap.missions.map((m) => m.mission_number === localMission.mission_number ? alternative : m);
      updateStore("thesauce_missions", missions);
      setLocalMission(alternative);
      setDoneMessage("Different angle. Same direction.");
      setMode("normal");
      setSelected(null);
      onStateChange?.();
    }, 1500);
  }

  function openCoach() {
    const snap = snapshot();
    const userMessage: ChatMessage = { role: "user", content: `I need help with: ${localMission.title}`, timestamp: new Date().toISOString() };
    const coachMessage: ChatMessage = {
      role: "coach",
      content: generateCoachResponse(`${userMessage.content}. ${note}`, snap.chat, { ...snap.user, current_mission_title: localMission.title }).response,
      timestamp: new Date().toISOString(),
    };
    updateStore("thesauce_chat_history", [...snap.chat, userMessage, coachMessage]);
    saveCheckin("need_help");
    navigate("/coach");
  }

  if (mode === "loading") {
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
              “{doneMessage}”
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
            <MissionCard mission={nextMission} state={snapshot()} onStateChange={onStateChange} />
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
      {doneMessage && (
        <p className="border-b border-sauce-hairline py-3 mono-folio text-sauce-gold">{doneMessage}</p>
      )}

      {/* Mission folio strip */}
      <div className="flex items-center justify-between border-b border-sauce-hairline py-3 mono-folio">
        <span className="text-sauce-gold">MISSION {pad(localMission.mission_number)}</span>
        <span className="text-sauce-creamMuted">{skillLabel} · +{localMission.xp} XP</span>
      </div>

      {/* Title + body grid — desktop puts the giant numeral in the margin */}
      <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-[1fr_140px] md:gap-12 md:py-10">
        <div className="md:order-1">
          <h2 className={`font-display font-semibold leading-[0.95] tracking-tightest text-sauce-cream ${compact ? "text-[clamp(28px,4vw,36px)]" : "text-[clamp(36px,5vw,56px)]"}`}>
            {localMission.title}
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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

        {/* Giant marginal numeral — desktop only */}
        <div className="hidden md:order-2 md:flex md:items-start md:justify-end">
          <span aria-hidden className="figure-display text-[180px] text-sauce-gold opacity-90">
            {pad(localMission.mission_number)}
          </span>
        </div>
      </div>

      {!compact && !locked && !celebrating && adjustedCount >= 2 && (
        <p className="border-t border-sauce-hairline py-4 mono-folio italic text-sauce-creamMuted">
          You've tried two versions of this. Sometimes the resistance is the point. Try completing this one.
        </p>
      )}

      {!compact && !locked && !celebrating && (
        <ResponseControls options={options} selected={selected} setSelected={setSelected} note={note} setNote={setNote} submit={submit} />
      )}
    </section>
  );
}

interface ResponseControlsProps {
  options: [Exclude<CardSelection, null>, string][];
  selected: CardSelection;
  setSelected: (value: CardSelection) => void;
  note: string;
  setNote: (value: string) => void;
  submit: () => void;
}

function ResponseControls({ options, selected, setSelected, note, setNote, submit }: ResponseControlsProps) {
  return (
    <div className="border-t border-sauce-hairlineStrong">
      {/* Segmented control */}
      <div role="radiogroup" aria-label="How did it go" className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-sauce-hairlineStrong">
        {options.map(([value, label]) => {
          const active = value === selected;
          return (
            <button
              key={value}
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(value)}
              className={`group flex flex-col items-start gap-1 py-4 px-3 text-left transition first:pl-0 ${active ? "text-sauce-gold" : "text-sauce-cream hover:text-sauce-gold"}`}
            >
              <span className="mono-folio text-sauce-muted group-hover:text-sauce-gold">0{options.findIndex(([v]) => v === value) + 1}</span>
              <span className="font-display text-xl font-medium tracking-editorial">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-sauce-hairline">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={1}
          placeholder="What happened? (optional)"
          className="no-scrollbar w-full resize-none bg-transparent py-3 font-body text-caption text-sauce-cream outline-none placeholder:text-sauce-muted"
        />
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden border-t border-sauce-hairlineStrong"
          >
            <button onClick={submit} className="btn-gold w-full !justify-between !px-5 !py-4">
              <span>Submit</span>
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
