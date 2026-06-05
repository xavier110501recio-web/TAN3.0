import type { CSSProperties } from "react";

interface BlockProps {
  className?: string;
  style?: CSSProperties;
}

export function SkeletonBlock({ className = "", style }: BlockProps) {
  return (
    <div
      aria-hidden
      style={style}
      className={`animate-pulse rounded-sm bg-sauce-surface/70 ${className}`}
    />
  );
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <SkeletonBlock className={`h-3 ${className}`} />;
}

/* ───────── Dashboard ───────── */

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-12 animate-screen-enter" aria-busy="true">
      {/* Stats row */}
      <section className="grid grid-cols-3 border-y border-sauce-hairlineStrong divide-x divide-sauce-hairlineStrong">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3 px-4 py-5">
            <SkeletonLine className="w-14" />
            <SkeletonBlock className="h-9 w-20" />
          </div>
        ))}
      </section>

      {/* Mission section */}
      <div className="mx-auto w-full max-w-[720px]">
        <SkeletonLine className="mb-4 w-36" />
        <div className="border-y border-sauce-gold/40">
          <div className="flex items-center justify-between border-b border-sauce-hairline px-1 py-3">
            <SkeletonLine className="w-40" />
            <SkeletonLine className="w-28" />
          </div>
          <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-[1fr_140px] md:gap-12 md:py-10">
            <div>
              <SkeletonBlock className="mb-4 h-10 w-3/4" />
              <SkeletonBlock className="mb-8 h-10 w-2/5" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <SkeletonLine className="mb-1 w-12" />
                  <SkeletonLine className="w-full" />
                  <SkeletonLine className="w-11/12" />
                  <SkeletonLine className="w-3/4" />
                </div>
                <div className="flex flex-col gap-2">
                  <SkeletonLine className="mb-1 w-12" />
                  <SkeletonLine className="w-full" />
                  <SkeletonLine className="w-4/5" />
                </div>
              </div>
            </div>
            <div className="hidden md:flex md:items-start md:justify-end">
              <SkeletonBlock className="h-[140px] w-[120px] rounded-md" />
            </div>
          </div>
          {/* Segmented control */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-sauce-hairlineStrong divide-x divide-sauce-hairlineStrong">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2 px-4 py-4">
                <SkeletonLine className="w-6" />
                <SkeletonBlock className="h-6 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="mx-auto w-full max-w-[720px]">
        <SkeletonLine className="mb-3 w-40" />
        <div className="rounded-lg border border-sauce-hairlineStrong bg-sauce-ink/60 px-3 py-3 md:px-4">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-9 flex-1" />
            <SkeletonBlock className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Missions / Roadmap ───────── */

export function MissionsSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-screen-enter" aria-busy="true">
      <div className="flex flex-col gap-2">
        <SkeletonLine className="max-w-measure" />
        <SkeletonLine className="w-3/4 max-w-measure" />
      </div>
      <article className="overflow-hidden rounded-lg border border-sauce-gold/40 bg-sauce-ink/60">
        <header className="border-b border-sauce-hairlineStrong px-5 py-4 md:px-6">
          <SkeletonLine className="mb-3 w-44" />
          <SkeletonBlock className="h-7 w-32" />
        </header>
        {[0, 1, 2].map((zone) => (
          <section key={zone} className="border-b border-sauce-hairlineStrong last:border-b-0 px-5 py-5 md:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <SkeletonLine className="mb-3 w-40" />
                <SkeletonBlock className="h-7 w-48" />
                <div className="mt-4 flex flex-col gap-2 max-w-[58ch]">
                  <SkeletonLine className="w-full" />
                  <SkeletonLine className="w-4/5" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 pt-1">
                <SkeletonBlock className="h-px w-20" />
                <SkeletonLine className="w-12" />
                <SkeletonBlock className="mt-1 h-4 w-4 rounded-sm" />
              </div>
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}

/* ───────── Community ───────── */

export function CommunitySkeleton() {
  return (
    <div className="flex flex-col gap-section animate-screen-enter" aria-busy="true">
      {/* Lede — matches the negative margins applied in Community.tsx */}
      <div className="-mt-4 mb-[-32px] flex flex-col gap-2 md:-mt-14 md:mb-[-48px]">
        <SkeletonLine className="w-full max-w-measure" />
        <SkeletonLine className="w-3/4 max-w-measure" />
      </div>

      {/* Your team */}
      <section className="flex flex-col gap-6">
        <header className="flex items-baseline justify-between border-b border-sauce-hairlineStrong pb-3">
          <SkeletonBlock className="h-7 w-36" />
          <SkeletonLine className="w-32" />
        </header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col gap-4 border border-sauce-hairlineStrong bg-sauce-ink/40 p-5">
              <div className="flex items-center justify-between">
                <SkeletonLine className="w-24" />
                <SkeletonBlock className="h-3.5 w-3.5 rounded-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <SkeletonBlock className="h-6 w-3/4" />
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-5/6" />
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-sauce-hairline pt-3">
                <SkeletonLine className="w-28" />
                <SkeletonBlock className="h-3 w-3 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quit-rate strip */}
      <section className="border-y border-sauce-hairlineStrong py-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="flex flex-col gap-2">
            <SkeletonLine className="w-44" />
            <SkeletonBlock className="h-10 w-4/5" />
            <SkeletonBlock className="h-10 w-3/5" />
            <SkeletonLine className="mt-2 w-52" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-[3px]">
              {Array.from({ length: 20 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-7 w-[6px] rounded-none" />
              ))}
            </div>
            <SkeletonLine className="w-40" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 divide-x divide-sauce-hairline border-t border-sauce-hairline">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2 px-4 py-3 first:pl-0">
              <SkeletonLine className="w-24" />
              <SkeletonBlock className="h-6 w-16" />
            </div>
          ))}
        </div>
      </section>

      {/* Dispatch board */}
      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-3 border-b border-sauce-hairlineStrong pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-7 w-52" />
            <SkeletonLine className="w-72" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBlock key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </header>

        {/* Manual share */}
        <div className="grid grid-cols-1 gap-3 border border-sauce-hairlineStrong p-4 md:grid-cols-[1fr_auto] md:items-end md:gap-6">
          <div className="flex flex-col gap-2">
            <SkeletonLine className="w-28" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
          <SkeletonBlock className="h-10 w-24" />
        </div>

        {/* Feed rows */}
        <ol className="flex flex-col">
          {[0, 1, 2].map((i) => (
            <li key={i} className="grid grid-cols-1 gap-3 border-t border-sauce-hairline py-6 last:border-b sm:grid-cols-[180px_1fr] sm:gap-6">
              <div className="flex flex-col gap-1.5">
                <SkeletonBlock className="h-5 w-28" />
                <SkeletonLine className="w-32" />
                <SkeletonLine className="w-16" />
                <SkeletonLine className="mt-1 w-14" />
              </div>
              <div className="flex flex-col gap-4">
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-11/12" />
                <SkeletonLine className="w-3/4" />
                <div className="flex items-center gap-5">
                  <SkeletonLine className="w-12" />
                  <SkeletonLine className="w-12" />
                  <SkeletonLine className="w-12" />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/* ───────── Stack ───────── */

export function StackSkeleton() {
  return (
    <div className="-mt-[clamp(20px,3.5vw,36px)] flex flex-col gap-10 animate-screen-enter" aria-busy="true">
      {/* Top bar */}
      <section className="flex flex-col">
        {/* Search */}
        <div className="flex items-center gap-3 rounded-lg border border-sauce-hairlineStrong bg-sauce-ink/60 px-4 py-3">
          <SkeletonBlock className="h-4 w-4 rounded-sm" />
          <SkeletonBlock className="h-4 flex-1" />
        </div>

        {/* Filter tabs */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-md border border-sauce-borderStrong bg-sauce-surface/40 p-1">
            {[0, 1, 2].map((i) => (
              <SkeletonBlock key={i} className="h-7 w-20 rounded-sm" />
            ))}
          </div>
          <SkeletonLine className="hidden w-20 sm:block" />
        </div>

        {/* Helper text */}
        <div className="mt-3">
          <SkeletonLine className="w-3/4 max-w-measure" />
        </div>

        {/* Chip list */}
        <ul className="mt-3 flex flex-wrap gap-2">
          {[88, 72, 104, 92, 80, 110, 84, 96, 76, 100, 86, 94].map((w, i) => (
            <li key={i}>
              <SkeletonBlock className="h-8 rounded-full" style={{ width: w }} />
            </li>
          ))}
        </ul>
      </section>

      {/* Pulse strip */}
      <section className="pt-6">
        <div className="mb-4 flex items-baseline gap-4">
          <SkeletonLine className="w-12" />
          <SkeletonLine className="w-44" />
          <span className="h-px flex-1 bg-sauce-hairlineStrong" />
        </div>
        <div className="grid grid-cols-1 gap-px rounded-lg border border-sauce-gold/30 bg-sauce-hairlineStrong overflow-hidden sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-3 bg-sauce-ink/80 p-5 md:p-6">
              <div className="flex items-center justify-between">
                <SkeletonLine className="w-24" />
                <SkeletonBlock className="h-3 w-3 rounded-sm" />
              </div>
              <SkeletonBlock className="h-10 w-28" />
              <SkeletonLine className="w-32" />
            </div>
          ))}
        </div>
      </section>

      {/* Field kit */}
      <section className="pt-6">
        <div className="mb-3 flex items-baseline gap-4">
          <SkeletonLine className="w-16" />
          <SkeletonLine className="w-36" />
          <span className="h-px flex-1 bg-sauce-hairlineStrong" />
          <SkeletonLine className="hidden w-20 sm:block" />
        </div>
        <SkeletonLine className="w-3/4 max-w-measure" />

        {/* Search */}
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-sauce-hairlineStrong bg-sauce-ink/60 px-4 py-3">
          <SkeletonBlock className="h-4 w-4 rounded-sm" />
          <SkeletonBlock className="h-4 flex-1" />
        </div>

        {/* Kind filter chips */}
        <ul className="mt-3 flex flex-wrap gap-2">
          {[40, 56, 50, 56, 56, 60].map((w, i) => (
            <li key={i}>
              <SkeletonBlock className="h-7 rounded-full" style={{ width: w }} />
            </li>
          ))}
        </ul>

        {/* Result rows */}
        <ol className="mt-5 flex flex-col">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="grid grid-cols-[36px_1fr_auto] items-baseline gap-4 border-t border-sauce-hairline py-4 last:border-b">
              <SkeletonLine className="w-6" />
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <SkeletonBlock className="h-5 w-16 rounded-sm" />
                  <SkeletonBlock className="h-5 w-2/5" />
                </div>
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-4/5" />
                <SkeletonLine className="w-40" />
              </div>
              <SkeletonBlock className="mt-1 h-3.5 w-3.5 rounded-sm self-start" />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/* ───────── Coach ───────── */

export function CoachSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-sauce-hairlineStrong pb-3">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-7 w-52" />
          <SkeletonBlock className="h-4 w-4 rounded-sm" />
          <SkeletonLine className="hidden w-44 md:block" />
        </div>
        <SkeletonBlock className="h-8 w-24" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 pt-4">
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
          <ol className="flex flex-col gap-5">
            {[
              { coach: true, lines: 3, widths: ["w-full", "w-11/12", "w-3/4"] },
              { coach: false, lines: 1, widths: ["w-40"] },
              { coach: true, lines: 2, widths: ["w-full", "w-4/5"] },
              { coach: false, lines: 1, widths: ["w-60"] },
            ].map((m, i) => (
              <li key={i} className="grid grid-cols-[80px_1fr] gap-4 md:grid-cols-[96px_1fr]">
                <div className="flex flex-col gap-1">
                  <SkeletonLine className="w-12" />
                  <SkeletonLine className="w-10" />
                </div>
                {m.coach ? (
                  <div className="flex flex-col gap-2">
                    {m.widths.map((w, j) => <SkeletonLine key={j} className={w} />)}
                  </div>
                ) : (
                  <div className="flex">
                    <div className="inline-block max-w-full rounded-md border border-sauce-hairlineStrong bg-sauce-surface/40 px-3.5 py-2.5">
                      <SkeletonLine className={m.widths[0]} />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="shrink-0 pt-3">
          <div className="rounded-lg border border-sauce-hairlineStrong bg-sauce-ink/60 px-3 py-3 md:px-4">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-9 flex-1" />
              <SkeletonBlock className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
