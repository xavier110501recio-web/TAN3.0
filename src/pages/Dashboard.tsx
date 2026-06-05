import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Map as MapIcon, PanelRightOpen, RotateCcw, X } from "lucide-react";
import type { ChatMessage, Mission, Snapshot } from "../types";
import { readStore, snapshot, updateStore } from "../utils/storage";
import { generateAlternativeMission, generateCoachResponse } from "../utils/MockCoach";
import { pad, roman } from "../utils/format";
import { Shell } from "../components/Shell";
import { Stat } from "../components/Stat";
import { Celebration } from "../components/Celebration";
import { MissionCard } from "../components/MissionCard";
import { ChatComposer, type ComposerPrefill } from "../components/ChatComposer";
import { RoadmapView } from "../components/RoadmapView";
import { DashboardSkeleton } from "../components/Skeletons";

type DashView = "mission" | "roadmap";

const TOO_HARD_PATTERN = /^\s*too\s+hard\s+because\s*:?\s*/i;
const ADJUST_PATTERN = /^\s*adjust\s+because\s*:?\s*/i;

export function Dashboard() {
  const [state, setState] = useState<Snapshot>(snapshot);
  const [dashChat, setDashChat] = useState<ChatMessage[]>(() => readStore("thesauce_dashboard_chat"));
  const [view, setView] = useState<DashView>("mission");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [composerPrefill, setComposerPrefill] = useState<ComposerPrefill | null>(null);
  const [chatHidden, setChatHidden] = useState(false);
  const [missionNotice, setMissionNotice] = useState<string | null>(null);
  const [missionLoading, setMissionLoading] = useState(false);
  // TODO(api): mock skeleton hold — when wiring real API, only show <DashboardSkeleton /> if the request hasn't resolved within ~200ms (otherwise it flickers on fast responses).
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  function requestCoach(prompt: string) {
    setMobileSheetOpen(false);
    setChatHidden(false);
    setComposerPrefill({ value: prompt, nonce: Date.now() });
  }

  const mission = state.missions.find((m) => m.mission_number === state.user.current_day) || state.missions.at(-1)!;
  const revenueWin = state.checkins.some((c) => /sale|sold|paid|customer|client|dollar|revenue|\$/i.test(c.note || ""));
  const chatStarted = dashChat.length > 0;
  const chatVisible = chatStarted && !chatHidden;

  const folio = [
    "VOL. 01",
    `ZONE ${roman(state.user.current_zone)}`,
    `DAY ${pad(state.user.current_day)}`,
    `STREAK ${pad(state.streak.count)}`,
  ];

  function pushChat(userText: string, coachText: string): ChatMessage[] {
    const now = new Date().toISOString();
    const next: ChatMessage[] = [
      ...dashChat,
      { role: "user", content: userText, timestamp: now },
      { role: "coach", content: coachText, timestamp: now },
    ];
    updateStore("thesauce_dashboard_chat", next);
    setDashChat(next);
    return next;
  }

  function recordCheckin(outcome: "too_hard" | "adjusted", note: string | null) {
    const checkins = readStore("thesauce_checkins");
    updateStore("thesauce_checkins", [
      ...checkins,
      { date: new Date().toISOString(), mission_number: mission.mission_number, outcome, obstacle: note, note, mood: null },
    ]);
  }

  function applySimplification(reason: string) {
    const simplified: Mission = { ...mission, task: mission.simplified_task || mission.task, simplified: true };
    const missions = state.missions.map((m) => m.mission_number === mission.mission_number ? simplified : m);
    updateStore("thesauce_missions", missions);
    recordCheckin("too_hard", reason || null);
    setMissionNotice("Too hard usually means too vague. Here's a smaller version of the same task:");
    setState(snapshot());
  }

  function applyAdjustment(reason: string) {
    setMissionLoading(true);
    setTimeout(() => {
      const snap = snapshot();
      const alternative = generateAlternativeMission(mission, snap.user, reason);
      const missions = snap.missions.map((m) => m.mission_number === mission.mission_number ? alternative : m);
      updateStore("thesauce_missions", missions);
      recordCheckin("adjusted", reason || null);
      setMissionNotice("Different angle. Same direction.");
      setMissionLoading(false);
      setState(snapshot());
    }, 1300);
  }

  function sendMessage(text: string) {
    if (chatHidden) setChatHidden(false);
    const tooHardMatch = TOO_HARD_PATTERN.exec(text);
    const adjustMatch = ADJUST_PATTERN.exec(text);
    const reason = tooHardMatch ? text.slice(tooHardMatch[0].length).trim()
      : adjustMatch ? text.slice(adjustMatch[0].length).trim()
      : "";

    const coachContent = generateCoachResponse(text, dashChat, { ...state.user, current_mission_title: mission.title }).response;
    pushChat(text, coachContent);

    if (tooHardMatch) applySimplification(reason);
    else if (adjustMatch) applyAdjustment(reason);
  }

  function resetDashboardChat() {
    updateStore("thesauce_dashboard_chat", []);
    setDashChat([]);
    setChatHidden(false);
    setMissionNotice(null);
  }

  function closeChat() {
    setChatHidden(true);
  }

  const statsRow = (
    <section className="grid grid-cols-3 border-y border-sauce-hairlineStrong divide-x divide-sauce-hairlineStrong">
      <Stat label="Streak" value={state.streak.count} unit="days" />
      <Stat label="XP" value={state.user.execution_score} />
      <Stat label="Zone" value={state.user.current_zone} unit={`/ ${roman(state.user.current_zone)}`} />
    </section>
  );

  const inRoadmap = view === "roadmap";
  const roadmapButton = (
    <button
      onClick={() => setView(inRoadmap ? "mission" : "roadmap")}
      className="group flex items-center gap-2 rounded-md border border-sauce-borderStrong px-3 py-2 mono-folio text-sauce-cream transition hover:border-sauce-gold hover:text-sauce-gold"
    >
      {inRoadmap ? <ArrowLeft size={12} strokeWidth={1.8} /> : <MapIcon size={12} strokeWidth={1.8} />}
      {inRoadmap ? "Back to today's task" : "View full roadmap"}
    </button>
  );

  if (pageLoading) {
    return (
      <Shell folio={folio} sidebarMode="full">
        <DashboardSkeleton />
      </Shell>
    );
  }

  return (
    <Shell folio={folio} sidebarMode={chatVisible ? "minimal" : "full"} fullscreen={chatVisible}>
      {revenueWin && state.user.first_dollar_badge && <Celebration user={state.user} />}

      <div className={`flex flex-col gap-12 ${chatVisible ? "min-h-0 flex-1" : ""}`}>
        <div className="shrink-0">{statsRow}</div>

        <LayoutGroup>
          <AnimatePresence mode="wait" initial={false}>
            {!chatVisible ? (
              /* ═══ Pre-chat / chat hidden: centered ═══ */
              <motion.div
                key="pre-chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                className="flex flex-col items-stretch gap-10"
              >
                <div className="mx-auto w-full max-w-[720px]">
                  <p className="mono-folio mb-4 text-sauce-creamMuted">
                    {inRoadmap ? "The map" : "Today's mission"}
                  </p>
                  <motion.div layoutId="dash-mission">
                    <AnimatePresence mode="wait">
                      {!inRoadmap ? (
                        <motion.div key="mission" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}>
                          <MissionCard mission={mission} state={state} onStateChange={() => setState(snapshot())} dayLabel={state.user.current_day} notice={missionNotice} loading={missionLoading} onRequestCoach={requestCoach} />
                        </motion.div>
                      ) : (
                        <motion.div key="roadmap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}>
                          <RoadmapView missions={state.missions} user={state.user} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
                  className="mx-auto w-full max-w-[720px]"
                >
                  <p className="mono-folio mb-3 text-sauce-gold">
                    {chatStarted ? `Resume chat · ${dashChat.length} message${dashChat.length === 1 ? "" : "s"}` : "Stuck? Ask the coach."}
                  </p>
                  <ChatComposer
                    onSend={sendMessage}
                    placeholder={chatStarted ? "Add to the conversation." : "Type or speak — what's in the way of today's task?"}
                    variant="starter"
                    prefill={composerPrefill}
                  />
                  {/* Mobile-only helper beneath the composer */}
                  <p className="mt-3 text-center mono-folio text-sauce-muted md:hidden">
                    Only today's task is actionable
                  </p>
                </motion.div>

                {/* Mobile: full-width centered roadmap button */}
                <button
                  type="button"
                  onClick={() => setView(inRoadmap ? "mission" : "roadmap")}
                  className="mx-auto flex w-full max-w-[720px] items-center justify-center gap-2 border-t border-sauce-hairline pt-5 mono-folio text-sauce-cream transition hover:text-sauce-gold md:hidden"
                >
                  {inRoadmap ? <ArrowLeft size={12} strokeWidth={1.8} /> : <MapIcon size={12} strokeWidth={1.8} />}
                  {inRoadmap ? "Back to today's task" : "View full roadmap"}
                </button>

                {/* Desktop: original split row */}
                <div className="mx-auto hidden w-full max-w-[720px] items-center justify-between border-t border-sauce-hairline pt-5 md:flex">
                  {roadmapButton}
                  <span className="mono-folio text-sauce-muted">Only today's task is actionable</span>
                </div>
              </motion.div>
            ) : (
              /* ═══ Chat open: split ═══ */
              <motion.div
                key="post-chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* Mobile: mission strip on top, chat fills the rest with composer pinned at the bottom */}
                <div className="flex min-h-0 flex-1 flex-col md:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileSheetOpen(true)}
                    className="flex w-full shrink-0 items-center justify-between border-y border-sauce-gold/40 bg-sauce-ink/95 px-4 py-3 text-left"
                    aria-label="Open mission detail"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="mono-folio text-sauce-gold">
                        Mission {pad(mission.mission_number)} <span className="text-sauce-creamMuted">· Day {pad(state.user.current_day)}</span>
                      </span>
                      <span className="font-display text-lg font-medium tracking-editorial text-sauce-cream">{mission.title}</span>
                    </div>
                    <ChevronDown size={16} className="text-sauce-gold" strokeWidth={1.6} />
                  </button>

                  <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
                    <div className="shrink-0">
                      <ChatHeader onReset={resetDashboardChat} onToggleView={() => setView(inRoadmap ? "mission" : "roadmap")} inRoadmap={inRoadmap} onClose={closeChat} />
                    </div>
                    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
                      <ChatTranscript chat={dashChat} />
                    </div>
                    <div className="shrink-0">
                      <ChatComposer onSend={sendMessage} placeholder="Ask the coach." prefill={composerPrefill} />
                    </div>
                  </div>
                </div>

                {/* Desktop: split — both panels fill the locked viewport with internal scroll */}
                <div className="hidden md:flex md:min-h-0 md:flex-1 md:items-stretch">
                  {/* Chat side — header pinned top, composer pinned bottom, transcript scrolls */}
                  <div className="flex min-w-0 flex-1 flex-col gap-4 pr-8 transition-[padding] duration-[360ms]">
                    <div className="shrink-0">
                      <ChatHeader onReset={resetDashboardChat} onToggleView={() => setView(inRoadmap ? "mission" : "roadmap")} inRoadmap={inRoadmap} onClose={closeChat} />
                    </div>
                    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
                      <ChatTranscript chat={dashChat} />
                    </div>
                    <div className="shrink-0">
                      <ChatComposer onSend={sendMessage} placeholder="Ask the coach." prefill={composerPrefill} />
                    </div>
                  </div>

                  {/* Mission side — section header pinned, card body scrolls */}
                  <div className="flex shrink-0 flex-col border-l border-sauce-hairlineStrong pl-8 md:w-[clamp(340px,30vw,400px)] lg:w-[clamp(360px,28vw,420px)]">
                    <p className="mono-folio mb-4 shrink-0 text-sauce-creamMuted">
                      {inRoadmap ? "The map" : "Today's mission"}
                    </p>
                    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
                      <motion.div layoutId="dash-mission">
                        <AnimatePresence mode="wait">
                          {!inRoadmap ? (
                            <motion.div key="mission" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}>
                              <MissionCard mission={mission} state={state} onStateChange={() => setState(snapshot())} dayLabel={state.user.current_day} notice={missionNotice} loading={missionLoading} dense onRequestCoach={requestCoach} />
                            </motion.div>
                          ) : (
                            <motion.div key="roadmap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}>
                              <RoadmapView missions={state.missions} user={state.user} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>

      {/* Mobile mission sheet */}
      <AnimatePresence>
        {mobileSheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex flex-col bg-sauce-black/85 backdrop-blur-sm md:hidden"
            onClick={() => setMobileSheetOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
              className="mt-auto max-h-[85vh] overflow-y-auto rounded-t-xl border-t border-sauce-gold/40 bg-sauce-ink px-4 pb-8 pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <span aria-hidden className="mx-auto mb-4 block h-1 w-12 rounded-full bg-sauce-borderStrong" />
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="mono-folio text-sauce-gold">
                  Mission {pad(mission.mission_number)}
                  <span className="text-sauce-creamMuted"> · Day {pad(state.user.current_day)}</span>
                  <span className="text-sauce-creamMuted"> · {mission.skill.replace("_", " ").toUpperCase()}</span>
                </span>
                <button onClick={() => setMobileSheetOpen(false)} aria-label="Close" className="text-sauce-cream transition hover:text-sauce-gold">
                  <X size={18} strokeWidth={1.6} />
                </button>
              </div>
              <MissionCard mission={mission} state={state} onStateChange={() => setState(snapshot())} dayLabel={state.user.current_day} notice={missionNotice} loading={missionLoading} hideFolio onRequestCoach={requestCoach} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating "Back to today's task" — only when viewing roadmap */}
      <AnimatePresence>
        {inRoadmap && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
            className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 md:bottom-8"
          >
            <button
              type="button"
              onClick={() => setView("mission")}
              className="flex items-center gap-2.5 rounded-full bg-sauce-gold px-5 py-3 mono-folio text-sauce-black shadow-[0_18px_42px_rgba(0,0,0,0.55)] transition hover:bg-sauce-goldBright"
            >
              <ArrowLeft size={13} strokeWidth={2} />
              Back to today's task
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

function ChatHeader({ onReset, onToggleView, inRoadmap, onClose }: { onReset: () => void; onToggleView: () => void; inRoadmap: boolean; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-sauce-hairline pb-3">
      <span className="mono-folio whitespace-nowrap text-sauce-gold">
        <span className="sm:hidden">Coach</span>
        <span className="hidden sm:inline">The coach · today</span>
      </span>
      <div className="flex items-center gap-1.5">
        <ToolbarBadge
          onClick={onToggleView}
          icon={<MapIcon size={11} strokeWidth={1.8} />}
          shortLabel={inRoadmap ? "Today" : "Map"}
          label={inRoadmap ? "Today's task" : "Full roadmap"}
        />
        <ToolbarBadge
          onClick={onReset}
          icon={<RotateCcw size={11} strokeWidth={1.8} />}
          shortLabel="Reset"
          label="Reset chat"
        />
        <ToolbarBadge
          onClick={onClose}
          icon={<PanelRightOpen size={11} strokeWidth={1.8} />}
          label="Close"
        />
      </div>
    </div>
  );
}

function ToolbarBadge({ label, shortLabel, onClick, icon }: { label: string; shortLabel?: string; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="group inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-sauce-borderStrong px-2 py-1.5 mono-folio text-sauce-creamMuted transition hover:border-sauce-gold hover:bg-sauce-surface/60 hover:text-sauce-gold"
    >
      <span className="text-sauce-gold transition group-hover:text-sauce-goldBright">{icon}</span>
      <span className="sm:hidden">{shortLabel || label}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ChatTranscript({ chat }: { chat: ChatMessage[] }) {
  const anchorRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.length]);
  return (
    <ol className="flex flex-col gap-5">
      {chat.map((m, i) => (
        <li key={i} ref={i === chat.length - 1 ? anchorRef : undefined} className="grid grid-cols-[80px_1fr] gap-4 md:grid-cols-[96px_1fr]">
          <div className="flex flex-col">
            <span className={`mono-folio ${m.role === "coach" ? "text-sauce-gold" : "text-sauce-creamMuted"}`}>
              {m.role === "coach" ? "Coach" : "You"}
            </span>
            <span className="mono-folio mt-1 text-sauce-muted">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {m.role === "coach" ? (
            <p className="font-body text-body leading-[1.65] whitespace-pre-wrap text-sauce-cream">{m.content}</p>
          ) : (
            <div className="flex">
              <p className="inline-block max-w-full rounded-md border border-sauce-hairlineStrong bg-sauce-surface/60 px-3.5 py-2 font-body text-body leading-[1.5] whitespace-pre-wrap text-sauce-cream">
                {m.content}
              </p>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
