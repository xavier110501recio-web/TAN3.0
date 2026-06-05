import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Folio, Wordmark } from "../components/Shell";

const SECTIONS: { num: string; head: string; body: string[] }[] = [
  {
    num: "I",
    head: "The short version",
    body: [
      "We collect the minimum we need to run TheSauce for you. We don't sell your data. We don't use your work to train models. You can export everything and close your account whenever you want.",
      "The longer version below explains what's collected, why, where it lives, and how to get rid of it.",
    ],
  },
  {
    num: "II",
    head: "What we collect",
    body: [
      "Account basics — your name, email, and the city you said you're building from. Used to greet you, send mission digests, and personalize coach output.",
      "Your work — the idea you dumped, your check-ins, the missions you completed, the chats you had with the coach. Stored so you can pick up tomorrow where you left off.",
      "Usage signals — which page you opened, which mission you completed, when you checked in. Used to make the product less stupid over time.",
      "Payment info — handled by our processor (Stripe). We never see your card number; we only see whether you paid.",
    ],
  },
  {
    num: "III",
    head: "What we don't collect",
    body: [
      "We don't sell, rent, or hand your data to advertisers. We don't run third-party tracking pixels. We don't read your check-ins to find leads.",
      "Your work is not training data. The coach uses your input to generate your response — it does not get fed back into model training, ours or anyone else's.",
    ],
  },
  {
    num: "IV",
    head: "Who can see your stuff",
    body: [
      "By default, your missions, check-ins, and coach chats are private to you. Your cofounder sees the shared roadmap, streak, and receipts you both opted into. Your friends only see what you publish to the crew feed.",
      "Wins post automatically when you clear a shareable mission. You can rewrite or skip the share before it goes out.",
    ],
  },
  {
    num: "V",
    head: "Where data lives and how long",
    body: [
      "Stored encrypted at rest with our hosting provider (Supabase, in the EU region). In-flight, everything moves over TLS.",
      "Active account data sticks around while you're using TheSauce. When you delete your account, your data is removed within 30 days, except where we're legally required to retain billing records (typically 7 years).",
    ],
  },
  {
    num: "VI",
    head: "Your rights",
    body: [
      "Export — pull all your data as JSON from your profile.",
      "Correct — edit your account fields any time. The coach picks up the new context on the next mission.",
      "Delete — close your account from your profile. Done in one click, irreversible.",
      "Object — email us if you want any specific processing to stop and we'll work it out.",
    ],
  },
  {
    num: "VII",
    head: "Cookies and the like",
    body: [
      "We use a session cookie to keep you logged in and one cookie for our payment processor. That's it. No analytics cookies, no ad cookies, no third-party trackers.",
      "Your browser's localStorage holds your missions and chat history so the app works fast. You can clear it any time via your browser settings — this won't delete the server copy.",
    ],
  },
  {
    num: "VIII",
    head: "Kids",
    body: [
      "TheSauce isn't built for anyone under 16. If you're under 16, don't use it. If you're a parent and you find your kid using it, email us and we'll close the account.",
    ],
  },
  {
    num: "IX",
    head: "Changes and reaching us",
    body: [
      "If we change anything material about how data is handled, we'll tell you in-product before it takes effect.",
      "Privacy questions, data requests, or anything in between: privacy@thesauce.app. We reply.",
    ],
  },
];

export function Privacy() {
  return (
    <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-gutter">
        <header className="flex flex-col gap-4 border-b border-sauce-hairlineStrong py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="inline-flex items-center gap-3 transition hover:opacity-80">
            <Wordmark />
          </Link>
          <Folio items={["VOL. 01", "LEGAL — PRIVACY", "EFFECTIVE 2026-06-05"]} />
        </header>

        <section className="grid grid-cols-1 gap-section pt-section pb-12 md:grid-cols-12">
          <div className="md:col-span-8 animate-screen-enter">
            <p className="mono-folio mb-6 text-sauce-gold">Document 01 · Privacy policy</p>
            <h1 className="font-display text-[clamp(48px,9vw,104px)] font-semibold leading-[0.9] tracking-tightest text-sauce-cream">
              Your data,<br />
              <span className="italic font-medium text-sauce-gold">your business.</span>
            </h1>
            <p className="mt-8 max-w-[56ch] font-body text-lede text-sauce-creamMuted">
              We collect what we need to run TheSauce for you. Nothing else. No tracking pixels, no ad networks, no model training on your work.
            </p>
          </div>

          <aside className="md:col-span-4 md:border-l md:border-sauce-hairlineStrong md:pl-10">
            <p className="mono-folio mb-4 text-sauce-creamMuted">At a glance</p>
            <ul className="flex flex-col mono-folio text-sauce-creamMuted">
              <li className="border-t border-sauce-hairline py-3">Never sold or rented</li>
              <li className="border-t border-sauce-hairline py-3">Never used for training</li>
              <li className="border-t border-sauce-hairline py-3">Encrypted, EU-hosted</li>
              <li className="border-t border-sauce-hairline py-3 border-b">Export or delete any time</li>
            </ul>
          </aside>
        </section>

        <section className="border-t border-sauce-hairlineStrong pt-12 pb-section">
          <ol className="flex flex-col">
            {SECTIONS.map(({ num, head, body }) => (
              <li
                key={num}
                className="grid grid-cols-1 gap-x-10 gap-y-4 border-t border-sauce-hairline py-10 last:border-b md:grid-cols-[140px_1fr]"
              >
                <div className="flex md:flex-col md:gap-2">
                  <span className="font-display text-[44px] font-medium leading-none text-sauce-gold tracking-tightest">
                    {num}
                  </span>
                </div>
                <div className="flex flex-col gap-5">
                  <h2 className="font-display text-[clamp(24px,3vw,32px)] font-medium leading-[1.1] tracking-editorial text-sauce-cream">
                    {head}
                  </h2>
                  {body.map((p, i) => (
                    <p key={i} className="max-w-measure font-body text-body leading-[1.65] text-sauce-creamMuted">
                      {p}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="flex flex-col gap-4 border-t border-sauce-hairlineStrong py-6 mono-folio sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sauce-muted">Effective 2026-06-05 · Version 1.0</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sauce-creamMuted transition hover:text-sauce-gold"
          >
            <ArrowLeft size={12} strokeWidth={1.8} />
            Back to TheSauce
          </Link>
        </footer>
      </div>
    </main>
  );
}
