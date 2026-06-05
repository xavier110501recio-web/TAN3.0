import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, ListPlus, MessageSquarePlus, Trash2 } from "lucide-react";
import type { ChatMessage, ChatSession, Snapshot } from "../types";
import { readStore, snapshot, updateStore } from "../utils/storage";
import { generateCoachResponse } from "../utils/MockCoach";
import { pad } from "../utils/format";
import { Shell } from "../components/Shell";
import { ChatComposer } from "../components/ChatComposer";
import { CoachSkeleton } from "../components/Skeletons";

const SESSION_TITLE_MAX = 36;

function newSessionId(): string {
  return `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function titleFromMessage(content: string): string {
  const cleaned = content.trim().replace(/\s+/g, " ");
  if (!cleaned) return "New chat";
  return cleaned.length > SESSION_TITLE_MAX ? `${cleaned.slice(0, SESSION_TITLE_MAX - 1)}…` : cleaned;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Coach() {
  const [state] = useState<Snapshot>(snapshot);
  const [sessions, setSessions] = useState<ChatSession[]>(() => readStore("thesauce_chat_sessions"));
  const [activeId, setActiveId] = useState<string | null>(() => readStore("thesauce_active_chat_id"));
  const [pickerOpen, setPickerOpen] = useState(false);
  // TODO(api): mock skeleton hold — when wiring real API, only show <CoachSkeleton /> if the request hasn't resolved within ~200ms (otherwise it flickers on fast responses).
  const [pageLoading, setPageLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 380);
    return () => clearTimeout(t);
  }, []);
  const [legacyHistory, setLegacyHistory] = useState<ChatMessage[]>(() => {
    const old = readStore("thesauce_chat_history");
    return old.some((m) => m.role === "user") ? old : [];
  });
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const activeSession = useMemo(() => sessions.find((s) => s.id === activeId) || null, [sessions, activeId]);
  const orderedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [sessions],
  );

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeSession?.messages.length, activeId]);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    function onDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [pickerOpen]);

  function persistSessions(next: ChatSession[]) {
    updateStore("thesauce_chat_sessions", next);
    setSessions(next);
  }

  function persistActive(id: string | null) {
    updateStore("thesauce_active_chat_id", id);
    setActiveId(id);
  }

  function createSession(seedMessages: ChatMessage[] = [], title?: string): ChatSession {
    const now = new Date().toISOString();
    const firstUser = seedMessages.find((m) => m.role === "user");
    const session: ChatSession = {
      id: newSessionId(),
      title: title || (firstUser ? titleFromMessage(firstUser.content) : "New chat"),
      messages: seedMessages,
      created_at: now,
      updated_at: now,
    };
    persistSessions([session, ...sessions]);
    persistActive(session.id);
    setPickerOpen(false);
    return session;
  }

  function switchSession(id: string) {
    persistActive(id);
    setPickerOpen(false);
  }

  function deleteSession(id: string) {
    const next = sessions.filter((s) => s.id !== id);
    persistSessions(next);
    if (activeId === id) persistActive(next[0]?.id || null);
  }

  function send(messageText: string) {
    const content = messageText.trim();
    if (!content) return;
    const now = new Date().toISOString();
    const userMsg: ChatMessage = { role: "user", content, timestamp: now };

    let session = activeSession;
    if (!session) session = createSession();

    const priorMessages = session.messages;
    const coachResponse = generateCoachResponse(content, priorMessages, state.user).response;
    const coachMsg: ChatMessage = { role: "coach", content: coachResponse, timestamp: new Date().toISOString() };

    const updated: ChatSession = {
      ...session,
      messages: [...priorMessages, userMsg, coachMsg],
      updated_at: new Date().toISOString(),
      title: session.title === "New chat" ? titleFromMessage(content) : session.title,
    };
    const sessionId = session.id;
    persistSessions(sessions.some((s) => s.id === sessionId) ? sessions.map((s) => (s.id === sessionId ? updated : s)) : [updated, ...sessions]);
  }

  function importLegacy() {
    if (legacyHistory.length === 0) return;
    const firstUser = legacyHistory.find((m) => m.role === "user");
    const session: ChatSession = {
      id: newSessionId(),
      title: firstUser ? titleFromMessage(firstUser.content) : "Previous conversation",
      messages: legacyHistory,
      created_at: legacyHistory[0]?.timestamp || new Date().toISOString(),
      updated_at: legacyHistory.at(-1)?.timestamp || new Date().toISOString(),
    };
    persistSessions([session, ...sessions]);
    persistActive(session.id);
    updateStore("thesauce_chat_history", []);
    setLegacyHistory([]);
  }

  function discardLegacy() {
    updateStore("thesauce_chat_history", []);
    setLegacyHistory([]);
  }

  const folio = ["DIALOGUE", activeSession ? `${activeSession.messages.length} TURNS` : `${sessions.length} CHATS`, "OFF-RECORD"];

  if (pageLoading) {
    return (
      <Shell folio={folio} fullscreen>
        <CoachSkeleton />
      </Shell>
    );
  }

  return (
    <Shell folio={folio} fullscreen>
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Header: chat picker + new */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-sauce-hairlineStrong pb-3">
          <div className="relative flex min-w-0 items-center gap-2" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
              className="group flex min-w-0 items-center gap-2 rounded-sm px-2 py-1.5 text-left transition hover:bg-sauce-surface/60"
            >
              <span className="truncate font-display text-2xl font-medium tracking-editorial text-sauce-cream">
                {activeSession ? activeSession.title : "No chat yet"}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={1.8}
                className={`shrink-0 text-sauce-creamMuted transition-transform duration-[240ms] group-hover:text-sauce-gold ${pickerOpen ? "rotate-180" : ""}`}
              />
            </button>
            {activeSession && (
              <span className="hidden mono-folio text-sauce-muted md:inline">
                · {activeSession.messages.length} TURNS · {formatRelative(activeSession.updated_at)}
              </span>
            )}

            <AnimatePresence>
              {pickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
                  className="absolute left-0 top-[calc(100%+8px)] z-30 w-[320px] max-w-[80vw] overflow-hidden rounded-md border border-sauce-hairlineStrong bg-sauce-ink shadow-[0_18px_48px_rgba(0,0,0,0.55)]"
                  role="listbox"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-sauce-hairline px-3 py-2">
                    <span className="mono-folio text-sauce-creamMuted">
                      Chats · <span className="text-sauce-cream tabular">{pad(orderedSessions.length)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => createSession()}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-sauce-gold/60 bg-sauce-gold/15 px-2 py-1.5 mono-folio text-sauce-cream transition hover:border-sauce-gold hover:bg-sauce-gold/25 hover:text-sauce-goldBright"
                    >
                      <MessageSquarePlus size={11} strokeWidth={1.8} />
                      New
                    </button>
                  </div>

                  {legacyHistory.length > 0 && (
                    <div className="border-b border-sauce-hairline p-3">
                      <LegacyBanner
                        count={legacyHistory.filter((m) => m.role === "user").length}
                        onImport={importLegacy}
                        onDiscard={discardLegacy}
                      />
                    </div>
                  )}

                  <div className="no-scrollbar max-h-[360px] overflow-y-auto p-2">
                    {orderedSessions.length === 0 ? (
                      <p className="px-2 py-3 font-body text-[13px] italic leading-[1.55] text-sauce-muted">
                        No chats yet. Hit "New" to start one.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {orderedSessions.map((s) => {
                          const isActive = s.id === activeId;
                          return (
                            <li key={s.id} className="group relative">
                              <button
                                type="button"
                                onClick={() => switchSession(s.id)}
                                className={`flex w-full flex-col items-start gap-1 rounded-sm border px-3 py-2.5 text-left transition ${
                                  isActive
                                    ? "border-sauce-gold/60 bg-sauce-gold/15"
                                    : "border-transparent bg-sauce-surface/40 hover:border-sauce-borderStrong hover:bg-sauce-surface/70"
                                }`}
                              >
                                <span className={`line-clamp-2 font-body text-[14px] leading-[1.35] ${isActive ? "text-sauce-cream" : "text-sauce-cream/85"}`}>
                                  {s.title}
                                </span>
                                <span className="mono-folio flex items-center gap-2 text-sauce-muted">
                                  {isActive && <Check size={10} className="text-sauce-gold" strokeWidth={2} />}
                                  {s.messages.length} turns · {formatRelative(s.updated_at)}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                                aria-label="Delete chat"
                                className="absolute right-1 top-1 hidden rounded-sm p-1 text-sauce-muted transition hover:text-sauce-gold group-hover:block"
                              >
                                <Trash2 size={11} strokeWidth={1.8} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => createSession()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-sauce-gold/60 bg-sauce-gold/15 px-2.5 py-1.5 mono-folio text-sauce-cream transition hover:border-sauce-gold hover:bg-sauce-gold/25 hover:text-sauce-goldBright"
          >
            <MessageSquarePlus size={12} strokeWidth={1.8} />
            New chat
          </button>
        </header>

        {/* Chat body */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 pt-4">
          {activeSession ? (
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
              <ChatTranscript messages={activeSession.messages} endRef={transcriptEndRef} />
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 text-center">
              <span className="mono-folio text-sauce-gold">Off-record dialogue</span>
              <h2 className="font-display text-[clamp(28px,4vw,44px)] font-medium leading-[1.05] tracking-tightest text-sauce-cream">
                Start a chat with the coach.
              </h2>
              <p className="max-w-[44ch] font-body text-body text-sauce-creamMuted">
                Past chats stack up in the picker above. Each one is its own thread — no mixing today's outreach with last week's pricing crisis.
              </p>
              <button type="button" onClick={() => createSession()} className="btn-gold">
                <MessageSquarePlus size={14} strokeWidth={1.8} />
                Start a new chat
              </button>
            </div>
          )}

          <div className="shrink-0 pt-3">
            <ChatComposer
              onSend={send}
              placeholder={activeSession ? "Tell the coach what's in the way." : "Type to start a new chat."}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ───────────────── Pieces ───────────────── */

function LegacyBanner({ count, onImport, onDiscard }: { count: number; onImport: () => void; onDiscard: () => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-sauce-gold/40 bg-sauce-gold/10 p-3">
      <div className="flex items-center gap-1.5 mono-folio text-sauce-gold">
        <ListPlus size={11} strokeWidth={1.8} />
        {count} prior message{count === 1 ? "" : "s"} found
      </div>
      <p className="font-body text-[12px] leading-[1.45] text-sauce-creamMuted">
        Resume it as a chat or drop it.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onImport}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm bg-sauce-gold px-2 py-1.5 mono-folio text-sauce-black transition hover:bg-sauce-goldBright"
        >
          Resume
          <ArrowRight size={10} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="inline-flex items-center gap-1 rounded-sm border border-sauce-borderStrong px-2 py-1.5 mono-folio text-sauce-muted transition hover:border-sauce-gold hover:text-sauce-gold"
          aria-label="Discard old conversation"
        >
          <Trash2 size={10} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

function ChatTranscript({ messages, endRef }: { messages: ChatMessage[]; endRef: React.RefObject<HTMLDivElement> }) {
  if (messages.length === 0) {
    return (
      <p className="py-8 text-center font-body text-[14px] italic text-sauce-muted">
        Empty chat. Send the first message.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-5">
      {messages.map((m, i) => (
        <li key={i} className="grid grid-cols-[80px_1fr] gap-4 md:grid-cols-[96px_1fr]">
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
      <div ref={endRef} aria-hidden />
    </ol>
  );
}
