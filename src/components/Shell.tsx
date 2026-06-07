import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Bot, Home, Map as MapIcon, Plug, Users } from "lucide-react";
import { readStore, resetDemo } from "../utils/storage";
import { SkillsList } from "./SkillsList";
import { SidebarProfile } from "./SidebarProfile";
import { ShareToast } from "./ShareToast";

const navItems: { to: string; label: string; sub: string }[] = [
  { to: "/dashboard", label: "Today", sub: "01" },
  { to: "/missions", label: "Map", sub: "02" },
  { to: "/coach", label: "Coach", sub: "03" },
  { to: "/community", label: "Crew", sub: "04" },
  { to: "/stack", label: "Stack", sub: "05" },
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

export type SidebarMode = "full" | "minimal";

export function Shell({ children, folio, title, sidebarMode = "full", fullscreen = false, hideFolio = false, sidebarStats }: { children: ReactNode; folio: string[]; title?: string; sidebarMode?: SidebarMode; fullscreen?: boolean; hideFolio?: boolean; sidebarStats?: ReactNode }) {
  const user = readStore("thesauce_user");
  const skills = user ? readStore("thesauce_skills") : null;
  const minimal = sidebarMode === "minimal";
  return (
    <main className={`bg-sauce-black text-sauce-cream noise ${fullscreen ? "h-screen overflow-hidden" : "min-h-screen"}`}>
      <div className={`mx-auto flex w-full max-w-[1280px] flex-col md:flex-row md:px-10 lg:px-14 ${fullscreen ? "h-screen" : "min-h-screen"}`} style={{ columnGap: 0 }}>
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-sauce-hairlineStrong bg-sauce-black/95 px-gutter pb-3 pt-5 backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <Wordmark />
            <button onClick={() => { resetDemo(); window.location.reload(); }} className="mono-folio text-sauce-muted hover:text-sauce-gold transition">Reset</button>
          </div>
          {!hideFolio && <Folio items={folio} />}
        </header>

        {/* Desktop left rail — width animates between full and minimal */}
        <aside
          className={`hidden md:flex md:sticky md:top-0 md:h-screen md:shrink-0 md:flex-col md:overflow-y-auto md:no-scrollbar md:py-10 transition-[width,padding] duration-[360ms] ease-[cubic-bezier(.2,.7,.2,1)] ${
            minimal
              ? "md:w-[150px] md:pr-4 lg:w-[170px] lg:pr-5"
              : "md:w-[280px] md:pr-12 lg:w-[320px] lg:pr-16"
          }`}
        >
          <div className="flex flex-col gap-5">
            <div className="transition-opacity duration-300">
              {minimal ? <Wordmark size="md" /> : <Wordmark size="lg" />}
            </div>
            {sidebarStats && !minimal && <div className="transition-opacity duration-300">{sidebarStats}</div>}
            {!hideFolio && <span className="rule rule-strong" />}
            {!hideFolio && (
              <div className="flex flex-col gap-2 mono-folio text-sauce-creamMuted leading-relaxed">
                {folio.map((line, i) => <span key={i}>{line}</span>)}
              </div>
            )}
          </div>
          {/* Compact nav — only visible when sidebar is minimal */}
          <div
            className={`transition-all duration-[280ms] ease-[cubic-bezier(.2,.7,.2,1)] ${
              minimal ? "mt-8 max-h-[2000px] opacity-100" : "pointer-events-none mt-0 max-h-0 -translate-y-2 overflow-hidden opacity-0"
            }`}
            aria-hidden={!minimal}
          >
            <CompactNav />
          </div>
          {/* Full content — only visible when sidebar is full */}
          <div
            className={`flex flex-col gap-8 transition-all duration-[280ms] ease-[cubic-bezier(.2,.7,.2,1)] ${
              minimal ? "pointer-events-none mt-0 max-h-0 -translate-y-2 overflow-hidden opacity-0" : "mt-8 max-h-[2000px] translate-y-0 opacity-100"
            }`}
            aria-hidden={minimal}
          >
            {user && !hideFolio && (
              <div className="flex flex-col gap-1 mono-label text-sauce-muted">
                <span className="text-sauce-gold">Streak {user.current_day > 0 ? readStore("thesauce_streak").count : 0}</span>
                <span>+{user.execution_score} XP</span>
              </div>
            )}
            <SideNav />
            {skills && <SkillsList skills={skills} />}
            <div className="mt-auto">
              <SidebarProfile />
            </div>
          </div>
        </aside>

        {/* Content column */}
        <section className={`flex flex-1 flex-col ${fullscreen ? "min-h-0 overflow-hidden" : ""}`}>
          <div className={`px-gutter pt-6 md:px-0 ${fullscreen ? "flex min-h-0 flex-1 flex-col pb-[80px] md:pb-10 md:pt-10" : "flex-1 pb-32 md:pb-16 md:pt-12"}`}>
            {title && (
              <div className="mb-section animate-screen-enter">
                <h1 className="font-display font-semibold leading-[0.92] tracking-tightest text-[clamp(40px,7vw,68px)] text-sauce-cream">
                  {title}
                </h1>
                <span className="mt-5 block h-px w-16 bg-sauce-gold" />
              </div>
            )}
            <div className={`animate-screen-enter ${fullscreen ? "flex min-h-0 flex-1 flex-col" : ""}`}>{children}</div>
          </div>
        </section>

        <BottomNav />
      </div>
      <ShareToast />
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
              <Link
                to={item.to}
                className={`group flex items-baseline gap-4 py-3 transition ${active ? "text-sauce-gold" : "text-sauce-cream hover:text-sauce-gold"}`}
              >
                <span className={`mono-folio w-6 ${active ? "text-sauce-gold" : "text-sauce-muted group-hover:text-sauce-gold"}`}>{item.sub}</span>
                <span className="font-display text-2xl font-medium tracking-editorial">{item.label}</span>
                {active && <ArrowRight size={14} className="ml-auto" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CompactNav() {
  const location = useLocation();
  return (
    <nav className="flex flex-col gap-0.5">
      <span className="mb-3 mono-folio text-sauce-muted">Sections</span>
      {navItems.map((item) => {
        const Icon =
          item.to === "/dashboard" ? Home
          : item.to === "/missions" ? MapIcon
          : item.to === "/coach" ? Bot
          : item.to === "/community" ? Users
          : Plug;
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`group flex items-center gap-2.5 rounded-md px-2 py-2 mono-folio transition ${
              active
                ? "bg-sauce-surface/60 text-sauce-gold"
                : "text-sauce-creamMuted hover:bg-sauce-surface/40 hover:text-sauce-cream"
            }`}
          >
            <Icon size={13} strokeWidth={1.7} className={active ? "text-sauce-gold" : "text-sauce-muted group-hover:text-sauce-cream"} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function BottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-sauce-hairlineStrong bg-sauce-black/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-[420px] items-stretch justify-around px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          const Icon =
            item.to === "/dashboard"
              ? Home
              : item.to === "/missions"
              ? MapIcon
              : item.to === "/coach"
              ? Bot
              : item.to === "/community"
              ? Users
              : Plug;
          return (
            <li key={item.to} className="w-[64px] shrink-0">
              <Link
                to={item.to}
                className={`flex flex-col items-center gap-1.5 py-3 transition ${active ? "text-sauce-gold" : "text-sauce-creamMuted hover:text-sauce-cream"}`}
              >
                <Icon size={16} strokeWidth={1.6} />
                <span className="mono-folio">{item.label}</span>
                <span className={`h-0.5 w-6 ${active ? "bg-sauce-gold" : "bg-transparent"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
