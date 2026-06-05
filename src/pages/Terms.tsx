import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Folio, Wordmark } from "../components/Shell";

const SECTIONS: { num: string; head: string; body: string[] }[] = [
  {
    num: "I",
    head: "The deal in plain English",
    body: [
      "TheSauce gives you a 30-day execution sprint built around your idea — a daily mission, a coach, and a crew to ship in front of. By using the product you're agreeing to these terms. If any part doesn't sit right, stop using it.",
      "These terms are written to be readable. Where they have to be precise, they're precise. Where they can be plain, they're plain.",
    ],
  },
  {
    num: "II",
    head: "Your account",
    body: [
      "You need to be 16 or older. One account per person. You're responsible for keeping your credentials safe and for everything that happens under your account.",
      "We don't collect more than we need. What we do collect, and how it's stored, lives in the Privacy policy.",
    ],
  },
  {
    num: "III",
    head: "Your work is yours",
    body: [
      "Whatever you build using TheSauce — products, copy, plans, businesses, the dollar you make from your first sale — belongs to you. We don't take a cut, claim ownership, or use your work to train models.",
      "You grant us only the narrow license we need to run the product for you: storing your missions, syncing your check-ins, delivering messages to your crew.",
    ],
  },
  {
    num: "IV",
    head: "What the coach is and isn't",
    body: [
      "The coach is an AI tool. It reads your check-ins and gives you the next move. It is not a therapist, accountant, lawyer, financial adviser, or doctor. Don't treat it like one.",
      "Plans and suggestions are guidance, not guarantees. You make the call on whether a move fits your situation. Outcomes depend on what you actually do.",
    ],
  },
  {
    num: "V",
    head: "Subscription and billing",
    body: [
      "The first ten days are free. After that, Pro is a paid subscription billed monthly or annually at the rate shown at checkout. Cancel any time — you keep access until the end of the billing period.",
      "Refunds within 14 days of your first charge, no questions. After that, we look at it case by case. Failed payments pause access until the card situation is sorted.",
    ],
  },
  {
    num: "VI",
    head: "What'll get you booted",
    body: [
      "Don't use TheSauce to harass other builders, spam the crew, scrape the product, run automated abuse against our systems, or build anything illegal. Don't share your account or resell access.",
      "We can suspend or close accounts that break these rules. We don't owe a long explanation when it's obvious.",
    ],
  },
  {
    num: "VII",
    head: "Liability — the boring but important part",
    body: [
      "TheSauce is provided as-is. We don't promise uninterrupted service, perfect coach output, or that any specific business outcome will follow from using the product.",
      "To the maximum extent allowed by law, our total liability for anything related to the product is capped at the amount you paid us in the twelve months before the issue arose, or fifty dollars if you haven't paid anything.",
    ],
  },
  {
    num: "VIII",
    head: "Changes and ending things",
    body: [
      "We may update these terms. If a change materially affects you, we'll tell you in-product before it takes effect. Continuing to use TheSauce after that counts as accepting the new version.",
      "You can close your account any time from your profile. We can close it if you break these terms or if we shut down the product. Your data export options are described in the Privacy policy.",
    ],
  },
  {
    num: "IX",
    head: "Reaching us",
    body: [
      "Questions, disputes, or anything else: hello@thesauce.app. We read every message. We don't always reply in an hour, but we reply.",
    ],
  },
];

export function Terms() {
  return (
    <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-gutter">
        {/* Masthead */}
        <header className="flex flex-col gap-4 border-b border-sauce-hairlineStrong py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="inline-flex items-center gap-3 transition hover:opacity-80">
            <Wordmark />
          </Link>
          <Folio items={["VOL. 01", "LEGAL — TERMS", "EFFECTIVE 2026-06-05"]} />
        </header>

        {/* Hero */}
        <section className="grid grid-cols-1 gap-section pt-section pb-12 md:grid-cols-12">
          <div className="md:col-span-8 animate-screen-enter">
            <p className="mono-folio mb-6 text-sauce-gold">Document 02 · Terms of service</p>
            <h1 className="font-display text-[clamp(48px,9vw,104px)] font-semibold leading-[0.9] tracking-tightest text-sauce-cream">
              The fine print,<br />
              <span className="italic font-medium text-sauce-gold">in plain English.</span>
            </h1>
            <p className="mt-8 max-w-[56ch] font-body text-lede text-sauce-creamMuted">
              These are the rules of the road for using TheSauce. Direct, short, and meant to be read before you sign anything anywhere.
            </p>
          </div>

          <aside className="md:col-span-4 md:border-l md:border-sauce-hairlineStrong md:pl-10">
            <p className="mono-folio mb-4 text-sauce-creamMuted">At a glance</p>
            <ul className="flex flex-col mono-folio text-sauce-creamMuted">
              <li className="border-t border-sauce-hairline py-3">Your work belongs to you</li>
              <li className="border-t border-sauce-hairline py-3">10 days free, then Pro</li>
              <li className="border-t border-sauce-hairline py-3">14-day refund window</li>
              <li className="border-t border-sauce-hairline py-3 border-b">Cancel any time</li>
            </ul>
          </aside>
        </section>

        {/* Sections */}
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

        {/* Footer */}
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
