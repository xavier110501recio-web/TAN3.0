import type { User } from "../types";

export function Celebration({ user }: { user: User }) {
  return (
    <div className="mb-12 border-y border-sauce-gold/50 py-8">
      <p className="mono-folio mb-3 text-sauce-gold">Breaking · first dollar</p>
      <h2 className="font-display text-[clamp(32px,5vw,48px)] font-semibold leading-[0.95] tracking-tightest text-sauce-cream">
        First<br /><span className="italic">dollar.</span>
      </h2>
      <p className="mt-4 max-w-[48ch] font-body text-caption text-sauce-creamMuted">
        {user.current_day - 1} days of showing up. That's not luck. Zone IV is waiting when this sprint is done.
      </p>
    </div>
  );
}
