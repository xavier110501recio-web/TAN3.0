import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsUpDown, RotateCcw, Shield, Sparkles } from "lucide-react";
import { readStore, resetDemo } from "../utils/storage";

export function SidebarProfile() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const user = readStore("thesauce_user");

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function escHandler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, [open]);

  if (!user) return null;

  const displayName = user.name?.trim() || "Builder";
  const secondary = user.email?.trim() || `${user.niche || "Service Business"} · Day ${user.current_day}`;
  const initial = displayName[0]?.toUpperCase() || "B";

  function go(path: string) {
    setOpen(false);
    navigate(path);
  }

  function reset() {
    setOpen(false);
    resetDemo();
    window.location.reload();
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Popover — opens ABOVE the trigger */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute bottom-full left-0 right-0 mb-2 z-50 rounded-lg border border-sauce-gold/40 bg-sauce-ink shadow-[0_-18px_42px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-sauce-hairlineStrong px-3 py-3">
              <Avatar initial={initial} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-medium leading-tight tracking-tightest text-sauce-cream truncate">{displayName}</p>
                <p className="mono-folio truncate text-sauce-creamMuted">{secondary}</p>
              </div>
            </div>

            {/* Upgrade (only if not pro) */}
            {!user.is_pro && (
              <MenuItem icon={<Sparkles size={13} strokeWidth={1.8} />} label="Upgrade to Pro" onClick={() => go("/upgrade")} accent />
            )}

            {/* Static items */}
            <div className="border-t border-sauce-hairlineStrong">
              <MenuItem icon={<Shield size={13} strokeWidth={1.8} />} label="Privacy policy" onClick={() => go("/privacy")} />
            </div>

            {/* Destructive */}
            <div className="border-t border-sauce-hairlineStrong">
              <MenuItem icon={<RotateCcw size={13} strokeWidth={1.8} />} label="Reset demo" onClick={reset} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`group flex w-full items-center gap-3 rounded-lg border ${open ? "border-sauce-gold/50 bg-sauce-surface" : "border-sauce-borderStrong bg-sauce-surface/60"} px-2.5 py-2.5 text-left transition hover:border-sauce-gold/50 hover:bg-sauce-surface`}
      >
        <Avatar initial={initial} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-medium leading-tight tracking-tightest text-sauce-cream truncate">{displayName}</p>
          <p className="mono-folio truncate text-sauce-creamMuted">{secondary}</p>
        </div>
        <ChevronsUpDown size={13} strokeWidth={1.8} className={`shrink-0 transition ${open ? "text-sauce-gold" : "text-sauce-muted group-hover:text-sauce-gold"}`} />
      </button>
    </div>
  );
}

function Avatar({ initial, size }: { initial: string; size: "sm" | "md" }) {
  const dim = size === "md" ? "h-9 w-9 text-sm" : "h-8 w-8 text-[12px]";
  return (
    <span aria-hidden className={`${dim} grid shrink-0 place-items-center rounded-md border border-sauce-gold/40 bg-sauce-gold/15 font-display font-semibold tracking-tightest text-sauce-gold`}>
      {initial}
    </span>
  );
}

function MenuItem({ icon, label, onClick, accent = false }: { icon: React.ReactNode; label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition mono-folio ${accent ? "text-sauce-gold hover:bg-sauce-gold/10" : "text-sauce-cream hover:bg-sauce-surface hover:text-sauce-gold"}`}
    >
      <span aria-hidden className={`${accent ? "text-sauce-gold" : "text-sauce-creamMuted"}`}>{icon}</span>
      {label}
    </button>
  );
}
