import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { CheckIn as CheckInRecord, DebriefResult } from "../types";
import { snapshot, updateStore } from "../utils/storage";
import { generateMissionDebrief } from "../utils/MockCoach";
import { pad } from "../utils/format";
import { Shell } from "../components/Shell";
import { Stat } from "../components/Stat";

export function CheckIn() {
  const navigate = useNavigate();
  const [outcome, setOutcome] = useState<"completed" | "completed_with_issue" | "partial">("completed");
  const [note, setNote] = useState("");
  const [mood, setMood] = useState(4);
  const [done, setDone] = useState<DebriefResult | null>(null);
  const state = snapshot();
  const mission = state.missions.find((m) => m.mission_number === state.user.current_day)!;

  function submit() {
    const result = generateMissionDebrief(outcome, note, state.user.current_day, state.user);
    const today = new Date().toISOString().slice(0, 10);
    const checkin: CheckInRecord = { date: new Date().toISOString(), mission_number: state.user.current_day, outcome, obstacle: outcome === "completed" ? null : note, note, mood };
    const user = { ...state.user };
    let missions = state.missions;
    const skills = { ...state.skills };
    const streak = { ...state.streak };
    if (outcome !== "partial") {
      missions = missions.map((m) => m.mission_number === mission.mission_number ? { ...m, completed: true, completed_at: new Date().toISOString() } : m);
      skills[mission.skill] = Math.min(100, (skills[mission.skill] || 0) + 8);
      user.execution_score += mission.xp;
      user.current_day += 1;
      user.current_zone = user.current_day > 20 ? 3 : user.current_day > 10 ? 2 : 1;
      if (/sale|sold|paid|customer|client|dollar|revenue|\$/i.test(note)) user.first_dollar_badge = true;
      if (streak.last_checkin_date !== today) { streak.count += 1; streak.last_checkin_date = today; streak.longest = Math.max(streak.longest, streak.count); }
    }
    updateStore("thesauce_user", user);
    updateStore("thesauce_missions", missions);
    updateStore("thesauce_skills", skills);
    updateStore("thesauce_streak", streak);
    updateStore("thesauce_checkins", [...state.checkins, checkin]);
    setDone(result);
  }

  const folio = ["DEBRIEF", `MISSION ${pad(state.user.current_day)}`];

  if (done) {
    return (
      <Shell folio={folio} title="Debrief." hideFolio>
        <div className="flex flex-col gap-10 animate-screen-enter">
          <blockquote className="border-y border-sauce-hairlineStrong py-8 font-display text-[clamp(22px,3vw,30px)] font-medium italic leading-[1.3] tracking-editorial text-sauce-cream">
            “{done.coachMessage}”
            <p className="mt-5 mono-folio not-italic text-sauce-gold">— The coach</p>
          </blockquote>
          <div className="grid grid-cols-2 border-y border-sauce-hairlineStrong divide-x divide-sauce-hairlineStrong">
            <Stat label="XP earned" value={done.xpEarned} unit="pts" />
            <Stat label="Streak" value={state.streak.count + 1} unit="days" />
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn-gold self-start">
            Back to dashboard
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </Shell>
    );
  }

  const outcomes: [typeof outcome, string, string][] = [
    ["completed", "Completed", "Mission done, no friction."],
    ["completed_with_issue", "Done · friction", "Got there. Hit something on the way."],
    ["partial", "Partial", "Started. Did not finish."],
  ];

  return (
    <Shell folio={folio} title="Check in." hideFolio>
      <div className="flex flex-col gap-12 animate-screen-enter">
        <p className="max-w-measure text-lede text-sauce-creamMuted">
          Report what happened. The mission is only complete after this. Honest beats positive.
        </p>

        <section>
          <p className="mono-folio mb-3 text-sauce-creamMuted">Outcome</p>
          <ul className="flex flex-col border-t border-sauce-hairline">
            {outcomes.map(([v, l, sub]) => {
              const active = outcome === v;
              return (
                <li key={v} className="border-b border-sauce-hairline">
                  <button onClick={() => setOutcome(v)} className={`group grid w-full grid-cols-[24px_1fr_20px] items-center gap-4 py-4 text-left transition ${active ? "text-sauce-gold" : "text-sauce-cream hover:text-sauce-gold"}`}>
                    <span className={`h-3 w-3 rounded-full border ${active ? "border-sauce-gold bg-sauce-gold" : "border-sauce-borderStrong"}`} />
                    <span>
                      <span className="font-display text-2xl font-medium tracking-editorial">{l}</span>
                      <span className="mt-0.5 block mono-folio text-sauce-creamMuted">{sub}</span>
                    </span>
                    {active && <ArrowRight size={14} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <p className="mono-folio mb-3 text-sauce-creamMuted">Field notes</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Wins, friction, replies, revenue, or what blocked you."
            rows={5}
            className="textarea-bare no-scrollbar"
          />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <p className="mono-folio text-sauce-creamMuted">Mood</p>
            <p className="mono-folio tabular text-sauce-gold">{mood} / 5</p>
          </div>
          <input type="range" min={1} max={5} value={mood} onChange={(e) => setMood(Number(e.target.value))} className="w-full accent-sauce-gold" />
        </section>

        <button onClick={submit} className="btn-gold self-start">
          Submit debrief
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>
    </Shell>
  );
}
