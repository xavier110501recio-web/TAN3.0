import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ComposerAttachment, ComposerConnection } from "../types";
import { freshUserStores, readStore, resetDemo, updateStore } from "../utils/storage";
import { inferNiche } from "../utils/format";
import { IdeaComposer } from "../components/IdeaComposer";
import { Folio, Wordmark } from "../components/Shell";

export function Landing({ preview = false }: { preview?: boolean }) {
  const navigate = useNavigate();
  const user = readStore("thesauce_user");
  const [heroIdea, setHeroIdea] = useState("");
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [connections, setConnections] = useState<ComposerConnection[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "1") {
      resetDemo();
      navigate("/", { replace: true });
      return;
    }
    if (!preview && user?.onboarding_complete) navigate("/dashboard", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const live = ["Maya finished Mission 4", "Tyler made his first $47", "Jordan posted before overthinking", "Priya booked a client"];
  const [liveIndex, setLiveIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLiveIndex((i) => (i + 1) % live.length), 4200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generateFromHero() {
    const raw = heroIdea.trim();
    if (raw.length < 20) {
      navigate("/start", { state: { rawDump: heroIdea } });
      return;
    }
    const now = new Date().toISOString();
    freshUserStores();
    updateStore("thesauce_user", {
      name: "Builder", email: "", city: "",
      raw_dump: raw, goal: raw.slice(0, 160), idea_type: "service", niche: inferNiche(raw),
      blockers: ["I don't know where to start"], daily_time: "30 minutes", budget: "$0",
      current_situation: "Building on the side", existing_skills: "None stated",
      ninety_day_target: "Make my first dollar outside my job",
      current_day: 1, current_zone: 1, is_pro: false, execution_score: 0,
      onboarding_complete: true, plan_summary_seen: false, community_anonymous: false, joined_at: now,
      attachments, connections,
    });
    navigate("/generating");
  }

  return (
    <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-gutter">
        {/* Top folio strip — the masthead */}
        <header className="flex items-center justify-between border-b border-sauce-hairlineStrong py-5">
          <Wordmark />
          <Folio items={["VOL. 01", "ISSUE — TODAY", "FREE"]} />
        </header>

        {/* Hero — editorial spread */}
        <section className="grid grid-cols-1 gap-section pt-section pb-section md:grid-cols-12">
          <div className="md:col-span-7 lg:col-span-8 animate-screen-enter">
            <p className="mono-folio mb-6 text-sauce-gold">Cover Story · No. 01</p>
            <h1 className="font-display text-[clamp(56px,11vw,128px)] font-semibold leading-[0.88] tracking-tightest text-sauce-cream">
              Never be<br />
              <span className="italic font-medium text-sauce-gold">directionless</span><br />
              again.
            </h1>
            <p className="mt-8 max-w-[52ch] font-body text-lede text-sauce-creamMuted">
              A 30-day execution sprint built around your idea, your schedule, and the life you actually live. One clear move every day. No plans. No pep talks. No theatre.
            </p>
          </div>

          {/* Side rail — issue contents */}
          <aside className="md:col-span-5 lg:col-span-4 md:border-l md:border-sauce-hairlineStrong md:pl-10">
            <p className="mono-folio mb-4 text-sauce-creamMuted">In this issue</p>
            <ol className="flex flex-col">
              {[
                ["I", "Dump the idea", "Say what you're building, what blocks you, how much time you actually have."],
                ["II", "Get the map", "TheSauce turns that into a 30-day execution path with market-facing missions."],
                ["III", "Report back", "Check in after each mission. The coach adjusts the next move around what happened."],
              ].map(([num, head, body]) => (
                <li key={num} className="grid grid-cols-[28px_1fr] gap-x-4 border-t border-sauce-hairline py-5 last:border-b">
                  <span className="mono-folio text-sauce-gold">{num}</span>
                  <div>
                    <h3 className="font-display text-2xl font-medium tracking-editorial">{head}</h3>
                    <p className="mt-2 font-body text-caption text-sauce-creamMuted">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </section>

        {/* Pull quote */}
        <section className="border-y border-sauce-hairlineStrong py-section">
          <blockquote className="mx-auto max-w-[36ch] font-display text-[clamp(28px,4vw,44px)] font-medium italic leading-[1.15] tracking-editorial text-sauce-cream">
            “Done and imperfect beats planned and perfect every time.”
          </blockquote>
          <p className="mt-5 mono-folio text-sauce-gold">— Philosophy 01 · Speed and execution</p>
        </section>

        {/* Dump form — main CTA */}
        <section className="grid grid-cols-1 gap-10 pt-section pb-section md:grid-cols-12">
          <div className="md:col-span-5 lg:col-span-4">
            <p className="mono-folio mb-4 text-sauce-gold">Step 01 — Open with the truth</p>
            <h2 className="font-display text-[clamp(36px,5vw,56px)] font-semibold leading-[0.95] tracking-tightest text-sauce-cream">
              Dump the<br /><span className="italic">idea.</span>
            </h2>
            <p className="mt-5 max-w-[40ch] font-body text-caption text-sauce-creamMuted">
              The more honest this is, the better the plan that comes back. There's no payment, no public posting, no signup theatre. Less than 90 seconds.
            </p>
          </div>
          <div className="md:col-span-7 lg:col-span-8">
            <IdeaComposer
              value={heroIdea}
              onChange={setHeroIdea}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              connections={connections}
              onConnectionsChange={setConnections}
              onSubmit={generateFromHero}
            />
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 mono-folio text-sauce-muted">
              <span>No card · No data collected or stored</span>
              <a
                href="/privacy"
                className="underline underline-offset-4 decoration-sauce-hairlineStrong transition hover:text-sauce-goldBright hover:decoration-sauce-goldBright"
              >
                Privacy policy
              </a>
              {(attachments.length > 0 || connections.length > 0) && (
                <span className="text-sauce-gold">
                  {attachments.length > 0 && `${attachments.length} file${attachments.length > 1 ? "s" : ""}`}
                  {attachments.length > 0 && connections.length > 0 && " · "}
                  {connections.length > 0 && `${connections.length} Notion page${connections.length > 1 ? "s" : ""}`}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* What you get — feature ledger */}
        <section className="border-t border-sauce-hairlineStrong pt-section pb-section">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="mono-folio mb-3 text-sauce-creamMuted">Departments</p>
              <h2 className="font-display text-[clamp(32px,4vw,48px)] font-semibold leading-[0.95] tracking-tightest">
                No vague plans.<br />
                <span className="italic">No fake progress.</span>
              </h2>
            </div>
            <ul className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2">
              {[
                ["01", "Daily missions", "One specific market-facing task. Sized to your time."],
                ["02", "XP & streaks", "Earned, not awarded. Tracking without therapy."],
                ["03", "Coach chat", "Reads your check-ins. Names the obstacle. Hands you the next move."],
                ["04", "Crew", "Anonymous wins, milestones, and commitments from other builders."],
              ].map(([num, head, body]) => (
                <li key={num} className="grid grid-cols-[36px_1fr] gap-4 border-t border-sauce-hairline py-5 last:sm:border-b sm:[&:nth-last-child(2)]:border-b">
                  <span className="mono-folio text-sauce-gold">{num}</span>
                  <div>
                    <h3 className="font-display text-2xl font-medium tracking-editorial">{head}</h3>
                    <p className="mt-1.5 font-body text-caption text-sauce-creamMuted">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={generateFromHero} className="btn-gold mt-12 w-full sm:w-auto">
            Show me what to do
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </section>

        {/* Live ticker — bottom marquee */}
        <footer className="flex items-center justify-between border-t border-sauce-hairlineStrong py-5 mono-folio">
          <span className="text-sauce-muted">Live · this minute</span>
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sauce-gold animate-folio-blink" />
            <AnimatePresence mode="wait">
              <motion.span
                key={live[liveIndex]}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.34, ease: [0.2, 0.7, 0.2, 1] }}
                className="text-sauce-cream"
              >
                {live[liveIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </footer>
      </div>
    </main>
  );
}
