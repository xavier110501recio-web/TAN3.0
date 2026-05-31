import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mic, Paperclip, Square, X } from "lucide-react";
import type { ComposerAttachment, ComposerConnection } from "../types";

export type { ComposerAttachment, ComposerConnection };

interface IdeaComposerProps {
  value: string;
  onChange: (value: string) => void;
  attachments: ComposerAttachment[];
  onAttachmentsChange: (next: ComposerAttachment[]) => void;
  connections: ComposerConnection[];
  onConnectionsChange: (next: ComposerConnection[]) => void;
  onSubmit: () => void;
  placeholder?: string;
}

/* ─────────────────────────────────────────────────────────── */
/*  Web Speech API typing (minimal, browser-prefixed)         */
/* ─────────────────────────────────────────────────────────── */

interface SpeechRecognitionAlt {
  transcript: string;
}
interface SpeechRecognitionResultAlt {
  isFinal: boolean;
  0: SpeechRecognitionAlt;
}
interface SpeechRecognitionEventAlt {
  resultIndex: number;
  results: { [index: number]: SpeechRecognitionResultAlt; length: number };
}
interface SpeechRecognitionAPI {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEventAlt) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionAPI;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/* ─────────────────────────────────────────────────────────── */
/*  Component                                                 */
/* ─────────────────────────────────────────────────────────── */

type Mode = "text" | "voice";

export function IdeaComposer({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  connections,
  onConnectionsChange,
  onSubmit,
  placeholder = "Describe your idea, your day-to-day, what's been stopping you. Write freely.",
}: IdeaComposerProps) {
  const [mode, setMode] = useState<Mode>("text");
  const [notionOpen, setNotionOpen] = useState(false);
  const [notionConnected, setNotionConnected] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = value.length;
  const hasContent = value.trim().length > 0 || attachments.length > 0 || connections.length > 0;

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const next: ComposerAttachment[] = [];
    for (let i = 0; i < list.length; i++) {
      const f = list.item(i);
      if (!f) continue;
      next.push({ id: `${Date.now()}-${i}-${f.name}`, kind: "file", name: f.name, size: f.size });
    }
    onAttachmentsChange([...attachments, ...next]);
  }

  function removeAttachment(id: string) {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  }

  function removeConnection(id: string) {
    onConnectionsChange(connections.filter((c) => c.id !== id));
  }

  function addNotionPages(pages: { id: string; title: string }[]) {
    const existing = new Set(connections.map((c) => c.pageId));
    const next: ComposerConnection[] = pages
      .filter((p) => !existing.has(p.id))
      .map((p) => ({ id: `notion-${p.id}-${Date.now()}`, kind: "notion", pageId: p.id, title: p.title }));
    onConnectionsChange([...connections, ...next]);
  }

  return (
    <div className="flex flex-col">
      {/* Editorial composer shell — bordered top/bottom only, no rounded corners */}
      <div className="border-y border-sauce-hairlineStrong">
        {/* Mode tabs */}
        <div className="flex items-center justify-between border-b border-sauce-hairline">
          <div role="tablist" aria-label="Input mode" className="flex">
            {(["text", "voice"] as const).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(m)}
                  className={`relative flex items-center gap-2 py-3 pl-0 pr-6 mono-folio transition first:pl-0 sm:pr-8 ${active ? "text-sauce-gold" : "text-sauce-muted hover:text-sauce-cream"}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-sauce-gold" : "border border-sauce-borderStrong"}`} />
                  {m === "text" ? "Text" : "Voice"}
                  {active && <span aria-hidden className="absolute -bottom-px left-0 right-4 h-px bg-sauce-gold sm:right-6" />}
                </button>
              );
            })}
          </div>
          <span className="mono-folio tabular text-sauce-muted">
            {mode === "text" ? `${charCount} chars` : "live transcript"}
          </span>
        </div>

        {/* Body */}
        <div className="relative py-2">
          {mode === "text" ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={6}
              className="no-scrollbar w-full resize-none border-0 bg-transparent py-2 font-body text-lede leading-[1.6] text-sauce-cream outline-none placeholder:text-sauce-muted"
            />
          ) : (
            <VoiceComposer value={value} onChange={onChange} />
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-t border-sauce-hairline py-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex items-center gap-2 border border-sauce-borderStrong px-3 py-2 mono-folio text-sauce-cream transition hover:border-sauce-gold hover:text-sauce-gold"
          >
            <Paperclip size={12} strokeWidth={1.8} />
            Attach
          </button>

          <button
            type="button"
            onClick={() => setNotionOpen(true)}
            className="group flex items-center gap-2 border border-sauce-borderStrong px-3 py-2 mono-folio text-sauce-cream transition hover:border-sauce-gold hover:text-sauce-gold"
          >
            <NotionGlyph size={12} />
            Notion
            {notionConnected && <span aria-hidden className="ml-1 h-1.5 w-1.5 rounded-full bg-sauce-gold" />}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <span className="ml-auto" />

          <button
            type="button"
            onClick={onSubmit}
            disabled={!hasContent}
            className="btn-gold"
          >
            Show me what to do
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Attachment strip — editorial chips */}
      <AnimatePresence initial={false}>
        {(attachments.length > 0 || connections.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pt-3">
              {attachments.map((a) => (
                <Chip key={a.id} kind="FILE" label={a.name} sub={formatBytes(a.size)} onRemove={() => removeAttachment(a.id)} />
              ))}
              {connections.map((c) => (
                <Chip key={c.id} kind="NOTION" label={c.title} sub="page" onRemove={() => removeConnection(c.id)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notion modal */}
      <AnimatePresence>
        {notionOpen && (
          <NotionConnectModal
            connected={notionConnected}
            onConnect={() => setNotionConnected(true)}
            onPick={(pages) => {
              addNotionPages(pages);
              setNotionOpen(false);
            }}
            onClose={() => setNotionOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Voice sub-composer                                        */
/* ─────────────────────────────────────────────────────────── */

function VoiceComposer({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);
  const startedAtRef = useRef<number>(0);
  const baselineTextRef = useRef<string>("");
  const intervalRef = useRef<number | null>(null);

  const supported = useMemo(() => getSpeechRecognitionCtor() !== null, []);

  useEffect(() => () => stop(), []); // cleanup on unmount

  function start() {
    setInterim("");
    baselineTextRef.current = value;
    startedAtRef.current = Date.now();
    setElapsed(0);
    intervalRef.current = window.setInterval(() => setElapsed(Date.now() - startedAtRef.current), 250);

    const Ctor = getSpeechRecognitionCtor();
    if (Ctor) {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (e) => {
        let finalChunk = "";
        let interimChunk = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finalChunk += res[0].transcript;
          else interimChunk += res[0].transcript;
        }
        if (finalChunk) {
          baselineTextRef.current = `${baselineTextRef.current}${baselineTextRef.current && !baselineTextRef.current.endsWith(" ") ? " " : ""}${finalChunk.trim()}`;
          onChange(baselineTextRef.current);
          setInterim("");
        } else {
          setInterim(interimChunk);
        }
      };
      rec.onerror = () => stop();
      rec.onend = () => {
        if (recording) stop();
      };
      try {
        rec.start();
        recognitionRef.current = rec;
        setRecording(true);
      } catch {
        // already started or denied — silently stop
        stop();
      }
    } else {
      // Fallback: pure mock — recording state with no actual transcription
      setRecording(true);
    }
  }

  function stop() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* noop */ }
      recognitionRef.current = null;
    }
    setRecording(false);
    setInterim("");
  }

  const seconds = Math.floor(elapsed / 1000);
  const timer = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-5 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {recording ? (
            <button
              type="button"
              onClick={stop}
              className="flex items-center gap-2 border border-sauce-gold px-3 py-2 mono-folio text-sauce-gold transition hover:bg-sauce-gold/10"
            >
              <Square size={11} strokeWidth={2} fill="currentColor" />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              className="flex items-center gap-2 border border-sauce-borderStrong px-3 py-2 mono-folio text-sauce-cream transition hover:border-sauce-gold hover:text-sauce-gold"
            >
              <Mic size={12} strokeWidth={1.8} />
              {value ? "Continue speaking" : "Start speaking"}
            </button>
          )}
          {recording && (
            <span className="flex items-center gap-2 mono-folio text-sauce-gold">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sauce-gold animate-folio-blink" />
              Recording
            </span>
          )}
        </div>
        <span className="font-display text-2xl font-medium tabular text-sauce-cream">{timer}</span>
      </div>

      <Waveform active={recording} />

      {/* Live transcript pane */}
      <div className="min-h-[120px] border-t border-sauce-hairline pt-4">
        {value || interim ? (
          <p className="font-body text-lede leading-[1.55] text-sauce-cream">
            {value}
            {interim && (
              <span className="text-sauce-creamMuted"> {interim}</span>
            )}
          </p>
        ) : (
          <p className="font-body text-lede leading-[1.55] text-sauce-muted italic">
            {recording ? "Listening…" : supported ? "Tap start — speak freely. We transcribe in your browser." : "Voice transcription isn't supported in this browser. Try Chrome or Edge, or switch back to text."}
          </p>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => { onChange(""); baselineTextRef.current = ""; }}
          className="self-start mono-folio text-sauce-muted underline-offset-4 hover:text-sauce-gold hover:underline"
        >
          Clear transcript
        </button>
      )}
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  const bars = useMemo(() => Array.from({ length: 36 }, (_, i) => i), []);
  return (
    <div aria-hidden className="flex h-12 items-end gap-[3px]">
      {bars.map((i) => {
        const baseHeight = 14 + ((i * 37) % 28);
        return (
          <span
            key={i}
            className={active ? "bg-sauce-gold" : "bg-sauce-borderStrong"}
            style={{
              width: 3,
              height: `${baseHeight}%`,
              animation: active ? `composer-wave 900ms ease-in-out ${i * 28}ms infinite alternate` : undefined,
              transformOrigin: "bottom",
            }}
          />
        );
      })}
      <style>{`
        @keyframes composer-wave {
          0%   { transform: scaleY(0.35); opacity: .55; }
          100% { transform: scaleY(1.4);  opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Notion connect modal + page picker                        */
/* ─────────────────────────────────────────────────────────── */

const MOCK_NOTION_PAGES: { id: string; title: string; meta: string }[] = [
  { id: "p1", title: "Business idea — draft", meta: "Edited 2 hours ago · Workspace" },
  { id: "p2", title: "Customer interview notes", meta: "Edited yesterday · Research" },
  { id: "p3", title: "2025 goals & targets", meta: "Edited 3 days ago · Personal" },
  { id: "p4", title: "Brand voice playbook", meta: "Edited last week · Marketing" },
  { id: "p5", title: "Pricing exploration", meta: "Edited last month · Strategy" },
];

function NotionConnectModal({
  connected,
  onConnect,
  onPick,
  onClose,
}: {
  connected: boolean;
  onConnect: () => void;
  onPick: (pages: { id: string; title: string }[]) => void;
  onClose: () => void;
}) {
  const [authorizing, setAuthorizing] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  function authorize() {
    setAuthorizing(true);
    setTimeout(() => {
      setAuthorizing(false);
      onConnect();
    }, 900);
  }

  function togglePick(id: string) {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  }

  function attach() {
    const chosen = MOCK_NOTION_PAGES.filter((p) => picked.has(p.id)).map(({ id, title }) => ({ id, title }));
    if (chosen.length === 0) {
      onClose();
      return;
    }
    onPick(chosen);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-sauce-black/85 px-gutter py-8 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] border border-sauce-gold/40 bg-sauce-ink"
      >
        <div className="absolute -top-px left-0 right-0 h-px bg-sauce-gold animate-rule-draw" />

        <header className="flex items-center justify-between border-b border-sauce-hairlineStrong px-6 py-4 mono-folio sm:px-8">
          <div className="flex items-center gap-2 text-sauce-gold">
            <NotionGlyph size={12} />
            Notion · {connected ? "Pick pages" : "Authorize"}
          </div>
          <button type="button" onClick={onClose} className="text-sauce-creamMuted transition hover:text-sauce-cream" aria-label="Close">
            <X size={14} strokeWidth={1.6} />
          </button>
        </header>

        <div className="px-6 py-7 sm:px-8 sm:py-9">
          {!connected ? (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display text-[clamp(28px,3.5vw,38px)] font-semibold leading-[0.98] tracking-tightest text-sauce-cream">
                  Connect your<br /><span className="italic text-sauce-gold">Notion workspace.</span>
                </h3>
                <p className="mt-4 max-w-[42ch] font-body text-caption leading-[1.6] text-sauce-creamMuted">
                  TheSauce will read the pages you select — to ground your roadmap in what's already in your head. Nothing is written back. You can disconnect any time.
                </p>
              </div>

              <ul className="flex flex-col mono-folio text-sauce-creamMuted">
                <li className="grid grid-cols-[14px_1fr] gap-3 border-t border-sauce-hairline py-3">
                  <span className="text-sauce-gold">+</span> Read access to pages you pick
                </li>
                <li className="grid grid-cols-[14px_1fr] gap-3 border-t border-sauce-hairline py-3">
                  <span className="text-sauce-gold">+</span> No write access, no automated edits
                </li>
                <li className="grid grid-cols-[14px_1fr] gap-3 border-t border-sauce-hairline py-3 last:border-b">
                  <span className="text-sauce-gold">+</span> Disconnect from settings in one click
                </li>
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                <button type="button" onClick={authorize} disabled={authorizing} className="btn-gold">
                  {authorizing ? "Authorizing…" : "Authorize Notion"}
                  {!authorizing && <ArrowRight size={14} strokeWidth={2} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-display text-[clamp(26px,3vw,34px)] font-semibold leading-[0.98] tracking-tightest text-sauce-cream">
                  Which pages should<br /><span className="italic">we read?</span>
                </h3>
                <p className="mt-3 font-body text-caption text-sauce-creamMuted">Pick anything that describes the idea, the customer, or what's been blocking you.</p>
              </div>

              <ul className="flex flex-col">
                {MOCK_NOTION_PAGES.map((p) => {
                  const active = picked.has(p.id);
                  return (
                    <li key={p.id} className="border-t border-sauce-hairline last:border-b">
                      <button
                        type="button"
                        onClick={() => togglePick(p.id)}
                        className="group grid w-full grid-cols-[20px_1fr_20px] items-center gap-4 py-3 text-left transition"
                      >
                        <span className={`grid h-4 w-4 place-items-center border ${active ? "border-sauce-gold bg-sauce-gold text-sauce-black" : "border-sauce-borderStrong text-transparent group-hover:border-sauce-gold/60"}`}>
                          <span className="text-[10px] leading-none">✓</span>
                        </span>
                        <span>
                          <span className="block font-display text-lg font-medium tracking-editorial text-sauce-cream">{p.title}</span>
                          <span className="mt-0.5 block mono-folio text-sauce-creamMuted">{p.meta}</span>
                        </span>
                        <span className={`mono-folio ${active ? "text-sauce-gold" : "text-sauce-muted"}`}>{active ? "ON" : "—"}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="mono-folio text-sauce-muted">{picked.size} selected</span>
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                  <button type="button" onClick={attach} className="btn-gold">
                    Attach selected
                    <ArrowRight size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Chips                                                     */
/* ─────────────────────────────────────────────────────────── */

function Chip({ kind, label, sub, onRemove }: { kind: string; label: string; sub: string; onRemove: () => void }) {
  return (
    <span className="group inline-flex items-center gap-2.5 border border-sauce-borderStrong bg-sauce-surface px-2.5 py-1.5 transition hover:border-sauce-gold/60">
      <span className="mono-folio text-sauce-gold">{kind}</span>
      <span aria-hidden className="rule-vertical h-3" />
      <span className="font-body text-caption text-sauce-cream max-w-[200px] truncate">{label}</span>
      <span className="mono-folio text-sauce-muted">{sub}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-sauce-muted transition hover:text-sauce-gold"
        aria-label={`Remove ${label}`}
      >
        <X size={12} strokeWidth={1.8} />
      </button>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Notion mini-glyph (SVG, brand-neutral)                    */
/* ─────────────────────────────────────────────────────────── */

function NotionGlyph({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 17V8l8 9V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Helpers                                                   */
/* ─────────────────────────────────────────────────────────── */

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
