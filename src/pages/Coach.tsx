import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import type { ChatMessage, MapAnnotation, Snapshot } from "../types";
import { snapshot, updateStore } from "../utils/storage";
import { generateCoachResponse } from "../utils/MockCoach";
import { pad, roman } from "../utils/format";
import { Folio, Shell } from "../components/Shell";
import { BriefingCard } from "../components/BriefingCard";
import { MapArtifact } from "../components/MapArtifact";
import { AnnotationDock } from "../components/AnnotationDock";

export function Coach() {
  const navigate = useNavigate();
  const [state, setState] = useState<Snapshot>(snapshot);
  const [text, setText] = useState("");
  const [annotations, setAnnotations] = useState<MapAnnotation[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const briefingSeen = state.user.plan_summary_seen;
  const firstMission = state.missions.find((m) => m.mission_number === state.user.current_day) || state.missions[0];

  function send(messageText?: string) {
    const content = (messageText ?? text).trim();
    if (!content) return;
    const userMsg: ChatMessage = { role: "user", content, timestamp: new Date().toISOString() };
    const coach = generateCoachResponse(content, state.chat, state.user).response;
    const history: ChatMessage[] = [...state.chat, userMsg, { role: "coach", content: coach, timestamp: new Date().toISOString() }];
    updateStore("thesauce_chat_history", history);
    if (!messageText) setText("");
    setState(snapshot());
  }

  function addAnnotation(selectedText: string, comment: string, context: MapAnnotation["context"]) {
    setAnnotations((prev) => [
      ...prev,
      { id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, selectedText, comment, context },
    ]);
  }

  function sendAnnotations() {
    if (annotations.length === 0) return;
    const lines: string[] = ["I have feedback on the roadmap:", ""];
    for (const a of annotations) {
      if (a.context?.missionNumber) lines.push(`**Re: Mission ${pad(a.context.missionNumber)}**`);
      else if (a.context?.zone) lines.push(`**Re: Zone ${roman(a.context.zone)}**`);
      lines.push(`> "${a.selectedText}"`);
      lines.push(`Comment: ${a.comment}`);
      lines.push("");
    }
    send(lines.join("\n").trim());
    setAnnotations([]);
  }

  function openMission() {
    if (!briefingSeen) updateStore("thesauce_user", { ...state.user, plan_summary_seen: true });
    navigate("/dashboard");
  }

  const folio = ["DIALOGUE", briefingSeen ? "OFF-RECORD" : "BRIEFING", `${state.chat.length} TURNS`];

  return (
    <Shell folio={folio} title="The coach.">
      <div className="-mx-gutter md:mx-0 md:grid md:h-[calc(100vh-240px)] md:min-h-[640px] md:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] md:gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
        {/* Chat side */}
        <div className="md:flex md:h-full md:flex-col md:overflow-hidden md:border-r md:border-sauce-hairlineStrong">
          {/* Scrollable: desktop scrolls internally, mobile scrolls the page */}
          <div className="px-gutter pt-2 pb-36 md:flex-1 md:overflow-y-auto md:no-scrollbar md:px-0 md:pr-8 md:pt-8 md:pb-6">
            <p className="max-w-measure mb-8 text-lede text-sauce-creamMuted">
              Direct. Not a chatbot, not a therapist, not a cheerleader. Name the obstacle. Get the next move.
            </p>

            <div className="mb-10">
              <BriefingCard
                user={state.user}
                firstMission={firstMission}
                onOpenMission={openMission}
                onOpenMap={() => setMapOpen(true)}
                showMapButton
                timestamp={state.user.joined_at}
              />
            </div>

            {state.chat.length > 0 && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <span className="rule rule-strong flex-1" />
                  <span className="mono-folio text-sauce-muted">Conversation</span>
                  <span className="rule rule-strong flex-1" />
                </div>
                <ol className="flex flex-col gap-6">
                  {state.chat.map((m, i) => (
                    <li key={i} className="grid grid-cols-[96px_1fr] gap-5 md:grid-cols-[120px_1fr] md:gap-6">
                      <div className="flex flex-col">
                        <span className={`mono-folio ${m.role === "coach" ? "text-sauce-gold" : "text-sauce-creamMuted"}`}>
                          {m.role === "coach" ? "The coach" : "You"}
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
              </>
            )}
          </div>

          {/* Dock + input — fixed bottom on mobile (above bottom nav), in-flow on desktop */}
          <div className="fixed bottom-16 left-0 right-0 z-30 md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto">
            <AnnotationDock
              annotations={annotations}
              onRemove={(id) => setAnnotations((prev) => prev.filter((a) => a.id !== id))}
              onSend={sendAnnotations}
              onClear={() => setAnnotations([])}
            />
            <div className="border-t border-sauce-hairlineStrong bg-sauce-black/95 px-gutter py-3 backdrop-blur md:px-0 md:pr-8 md:py-4">
              <div className="flex items-end gap-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Tell the coach what's in the way."
                  className="input flex-1"
                />
                <button onClick={() => send()} className="btn-gold !px-4 !py-3" aria-label="Send">
                  <Send size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop map */}
        <div className="hidden md:block md:h-full md:overflow-y-auto md:no-scrollbar">
          <MapArtifact missions={state.missions} user={state.user} onAnnotate={addAnnotation} />
        </div>
      </div>

      {/* Mobile map sheet */}
      <AnimatePresence>
        {mapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-sauce-black md:hidden"
          >
            <header className="flex items-center justify-between border-b border-sauce-hairlineStrong px-gutter py-4">
              <Folio items={["FULL MAP", `${state.missions.length} ITEMS`]} />
              <button onClick={() => setMapOpen(false)} className="text-sauce-cream" aria-label="Close map">
                <X size={18} strokeWidth={1.6} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto">
              <MapArtifact
                missions={state.missions}
                user={state.user}
                onAnnotate={(selectedText, comment, context) => {
                  addAnnotation(selectedText, comment, context);
                  setMapOpen(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
