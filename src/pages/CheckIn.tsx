import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { CheckInOutcome, CheckInResult } from "../api/types";
import { api, ApiError } from "../lib/api";
import { useMe } from "../lib/useMe";
import { useMissions } from "../lib/useMissions";
import { pad } from "../utils/format";
import { Shell, Wordmark } from "../components/Shell";
import { Stat } from "../components/Stat";

type Outcome = Extract<CheckInOutcome, "completed" | "completed_with_issue" | "partial">;

const OUTCOMES: [Outcome, string, string][] = [
  ["completed", "Completed", "Mission done, no friction."],
  ["completed_with_issue", "Done · friction", "Got there. Hit something on the way."],
  ["partial", "Partial", "Started. Did not finish."],
];

export function CheckIn() {
  const navigate = useNavigate();
  const { snapshot: me, loading: meLoading, error: meError } = useMe();
  const { missions, loading: missionsLoading, error: missionsError } =
    useMissions(me?.profile.onboarding_complete ?? false);

  const [outcome, setOutcome] = useState<Outcome>("completed");
  const [note, setNote] = useState("");
  const [mood, setMood] = useState(4);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (meError?.status === 401 || missionsError?.status === 401) return <Navigate to="/login" replace />;

  if (meLoading || missionsLoading || !me) {
    return (
      <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
        <div className="mx-auto flex min-h-screen w-full max-w-[820px] flex-col items-center justify-center px-gutter">
          <Wordmark size="sm" />
          <p className="mt-8 mono-folio text-sauce-creamMuted">Loading...</p>
        </div>
      </main>
    );
  }

  if (meError || missionsError) {
    return (
      <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
        <div className="mx-auto flex min-h-screen w-full max-w-[820px] flex-col items-center justify-center gap-6 px-gutter text-center">
          <Wordmark size="sm" />
          <p className="mono-folio text-sauce-gold">{(meError || missionsError)?.message ?? "Couldn't load your check-in state."}</p>
        </div>
      </main>
    );
  }

  const currentMission = me.current_mission_number
    ? (missions ?? []).find((m) => m.mission_number === me.current_mission_number)
    : null;

  if (!currentMission) {
    return (
      <Shell folio={["DEBRIEF"]} title="All missions done." hideFolio>
        <p className="text-lede text-sauce-creamMuted">No remaining missions to check in on.</p>
        <button onClick={() => navigate("/dashboard")} className="btn-gold mt-8 self-start">
          Back to dashboard
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </Shell>
    );
  }

  async function submit() {
    if (!currentMission) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.checkins.submit({
        mission_number: currentMission.mission_number,
        outcome,
        obstacle: outcome === "completed" ? null : note || null,
        note: note || null,
        mood,
      });
      // Dashboard refetches /me + /missions on mount, so no need to mirror
      // localStorage here — just hold the result for the debrief screen.
      setResult(res);
    } catch (e) {
      if (e instanceof ApiError) setSubmitError(e.message);
      else setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const folio = ["DEBRIEF", `MISSION ${pad(currentMission.mission_number)}`];

  if (result) {
    return (
      <Shell folio={folio} title="Debrief." hideFolio>
        <div className="flex flex-col gap-10 animate-screen-enter">
          <blockquote className="border-y border-sauce-hairlineStrong py-8 font-display text-[clamp(22px,3vw,30px)] font-medium italic leading-[1.3] tracking-editorial text-sauce-cream">
            "{result.coach_message}"
            <p className="mt-5 mono-folio not-italic text-sauce-gold">— The coach</p>
          </blockquote>
          <div className="grid grid-cols-2 border-y border-sauce-hairlineStrong divide-x divide-sauce-hairlineStrong">
            <Stat label="XP earned" value={result.xp_earned} unit="pts" />
            <Stat label="Streak" value={result.snapshot.streak.count} unit="days" />
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn-gold self-start">
            Back to dashboard
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell folio={folio} title="Check in." hideFolio>
      <div className="flex flex-col gap-12 animate-screen-enter">
        <p className="max-w-measure text-lede text-sauce-creamMuted">
          Report what happened. The mission is only complete after this. Honest beats positive.
        </p>

        <section>
          <p className="mono-folio mb-3 text-sauce-creamMuted">Outcome</p>
          <ul className="flex flex-col border-t border-sauce-hairline">
            {OUTCOMES.map(([v, l, sub]) => {
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

        {submitError && (
          <p className="mono-folio text-sauce-gold">{submitError}</p>
        )}

        <button onClick={submit} disabled={submitting} className="btn-gold self-start disabled:opacity-60">
          {submitting ? "Submitting…" : "Submit debrief"}
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>
    </Shell>
  );
}
