import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, Bot, Home, Map as MapIcon, Users } from "lucide-react";
import { readStore, resetDemo } from "../utils/storage";

const navItems: { to: string; label: string; sub: string }[] = [
  { to: "/dashboard", label: "Today", sub: "01" },
  { to: "/missions", label: "Map", sub: "02" },
  { to: "/coach", label: "Coach", sub: "03" },
  { to: "/community", label: "Crew", sub: "04" },
];

export function Wordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-[44px] md:text-[52px]" : size === "sm" ? "text-[22px]" : "text-[30px]";
  return (
    <span className={`font-display font-semibold leading-none tracking-tightest text-sauce-cream ${cls}`}>
      The<span className="italic text-sauce-gold">Sauce</span>
    </span>
  );
}

export function Folio({ items }: { items: string[] }) {
  return (
    <div className="flex items-center gap-3 mono-folio text-sauce-creamMuted">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-3">
          {i > 0 && <span aria-hidden className="h-px w-3 bg-sauce-hairlineStrong" />}
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}

export function Shell({ children, folio, title }: { children: ReactNode; folio: string[]; title?: string }) {
  const user = readStore("thesauce_user");
  return (
    <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col md:flex-row md:gap-12 md:px-10 lg:gap-16 lg:px-14">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-sauce-hairlineStrong bg-sauce-black/95 px-gutter pb-3 pt-5 backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <Wordmark />
            <button onClick={() => { resetDemo(); window.location.reload(); }} className="mono-folio text-sauce-muted hover:text-sauce-gold transition">Reset</button>
          </div>
          <Folio items={folio} />
        </header>

        {/* Desktop left rail */}
        <aside className="hidden md:flex md:sticky md:top-0 md:h-screen md:w-[240px] md:shrink-0 md:flex-col md:gap-10 md:py-10 lg:w-[280px]">
          <div className="flex flex-col gap-5">
            <Wordmark size="lg" />
            <span className="rule rule-strong" />
            <div className="flex flex-col gap-2 mono-folio text-sauce-creamMuted leading-relaxed">
              {folio.map((line, i) => <span key={i}>{line}</span>)}
            </div>
          </div>
          {user && (
            <div className="flex flex-col gap-1 mono-label text-sauce-muted">
              <span className="text-sauce-gold">Streak {user.current_day > 0 ? readStore("thesauce_streak").count : 0}</span>
              <span>+{user.execution_score} XP</span>
            </div>
          )}
          <SideNav />
          <div className="mt-auto flex flex-col gap-3">
            <span className="rule" />
            <button onClick={() => { resetDemo(); window.location.reload(); }} className="mono-folio text-left text-sauce-muted hover:text-sauce-gold transition">Reset demo</button>
          </div>
        </aside>

        {/* Content column */}
        <section className="flex flex-1 flex-col">
          <div className="flex-1 px-gutter pb-32 pt-6 md:px-0 md:pb-16 md:pt-12">
            {title && (
              <div className="mb-section animate-screen-enter">
                <h1 className="font-display font-semibold leading-[0.92] tracking-tightest text-[clamp(40px,7vw,68px)] text-sauce-cream">
                  {title}
                </h1>
                <span className="mt-5 block h-px w-16 bg-sauce-gold" />
              </div>
            )}
            <div className="animate-screen-enter">{children}</div>
          </div>
        </section>

        <BottomNav />
      </div>
    </main>
  );
}

function SideNav() {
  const location = useLocation();
  return (
    <nav className="flex flex-col">
      <span className="mb-3 mono-folio text-sauce-muted">Sections</span>
      <ul className="flex flex-col">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <li key={item.to} className="border-t border-sauce-hairline last:border-b">
              <a
                href={item.to}
                className={`group flex items-baseline gap-4 py-3 transition ${active ? "text-sauce-gold" : "text-sauce-cream hover:text-sauce-gold"}`}
              >
                <span className={`mono-folio w-6 ${active ? "text-sauce-gold" : "text-sauce-muted group-hover:text-sauce-gold"}`}>{item.sub}</span>
                <span className="font-display text-2xl font-medium tracking-editorial">{item.label}</span>
                {active && <ArrowRight size={14} className="ml-auto" />}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-sauce-hairlineStrong bg-sauce-black/95 backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-[640px] grid-cols-4">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.to === "/dashboard" ? Home : item.to === "/missions" ? MapIcon : item.to === "/coach" ? Bot : Users;
          return (
            <li key={item.to}>
              <a
                href={item.to}
                className={`flex flex-col items-center gap-1.5 py-3 transition ${active ? "text-sauce-gold" : "text-sauce-creamMuted hover:text-sauce-cream"}`}
              >
                <Icon size={16} strokeWidth={1.6} />
                <span className="mono-folio">{item.label}</span>
                <span className={`h-0.5 w-6 ${active ? "bg-sauce-gold" : "bg-transparent"}`} />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
