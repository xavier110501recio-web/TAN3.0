import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { api, ApiError } from "../lib/api";
import type { MeSnapshot } from "../api/types";

interface Props {
  defaultName?: string;
  defaultCity?: string;
  defaultDump?: string;
  onComplete: (snap: MeSnapshot) => void;
}

export function OnboardingCard({ defaultName = "", defaultCity = "", defaultDump = "", onComplete }: Props) {
  const [name, setName] = useState(defaultName);
  const [city, setCity] = useState(defaultCity);
  const [raw, setRaw] = useState(defaultDump);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = name.trim().length > 0 && city.trim().length > 0 && raw.trim().length >= 3;

  async function submit() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const snap = await api.onboarding.submit({
        name: name.trim(),
        city: city.trim(),
        raw_dump: raw.trim(),
      });
      onComplete(snap);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[720px] animate-screen-enter">
      <p className="mono-folio mb-4 text-sauce-gold">Step 01 — Open with the truth</p>
      <h1 className="font-display text-[clamp(40px,6vw,64px)] font-semibold leading-[0.92] tracking-tightest">
        Dump the<br /><span className="italic">idea.</span>
      </h1>
      <p className="mt-5 max-w-[48ch] text-caption text-sauce-creamMuted">
        The more honest, the better the roadmap. There's no public posting and no signup theatre after this. Less than 90 seconds.
      </p>

      <div className="mt-section flex flex-col gap-8">
        <label className="flex flex-col gap-2">
          <span className="mono-folio text-sauce-muted">What are you building? Who is it for? What keeps stopping you?</span>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Type honestly. Sketches and half-thoughts are fine."
            rows={7}
            className="textarea-bare no-scrollbar"
          />
        </label>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="mono-folio text-sauce-muted">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              className="input"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="mono-folio text-sauce-muted">City</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Where are you based?"
              className="input"
            />
          </label>
        </div>

        {error && <p className="mono-folio text-sauce-gold" role="alert">{error}</p>}

        <div className="flex flex-col gap-4 border-t border-sauce-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono-folio max-w-[40ch] text-sauce-muted">
            Stored on your account. No payment, no public posting.
          </p>
          <button disabled={!ready || busy} onClick={submit} className="btn-gold !rounded-xl">
            {busy ? "Building..." : "Build my roadmap"}
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
