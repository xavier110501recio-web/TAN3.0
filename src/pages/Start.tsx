import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { freshUserStores, updateStore } from "../utils/storage";
import { inferNiche } from "../utils/format";
import { Folio, Wordmark } from "../components/Shell";

type StartForm = { name: string; email: string; city: string };

export function Start() {
  const navigate = useNavigate();
  const locationState = (window.history.state?.usr ?? {}) as { rawDump?: string };
  const [raw, setRaw] = useState(locationState.rawDump || "");
  const [form, setForm] = useState<StartForm>({ name: "", email: "", city: "" });
  const startReady = raw.trim().length >= 3 && form.name.trim() && form.email.trim() && form.city.trim();

  function submit() {
    if (!startReady) return;
    const now = new Date().toISOString();
    freshUserStores();
    updateStore("thesauce_user", {
      ...form, raw_dump: raw, goal: raw.slice(0, 160), idea_type: "service", niche: inferNiche(raw),
      blockers: ["I don't know where to start"], daily_time: "30 minutes", budget: "$0",
      ninety_day_target: "Make my first dollar outside my job", current_situation: "Building on the side",
      existing_skills: "None stated", current_day: 1, current_zone: 1, is_pro: false,
      execution_score: 0, onboarding_complete: true, plan_summary_seen: false,
      community_anonymous: false, joined_at: now,
      attachments: [], connections: [],
    });
    navigate("/generating");
  }

  const fields: { key: keyof StartForm; placeholder: string }[] = [
    { key: "name", placeholder: "Name" },
    { key: "email", placeholder: "Email" },
    { key: "city", placeholder: "City" },
  ];

  return (
    <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen w-full max-w-[820px] flex-col px-gutter">
        <header className="flex items-center justify-between border-b border-sauce-hairlineStrong py-5">
          <Wordmark size="sm" />
          <Folio items={["INTAKE", "STEP 01 / 01"]} />
        </header>

        <section className="grid grid-cols-1 gap-10 pt-section pb-section animate-screen-enter">
          <div>
            <p className="mono-folio mb-4 text-sauce-gold">90-second dump</p>
            <h1 className="font-display text-[clamp(44px,7vw,72px)] font-semibold leading-[0.92] tracking-tightest">
              Tell the truth<br /><span className="italic">about the idea.</span>
            </h1>
            <p className="mt-5 max-w-[48ch] text-caption text-sauce-creamMuted">
              The more honest, the better your roadmap. We'll work with whatever shape it's in.
            </p>
          </div>

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="What are you trying to build? Who is it for? What keeps stopping you?"
            rows={7}
            className="textarea-bare no-scrollbar"
          />

          <div className="grid gap-6 sm:grid-cols-3">
            {fields.map(({ key, placeholder }) => (
              <label key={key} className="flex flex-col gap-2">
                <span className="mono-folio text-sauce-muted">{placeholder}</span>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="input"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-sauce-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="mono-folio max-w-[40ch] text-sauce-muted">
              Stored on this device. No payment, no public posting, no external services.
            </p>
            <button disabled={!startReady} onClick={submit} className="btn-gold">
              Build my roadmap
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
