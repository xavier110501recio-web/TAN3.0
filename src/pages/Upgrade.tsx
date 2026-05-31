import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { readStore, updateStore } from "../utils/storage";
import { Folio, Wordmark } from "../components/Shell";

export function Upgrade() {
  const navigate = useNavigate();
  const user = readStore("thesauce_user");

  function unlock() {
    if (!user) return;
    updateStore("thesauce_user", { ...user, is_pro: true });
    navigate("/dashboard");
  }

  return (
    <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col px-gutter">
        <header className="flex items-center justify-between border-b border-sauce-hairlineStrong py-5">
          <Wordmark size="sm" />
          <Folio items={["UPGRADE", "ZONE II", "PRO"]} />
        </header>

        <section className="grid grid-cols-1 gap-12 pt-section pb-section animate-screen-enter md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="mono-folio mb-4 text-sauce-gold">Foundation cleared</p>
            <h1 className="font-display text-[clamp(48px,7vw,80px)] font-semibold leading-[0.92] tracking-tightest">
              Zone II is ready.<br /><span className="italic">Are you?</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-lede text-sauce-creamMuted">
              The free sprint got you through the first ten missions. The next twenty are where most people would have stopped already. Keep going.
            </p>
          </div>

          <aside className="md:col-span-5 md:border-l md:border-sauce-hairlineStrong md:pl-10">
            <div className="flex flex-col gap-5 border-y border-sauce-hairlineStrong py-8">
              <Folio items={["Pro membership"]} />
              <p className="font-display text-[clamp(36px,5vw,52px)] font-semibold leading-[1] tracking-tightest text-sauce-gold">
                Pro
              </p>
              <ul className="flex flex-col">
                {[
                  "Zones II and III unlocked",
                  "Coach memory across sessions",
                  "Post to the crew",
                  "Full mission map",
                ].map((item) => (
                  <li key={item} className="grid grid-cols-[18px_1fr] gap-3 border-t border-sauce-hairline py-3 last:border-b">
                    <Check size={14} className="mt-1 text-sauce-gold" />
                    <span className="font-body text-caption text-sauce-cream">{item}</span>
                  </li>
                ))}
              </ul>
              <button onClick={unlock} className="btn-gold w-full">
                Unlock Zone II
                <ArrowRight size={14} strokeWidth={2} />
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
