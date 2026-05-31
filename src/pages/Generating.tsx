import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Folio } from "../components/Shell";
import { Typing } from "../components/Typing";

export function Generating() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const lines = ["Reading your constraints", "Mapping first market contact", "Cutting the unnecessary", "Building Mission 01"];

  useEffect(() => {
    const t = setInterval(() => setStep((s) => s + 1), 900);
    const n = setTimeout(() => navigate("/dashboard"), 3900);
    return () => { clearInterval(t); clearTimeout(n); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-sauce-black text-sauce-cream noise px-gutter">
      <div className="flex w-full max-w-[560px] flex-col items-start gap-10 animate-screen-enter">
        <Folio items={["TYPESETTING", `STEP 0${(step % lines.length) + 1} / 04`]} />
        <h1 className="font-display text-[clamp(40px,6vw,64px)] font-semibold leading-[0.95] tracking-tightest">
          Building<br /><span className="italic text-sauce-gold">the map.</span>
        </h1>
        <ul className="w-full">
          {lines.map((line, i) => {
            const active = i === step % lines.length;
            const done = i < step % lines.length;
            return (
              <li key={line} className="grid grid-cols-[28px_1fr_20px] items-center gap-4 border-t border-sauce-hairline py-4 last:border-b">
                <span className={`mono-folio ${active || done ? "text-sauce-gold" : "text-sauce-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className={`font-body text-body ${active ? "text-sauce-cream" : done ? "text-sauce-creamMuted line-through decoration-sauce-gold/40" : "text-sauce-muted"}`}>
                  {line}
                </span>
                {done ? <Check size={14} className="text-sauce-gold" /> : active ? <span className="h-1.5 w-1.5 rounded-full bg-sauce-gold animate-folio-blink" /> : <span />}
              </li>
            );
          })}
        </ul>
        <Typing />
      </div>
    </main>
  );
}
