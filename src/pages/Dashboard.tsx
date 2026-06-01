import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Map as MapIcon, X } from "lucide-react";
import type { ChatMessage, Snapshot } from "../types";
import { readStore, snapshot, updateStore } from "../utils/storage";
import { generateCoachResponse } from "../utils/MockCoach";
import { pad, roman } from "../utils/format";
import { Shell } from "../components/Shell";
import { Stat } from "../components/Stat";
import { Celebration } from "../components/Celebration";
import { MissionCard } from "../components/MissionCard";
import { ChatComposer, type ComposerPrefill } from "../components/ChatComposer";
import { RoadmapView } from "../components/RoadmapView";

type DashView = "mission" | "roadmap";

export function Dashboard() {
  const [state, setState] = useState<Snapshot>(snapshot);
  const [dashChat, setDashChat] = useState<ChatMessage[]>(() => readStore("thesauce_dashboard_chat"));
  const [view, setView] = useState<DashView>("mission");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [composerPrefill, setComposerPrefill] = useState<ComposerPrefill | null>(null);

  function requestCoach(prompt: string) {
    setMobileSheetOpen(false);
    setComposerPrefill({ value: prompt, nonce: Date.now() });
  }

  const mission = state.missions.find((m) => m.mission_number === state.user.current_day) || state.missions.at(-1)!;
  const revenueWin = state.checkins.some((c) => /sale|sold|paid|customer|client|dollar|revenue|\$/i.test(c.note || ""));
  const chatStarted = dashChat.length > 0;

  const folio = [
    "VOL. 01",
    `ZONE ${roman(state.user.current_zone)}`,
    `DAY ${pad(state.user.current_day)}`,
    `STREAK ${pad(state.streak.count)}`,
  ];

  function sendMessage(text: string) {
    const userMsg: ChatMessage = { role: "user", content: text, timestamp: new Date().toISOString() };
    const coachContent = generateCoachResponse(text, dashChat, { ...state.user, current_mission_title: mission.title }).response;
    const coachMsg: ChatMessage = { role: "coach", content: coachContent, timestamp: new Date().toISOString() };
    const next = [...dashChat, userMsg, coachMsg];
    updateStore("thesauce_dashboard_chat", next);
    setDashChat(next);
  }

  function resetDashboardChat() {
    updateStore("thesauce_dashboard_chat", []);
    setDashChat([]);
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

  return (
    <Shell folio={folio}>
      {revenueWin && state.user.first_dollar_badge && <Celebration user={state.user} />}

      <div className="flex flex-col gap-12">
        {statsRow}

        <LayoutGroup>
          <AnimatePresence mode="wait" initial={false}>
            {!chatStarted ? (
              /* ═══ Pre-chat: centered ═══ */
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
                          <MissionCard mission={mission} state={state} onStateChange={() => setState(snapshot())} dayLabel={state.user.current_day} onRequestCoach={requestCoach} />
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
                  <p className="mono-folio mb-3 text-sauce-gold">Stuck? Ask the coach.</p>
                  <ChatComposer
                    onSend={sendMessage}
                    placeholder="Type or speak — what's in the way of today's task?"
                    variant="starter"
                    prefill={composerPrefill}
                  />
                </motion.div>

                <div className="mx-auto flex w-full max-w-[720px] items-center justify-between border-t border-sauce-hairline pt-5">
                  {roadmapButton}
                  <span className="mono-folio text-sauce-muted">Only today's task is actionable</span>
                </div>
              </motion.div>
            ) : (
              /* ═══ Post-chat: split ═══ */
              <motion.div
                key="post-chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
              >
                {/* Mobile: sticky strip + chat */}
                <div className="md:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileSheetOpen(true)}
                    className="sticky top-[88px] z-10 mb-6 flex w-full items-center justify-between border-y border-sauce-gold/40 bg-sauce-ink/95 px-4 py-3 text-left backdrop-blur"
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

                  <div className="flex flex-col gap-3">
                    <ChatHeader onReset={resetDashboardChat} onToggleView={() => setView(inRoadmap ? "mission" : "roadmap")} inRoadmap={inRoadmap} />
                    <ChatTranscript chat={dashChat} />
                    <ChatComposer onSend={sendMessage} placeholder="Ask the coach." prefill={composerPrefill} />
                  </div>
                </div>

                {/* Desktop: split */}
                <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] md:gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(400px,480px)]">
                  {/* Chat side */}
                  <div className="flex flex-col gap-4 pr-8">
                    <ChatHeader onReset={resetDashboardChat} onToggleView={() => setView(inRoadmap ? "mission" : "roadmap")} inRoadmap={inRoadmap} />
                    <ChatTranscript chat={dashChat} />
                    <ChatComposer onSend={sendMessage} placeholder="Ask the coach." prefill={composerPrefill} />
                  </div>

                  {/* Mission side — animates from centered */}
                  <div className="border-l border-sauce-hairlineStrong pl-8">
                    <p className="mono-folio mb-4 text-sauce-creamMuted">
                      {inRoadmap ? "The map" : "Today's mission"}
                    </p>
                    <motion.div layoutId="dash-mission">
                      <AnimatePresence mode="wait">
                        {!inRoadmap ? (
                          <motion.div key="mission" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}>
                            <MissionCard mission={mission} state={state} onStateChange={() => setState(snapshot())} dayLabel={state.user.current_day} onRequestCoach={requestCoach} />
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
              className="mt-auto max-h-[85vh] overflow-y-auto border-t border-sauce-gold/40 bg-sauce-ink px-4 pb-8 pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="mono-folio text-sauce-gold">
                  Mission {pad(mission.mission_number)} <span className="text-sauce-creamMuted">· Day {pad(state.user.current_day)}</span>
                </span>
                <button onClick={() => setMobileSheetOpen(false)} aria-label="Close" className="text-sauce-cream">
                  <X size={18} strokeWidth={1.6} />
                </button>
              </div>
              <MissionCard mission={mission} state={state} onStateChange={() => setState(snapshot())} dayLabel={state.user.current_day} onRequestCoach={requestCoach} />
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

function ChatHeader({ onReset, onToggleView, inRoadmap }: { onReset: () => void; onToggleView: () => void; inRoadmap: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-sauce-hairline pb-3 mono-folio">
      <span className="text-sauce-gold">The coach · today</span>
      <div className="flex items-center gap-4">
        <button onClick={onToggleView} className="text-sauce-creamMuted transition hover:text-sauce-gold">
          {inRoadmap ? "Today's task" : "Full roadmap"}
        </button>
        <button onClick={onReset} className="text-sauce-muted transition hover:text-sauce-gold">
          Reset chat
        </button>
      </div>
    </div>
  );
}

function ChatTranscript({ chat }: { chat: ChatMessage[] }) {
  return (
    <ol className="flex flex-col gap-5">
      {chat.map((m, i) => (
        <li key={i} className="grid grid-cols-[80px_1fr] gap-4 md:grid-cols-[96px_1fr]">
          <div className="flex flex-col">
            <span className={`mono-folio ${m.role === "coach" ? "text-sauce-gold" : "text-sauce-creamMuted"}`}>
              {m.role === "coach" ? "Coach" : "You"}
            </span>
            <span className="mono-folio mt-1 text-sauce-muted">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className={`font-body text-body leading-[1.65] whitespace-pre-wrap ${m.role === "coach" ? "text-sauce-cream" : "text-sauce-creamMuted"}`}>
            {m.content}
          </p>
        </li>
      ))}
    </ol>
  );
}
