import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import type { MapAnnotation } from "../types";

interface AnnotationDockProps {
  annotations: MapAnnotation[];
  onRemove: (id: string) => void;
  onSend: () => void;
  onClear: () => void;
  sendLabel?: string;
}

export function AnnotationDock({ annotations, onRemove, onSend, onClear, sendLabel = "Send to coach" }: AnnotationDockProps) {
  return (
    <AnimatePresence>
      {annotations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          className="border-t border-sauce-gold/40 bg-sauce-ink/95 px-4 py-3 backdrop-blur md:px-5"
        >
          <div className="flex items-center justify-between mono-folio">
            <span className="text-sauce-gold">
              {annotations.length} comment{annotations.length === 1 ? "" : "s"} queued
            </span>
            <button type="button" onClick={onClear} className="text-sauce-muted transition hover:text-sauce-cream">
              Clear all
            </button>
          </div>
          <ul className="mt-2 flex max-h-32 flex-col gap-1.5 overflow-y-auto no-scrollbar">
            {annotations.map((a) => (
              <li key={a.id} className="grid grid-cols-[1fr_18px] items-start gap-3 border-t border-sauce-hairline pt-1.5">
                <div>
                  <p className="mono-folio text-sauce-creamMuted line-clamp-1 italic">"{a.selectedText}"</p>
                  <p className="mt-0.5 font-body text-caption text-sauce-cream line-clamp-2">{a.comment}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(a.id)}
                  className="mt-1 text-sauce-muted transition hover:text-sauce-gold"
                  aria-label="Remove annotation"
                >
                  <X size={12} strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={onSend} className="btn-gold mt-3 w-full !justify-between !py-3">
            <span>{sendLabel}</span>
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
