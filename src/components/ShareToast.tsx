import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Megaphone, X } from "lucide-react";
import type { CommunityPost } from "../types";
import { onShareToast, type ShareToastPayload } from "../utils/toastBus";
import { readStore, updateStore } from "../utils/storage";
import { looksLikeRevenue, pad } from "../utils/format";

type View = "prompt" | "compose" | "posted";

export function ShareToast() {
  const [payload, setPayload] = useState<ShareToastPayload | null>(null);
  const [view, setView] = useState<View>("prompt");
  const [text, setText] = useState("");
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return onShareToast((p) => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      setPayload(p);
      setView("prompt");
      setText(p.defaultText || "");
      dismissTimer.current = setTimeout(() => setPayload(null), 12000);
    });
  }, []);

  useEffect(() => () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
  }, []);

  function close() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setPayload(null);
  }

  function openCompose() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setView("compose");
    if (!text) {
      setText(`${payload?.mission.title} — done.`);
    }
  }

  function postWin() {
    if (!payload) return;
    const user = readStore("thesauce_user");
    if (!user) return;
    const community = readStore("thesauce_community");
    const content = text.trim() || `Cleared Mission ${pad(payload.mission.mission_number)} — ${payload.mission.title}.`;
    const newPost: CommunityPost = {
      id: Date.now(),
      name: user.community_anonymous ? "Anonymous" : user.name,
      city: user.city || "Building",
      type: "win",
      content,
      niche: user.niche,
      timestamp: "just now",
      reactions: { fire: 0, flex: 0, bolt: 0 },
    };
    updateStore("thesauce_community", [newPost, ...community]);
    if (!user.first_dollar_badge && looksLikeRevenue(content)) {
      updateStore("thesauce_user", { ...user, first_dollar_badge: true });
    }
    setView("posted");
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => setPayload(null), 2200);
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center px-4 pb-4 md:items-end md:px-6 md:pb-6">
      <AnimatePresence>
        {payload && (
          <motion.div
            key={payload.mission.mission_number}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
            className="pointer-events-auto w-full max-w-[420px] overflow-hidden border border-sauce-gold/45 bg-sauce-ink shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          >
            {/* Folio strip */}
            <div className="flex items-center justify-between border-b border-sauce-hairlineStrong bg-sauce-surface/60 px-4 py-2">
              <span className="mono-folio flex items-center gap-2 text-sauce-gold">
                <Megaphone size={11} strokeWidth={1.8} />
                Share win · M{pad(payload.mission.mission_number)}
              </span>
              <button onClick={close} aria-label="Dismiss" className="text-sauce-muted transition hover:text-sauce-cream">
                <X size={14} strokeWidth={1.6} />
              </button>
            </div>

            {view === "prompt" && (
              <div className="px-4 py-4">
                <p className="font-display text-[20px] leading-[1.2] tracking-editorial text-sauce-cream">
                  {payload.mission.share_prompt || "Mission cleared. Tell the crew?"}
                </p>
                <p className="mt-1 mono-folio text-sauce-creamMuted">
                  {payload.mission.title}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={openCompose} className="btn-gold !px-4 !py-2.5 !text-[11px]">
                    Share it
                    <ArrowRight size={12} strokeWidth={2} />
                  </button>
                  <button onClick={close} className="mono-folio px-2 py-2 text-sauce-creamMuted transition hover:text-sauce-cream">
                    Not now
                  </button>
                </div>
              </div>
            )}

            {view === "compose" && (
              <div className="flex flex-col gap-3 px-4 py-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  autoFocus
                  placeholder="What happened?"
                  className="no-scrollbar resize-none border-0 border-b border-sauce-hairlineStrong bg-transparent pb-2 font-body text-[15px] leading-[1.5] text-sauce-cream outline-none placeholder:text-sauce-muted focus:border-sauce-gold"
                />
                <div className="flex items-center justify-between">
                  <button onClick={close} className="mono-folio text-sauce-creamMuted transition hover:text-sauce-cream">
                    Skip
                  </button>
                  <button onClick={postWin} disabled={!text.trim()} className="btn-gold !px-4 !py-2.5 !text-[11px] disabled:opacity-50">
                    Post to crew
                    <ArrowRight size={12} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}

            {view === "posted" && (
              <div className="flex items-center gap-2 px-4 py-4">
                <span className="mono-folio text-sauce-gold">Filed</span>
                <span className="font-body text-[14px] text-sauce-cream">Your win is on the dispatch board.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
