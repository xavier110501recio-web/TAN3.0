import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mic, Square } from "lucide-react";

/* ─── Web Speech API typing (minimal, browser-prefixed) ─── */

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

/* ─── Component ─── */

export interface ComposerPrefill {
  value: string;
  nonce: number;
}

interface ChatComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  variant?: "default" | "starter";
  prefill?: ComposerPrefill | null;
}

export function ChatComposer({ onSend, placeholder = "Ask about this mission.", autoFocus = false, variant = "default", prefill = null }: ChatComposerProps) {
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);
  const baselineRef = useRef<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const appliedNonceRef = useRef<number | null>(null);
  const supported = useMemo(() => getSpeechRecognitionCtor() !== null, []);

  useEffect(() => () => stopRecording(), []); // cleanup

  useEffect(() => {
    if (!prefill) return;
    if (appliedNonceRef.current === prefill.nonce) return;
    appliedNonceRef.current = prefill.nonce;
    setText(prefill.value);
    baselineRef.current = prefill.value;
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus({ preventScroll: false });
      const end = prefill.value.length;
      try { el.setSelectionRange(end, end); } catch { /* noop */ }
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [prefill]);

  function startRecording() {
    setInterim("");
    baselineRef.current = text;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
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
        baselineRef.current = `${baselineRef.current}${baselineRef.current && !baselineRef.current.endsWith(" ") ? " " : ""}${finalChunk.trim()}`;
        setText(baselineRef.current);
        setInterim("");
      } else {
        setInterim(interimChunk);
      }
    };
    rec.onerror = () => stopRecording();
    rec.onend = () => {
      if (recording) stopRecording();
    };
    try {
      rec.start();
      recognitionRef.current = rec;
      setRecording(true);
    } catch {
      stopRecording();
    }
  }

  function stopRecording() {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* noop */ }
      recognitionRef.current = null;
    }
    setRecording(false);
    setInterim("");
  }

  function send() {
    const v = text.trim();
    if (!v) return;
    if (recording) stopRecording();
    onSend(v);
    setText("");
    baselineRef.current = "";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const isStarter = variant === "starter";

  return (
    <div className={`rounded-lg border ${isStarter ? "border-sauce-gold/40" : "border-sauce-hairlineStrong"} bg-sauce-ink/60`}>
      {recording && (
        <div className="flex items-center justify-between border-b border-sauce-hairline px-3 py-2 mono-folio">
          <span className="flex items-center gap-2 text-sauce-gold">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sauce-gold animate-folio-blink" />
            Recording
          </span>
          <span className="text-sauce-muted">Web Speech API · live transcript</span>
        </div>
      )}
      <div className={`flex gap-2 px-3 py-2 md:px-4 md:py-3 ${isStarter ? "items-end" : "items-center"}`}>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={text + (interim ? ` ${interim}` : "")}
            onChange={(e) => { if (!recording) setText(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={isStarter ? 3 : 1}
            autoFocus={autoFocus}
            readOnly={recording && interim.length > 0}
            className={`no-scrollbar w-full resize-none bg-transparent font-body text-body leading-[1.5] text-sauce-cream outline-none placeholder:text-sauce-muted ${isStarter ? "min-h-[72px]" : "min-h-[36px] max-h-32 py-[6px]"}`}
            style={{ overflowY: "auto" }}
          />
        </div>
        <div className={`flex items-center ${isStarter ? "pb-1" : ""}`}>
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={!supported}
            aria-label={!supported ? "Voice unsupported in this browser" : recording ? "Stop recording" : "Start voice input"}
            title={!supported ? "Voice unsupported in this browser" : recording ? "Stop recording" : "Start voice input"}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border transition ${
              recording
                ? "border-sauce-gold bg-sauce-gold/10 text-sauce-gold"
                : supported
                  ? "border-sauce-borderStrong text-sauce-cream hover:border-sauce-gold hover:text-sauce-gold"
                  : "border-sauce-borderStrong text-sauce-muted hover:border-sauce-borderStrong cursor-not-allowed"
            }`}
          >
            {recording ? <Square size={11} strokeWidth={2} fill="currentColor" /> : <Mic size={13} strokeWidth={1.8} />}
          </button>
          <AnimatePresence initial={false}>
            {text.trim().length > 0 && (
              <motion.button
                key="send"
                type="button"
                onClick={send}
                aria-label="Send"
                initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                animate={{ width: 36, opacity: 1, marginLeft: 4 }}
                exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                transition={{ duration: 0.26, ease: [0.2, 0.7, 0.2, 1] }}
                className="grid h-9 shrink-0 place-items-center overflow-hidden rounded-md bg-sauce-gold text-sauce-black transition-colors hover:bg-sauce-goldBright"
              >
                <ArrowRight size={14} strokeWidth={2} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      {isStarter && (
        <div className="flex items-center justify-between border-t border-sauce-hairline px-4 py-2 mono-folio text-sauce-muted">
          <span>Press <span className="text-sauce-creamMuted">Enter</span> to send · Shift+Enter for new line</span>
          {supported ? <span>Voice ready</span> : <span>Voice unsupported in this browser</span>}
        </div>
      )}
    </div>
  );
}
