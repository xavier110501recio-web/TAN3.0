import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  CreditCard,
  GitBranch,
  GraduationCap,
  Hash,
  Instagram,
  Mail,
  Newspaper,
  Plug,
  Plus,
  Search,
  Server,
  Trophy,
  Twitter,
  X,
  Youtube,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Shell } from "../components/Shell";
import { StackSkeleton } from "../components/Skeletons";
import { readStore, updateStore } from "../utils/storage";
import { pad } from "../utils/format";
import { RESOURCES } from "../data/fieldkit";
import type {
  Connection,
  ConnectionCategory,
  ConnectionKind,
  ConnectionMetric,
  Resource,
  ResourceKind,
} from "../types";

/* ─── Icon + category metadata ─── */

const ICON_BY_KIND: Record<ConnectionKind, LucideIcon> = {
  stripe: CreditCard,
  notion: BookOpen,
  linear: GitBranch,
  slack: Hash,
  x: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  gmail: Mail,
  mcp: Server,
};

const CATEGORY_LABEL: Record<ConnectionCategory, string> = {
  revenue: "Revenue",
  audience: "Audience",
  ops: "Operations",
  mcp: "Custom · MCP",
};

type Filter = "all" | "connected" | "available";

/* ─── Page ─── */

export function Stack() {
  const [connections, setConnections] = useState<Connection[]>(() => readStore("thesauce_connections"));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  // TODO(api): mock skeleton hold — when wiring real API, only show <StackSkeleton /> if the request hasn't resolved within ~200ms (otherwise it flickers on fast responses).
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  const selected = connections.find((c) => c.id === selectedId) ?? null;
  const folio = ["VOL. 01", "MGMT 05", "STACK & GAINS"];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ordered = [...connections].sort((a, b) => {
      if (a.status !== b.status) return a.status === "connected" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return ordered.filter((c) => {
      if (filter === "connected" && c.status !== "connected") return false;
      if (filter === "available" && c.status !== "available") return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.kind.toLowerCase().includes(q) ||
        c.blurb.toLowerCase().includes(q) ||
        CATEGORY_LABEL[c.category].toLowerCase().includes(q)
      );
    });
  }, [connections, query, filter]);

  const counts = useMemo(
    () => ({
      all: connections.length,
      connected: connections.filter((c) => c.status === "connected").length,
      available: connections.filter((c) => c.status === "available").length,
    }),
    [connections],
  );

  function persist(next: Connection[]) {
    setConnections(next);
    updateStore("thesauce_connections", next);
  }

  function connect(id: string) {
    const today = new Date().toISOString().slice(0, 10);
    const next = connections.map((c) =>
      c.id === id
        ? {
            ...c,
            status: "connected" as const,
            connected_at: today,
            last_sync: "just now",
            metrics: c.metrics ?? defaultMetricsFor(c.kind),
            fields_pulled: c.fields_pulled ?? defaultFieldsFor(c.kind),
            usage: c.usage ?? [
              { timestamp: "just now", action: "Authorized integration", surface: "Stack page" },
            ],
          }
        : c,
    );
    persist(next);
  }

  function disconnect(id: string) {
    const next = connections.map((c) =>
      c.id === id ? { ...c, status: "available" as const, last_sync: undefined } : c,
    );
    persist(next);
  }

  return (
    <Shell folio={folio} title="The stack.">
      {loading ? <StackSkeleton /> : (
      <div className="-mt-[clamp(20px,3.5vw,36px)] flex flex-col gap-10 animate-screen-enter">
        {/* ── Top bar: search + filter + helper + chips (tight stack) ── */}
        <section className="flex flex-col">
          {/* Search */}
          <div className="flex items-center gap-3 rounded-lg border border-sauce-hairlineStrong bg-sauce-ink/60 px-4 py-3 transition focus-within:border-sauce-gold/60">
            <Search size={14} strokeWidth={1.8} className="shrink-0 text-sauce-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Stripe, Notion, MCP servers…"
              className="flex-1 bg-transparent font-body text-body leading-none text-sauce-cream outline-none placeholder:text-sauce-muted"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="grid h-6 w-6 place-items-center rounded-md text-sauce-muted transition hover:bg-sauce-surface hover:text-sauce-gold"
              >
                <X size={12} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 rounded-md border border-sauce-borderStrong bg-sauce-surface/40 p-1">
              {(["all", "connected", "available"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-2 rounded-sm px-3 py-1.5 mono-folio transition ${
                    filter === f ? "bg-sauce-gold text-sauce-black" : "text-sauce-creamMuted hover:text-sauce-gold"
                  }`}
                >
                  {f}
                  <span className={`tabular ${filter === f ? "text-sauce-black/70" : "text-sauce-muted"}`}>
                    {pad(counts[f])}
                  </span>
                </button>
              ))}
            </div>
            <span className="mono-folio text-sauce-muted hidden sm:inline">
              {pad(filtered.length)} showing
            </span>
          </div>

          {/* Inline helper — sits in the crack between tabs and chips */}
          <p className="mt-3 font-body text-caption italic leading-[1.55] text-sauce-creamMuted">
            Each connection tells you what we pull, when it surfaced, and where the data showed up.
          </p>

          {/* Chip list */}
          {filtered.length === 0 ? (
            <p className="mt-3 mono-folio text-sauce-muted">No matches · try a different search or filter.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {filtered.map((c) => (
                <li key={c.id}>
                  <ConnectionChip
                    connection={c}
                    selected={selectedId === c.id}
                    onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Selected detail (only renders when a chip is picked) ── */}
        <AnimatePresence>
          {selected && (
            <motion.section
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <ConnectionDetail
                connection={selected}
                onConnect={() => connect(selected.id)}
                onDisconnect={() => disconnect(selected.id)}
                onClose={() => setSelectedId(null)}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Pulse ── */}
        <PulseStrip connected={connections.filter((c) => c.status === "connected")} />

        {/* ── Field kit ── */}
        <FieldKit />
      </div>
      )}
    </Shell>
  );
}

/* ─── Chip ─── */

function ConnectionChip({
  connection,
  selected,
  onClick,
}: {
  connection: Connection;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = ICON_BY_KIND[connection.kind];
  const isConnected = connection.status === "connected";
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
        selected
          ? "border-sauce-gold bg-sauce-gold/15 text-sauce-cream"
          : isConnected
          ? "border-sauce-gold/30 bg-sauce-ink/60 text-sauce-cream hover:border-sauce-gold/60"
          : "border-sauce-borderStrong bg-sauce-ink/30 text-sauce-creamMuted hover:border-sauce-gold/40 hover:text-sauce-cream"
      }`}
    >
      <Icon
        size={12}
        strokeWidth={1.8}
        className={`shrink-0 transition ${
          selected || isConnected ? "text-sauce-gold" : "text-sauce-muted group-hover:text-sauce-gold"
        }`}
      />
      <span className="font-body text-[13px] leading-none">{connection.name}</span>
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${
          isConnected ? "bg-sauce-gold" : "border border-sauce-muted bg-transparent"
        }`}
      />
    </button>
  );
}

/* ─── Detail panel ─── */

function ConnectionDetail({
  connection,
  onConnect,
  onDisconnect,
  onClose,
}: {
  connection: Connection;
  onConnect: () => void;
  onDisconnect: () => void;
  onClose: () => void;
}) {
  const Icon = ICON_BY_KIND[connection.kind];
  const isConnected = connection.status === "connected";

  return (
    <article className="overflow-hidden rounded-lg border border-sauce-gold/30 bg-sauce-ink/60">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-sauce-hairlineStrong px-5 py-5 md:px-6">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-md border border-sauce-gold/40 bg-sauce-gold/15 text-sauce-gold">
            <Icon size={18} strokeWidth={1.7} />
          </span>
          <div>
            <div className="flex items-baseline gap-3">
              <h2 className="font-display text-3xl font-medium leading-none tracking-editorial text-sauce-cream md:text-4xl">
                {connection.name}
              </h2>
              <span className="mono-folio text-sauce-gold">{CATEGORY_LABEL[connection.category]}</span>
            </div>
            <p className="mt-2 font-body text-body leading-[1.5] text-sauce-creamMuted">{connection.blurb}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`mono-folio ${isConnected ? "text-sauce-gold" : "text-sauce-muted"}`}>
            {isConnected ? "● Connected" : "○ Not connected"}
          </span>
          <button
            onClick={onClose}
            aria-label="Close detail"
            className="grid h-8 w-8 place-items-center rounded-md border border-sauce-borderStrong text-sauce-muted transition hover:border-sauce-gold hover:text-sauce-gold"
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-10 px-5 py-6 md:px-6 md:py-8">
        {/* Metrics — if connected */}
        {isConnected && connection.metrics && connection.metrics.length > 0 && (
          <section>
            <div className="mb-4 flex items-baseline gap-4">
              <span className="mono-folio text-sauce-gold">Stats we pull</span>
              <span className="rule rule-strong flex-1" />
              <span className="mono-folio text-sauce-muted hidden sm:inline">
                {pad(connection.metrics.length)} metrics
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px rounded-md border border-sauce-hairlineStrong bg-sauce-hairlineStrong overflow-hidden sm:grid-cols-4">
              {connection.metrics.map((m) => (
                <div key={m.label} className="flex flex-col gap-2 bg-sauce-ink/80 p-4">
                  <span className="mono-folio text-sauce-muted">{m.label}</span>
                  <span className="font-display text-2xl font-medium leading-none tracking-tightest text-sauce-cream tabular md:text-3xl">
                    {m.value}
                  </span>
                  {m.delta && (
                    <span className={`mono-folio ${m.trend === "down" ? "text-sauce-creamMuted" : "text-sauce-gold"}`}>
                      {m.delta} {m.trend === "up" ? "↑" : m.trend === "down" ? "↓" : ""}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Data we touch */}
        {connection.fields_pulled && connection.fields_pulled.length > 0 && (
          <section>
            <div className="mb-3 flex items-baseline gap-4">
              <span className="mono-folio text-sauce-gold">Data we touch</span>
              <span className="rule rule-strong flex-1" />
            </div>
            <ul className="flex flex-wrap gap-2">
              {connection.fields_pulled.map((f) => (
                <li
                  key={f}
                  className="rounded-md border border-sauce-borderStrong bg-sauce-surface/40 px-3 py-1.5 mono-folio text-sauce-creamMuted"
                >
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-3 max-w-measure font-body text-caption italic leading-[1.55] text-sauce-creamMuted">
              Read-only. Nothing is written back to {connection.name}.
            </p>
          </section>
        )}

        {/* Usage timeline */}
        {isConnected && connection.usage && connection.usage.length > 0 && (
          <section>
            <div className="mb-4 flex items-baseline gap-4">
              <span className="mono-folio text-sauce-gold">Recent usage</span>
              <span className="rule rule-strong flex-1" />
            </div>
            <ol className="flex flex-col">
              {connection.usage.map((u, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[100px_1fr] gap-4 border-t border-sauce-hairline py-3 last:border-b sm:grid-cols-[140px_1fr]"
                >
                  <span className="mono-folio tabular text-sauce-muted">{u.timestamp}</span>
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-lg font-medium tracking-editorial text-sauce-cream">{u.action}</span>
                    <span className="mono-folio text-sauce-creamMuted">Surface · {u.surface}</span>
                    {u.result && (
                      <span className="mt-1 font-body text-caption italic leading-[1.55] text-sauce-creamMuted">↳ {u.result}</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* CTA row */}
        <section className="flex flex-wrap items-center justify-between gap-4 border-t border-sauce-hairlineStrong pt-5">
          {isConnected ? (
            <>
              <span className="mono-folio text-sauce-muted max-w-[40ch]">
                Connected {connection.connected_at} · Last sync {connection.last_sync ?? "—"}. Disconnecting stops every read above.
              </span>
              <button
                onClick={onDisconnect}
                className="rounded-md border border-sauce-borderStrong px-4 py-2.5 mono-folio text-sauce-creamMuted transition hover:border-sauce-gold hover:text-sauce-gold"
              >
                Disconnect
              </button>
            </>
          ) : (
            <>
              <span className="mono-folio text-sauce-muted max-w-[40ch]">
                Authorize to start pulling the stats above. Demo mode — no real OAuth.
              </span>
              <button
                onClick={onConnect}
                className="flex items-center gap-2 rounded-md bg-sauce-gold px-4 py-2.5 mono-folio text-sauce-black transition hover:bg-sauce-goldBright"
              >
                <Plus size={12} strokeWidth={2.2} />
                {connection.kind === "mcp" ? "Add server" : `Connect ${connection.name}`}
              </button>
            </>
          )}
        </section>
      </div>
    </article>
  );
}

/* ─── Pulse strip (bottom) ─── */

function PulseStrip({ connected }: { connected: Connection[] }) {
  const pulse = useMemo(() => {
    const stripe = connected.find((c) => c.kind === "stripe");
    const audience = connected.filter((c) => c.category === "audience");

    const revenue = stripe?.metrics?.find((m) => m.label.startsWith("Revenue"));
    const followers = audience.flatMap((c) => c.metrics ?? []).find((m) => m.label === "Followers");

    return [
      {
        label: "Revenue · 30d",
        value: revenue?.value ?? "$0",
        delta: revenue?.delta,
        hint: stripe ? "via Stripe" : "Connect Stripe",
        Icon: CreditCard,
      },
      {
        label: "Reach · audience",
        value: followers?.value ?? "0",
        delta: followers?.delta,
        hint:
          audience.length > 0 ? `${audience.length} source${audience.length > 1 ? "s" : ""}` : "Add Instagram, X, YouTube",
        Icon: Zap,
      },
      {
        label: "Tools wired",
        value: pad(connected.length),
        delta: undefined,
        hint: "across revenue · audience · ops",
        Icon: Plug,
      },
    ];
  }, [connected]);

  return (
    <section className="pt-6">
      <div className="mb-4 flex items-baseline gap-4">
        <span className="mono-folio text-sauce-gold">Pulse</span>
        <span className="mono-folio text-sauce-muted">live across {pad(connected.length)} wired tools</span>
        <span className="rule rule-strong flex-1" />
      </div>
      <div className="grid grid-cols-1 gap-px rounded-lg border border-sauce-gold/30 bg-sauce-hairlineStrong overflow-hidden sm:grid-cols-3">
        {pulse.map((p) => (
          <div key={p.label} className="flex flex-col gap-2 bg-sauce-ink/80 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <span className="mono-folio text-sauce-muted">{p.label}</span>
              <p.Icon size={13} strokeWidth={1.6} className="text-sauce-creamMuted" />
            </div>
            <span className="font-display text-[clamp(34px,4.5vw,46px)] font-medium leading-none tracking-tightest text-sauce-cream tabular">
              {p.value}
            </span>
            <span className="flex items-baseline gap-2 mono-folio">
              {p.delta && <span className="text-sauce-gold">{p.delta}</span>}
              <span className="text-sauce-muted">{p.hint}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Field kit (resource library for the user's project) ─── */

const RESOURCE_ICON: Record<ResourceKind, LucideIcon> = {
  skill: GraduationCap,
  mcp: Server,
  repo: GitBranch,
  play: Trophy,
  signal: Newspaper,
};

const RESOURCE_LABEL: Record<ResourceKind, string> = {
  skill: "Skill",
  mcp: "MCP",
  repo: "Repo",
  play: "Play",
  signal: "Signal",
};

const RESOURCE_FILTERS: Array<{ key: ResourceKind | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "skill", label: "Skills" },
  { key: "mcp", label: "MCP" },
  { key: "repo", label: "Repos" },
  { key: "play", label: "Plays" },
  { key: "signal", label: "Signal" },
];

const STOPWORDS = new Set([
  "i", "a", "an", "the", "to", "for", "of", "in", "on", "at", "is", "are", "and", "or",
  "with", "my", "me", "need", "want", "how", "what", "should", "do", "can", "would",
  "could", "be", "have", "has", "from", "about", "any", "some", "this", "that", "it",
  "im", "find", "get", "make", "help", "better", "more", "less", "new", "best",
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function scoreResource(r: Resource, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const title = r.title.toLowerCase();
  const desc = r.description.toLowerCase();
  const tag = (r.tag || "").toLowerCase();
  const source = r.source.toLowerCase();
  const kindLabel = r.kind.toLowerCase();
  const keywordBlob = (r.keywords || []).map((k) => k.toLowerCase()).join(" | ");

  let s = 0;
  for (const t of tokens) {
    if (title.includes(t)) s += 5;
    if (keywordBlob.includes(t)) s += 4;
    if (tag.includes(t)) s += 3;
    if (desc.includes(t)) s += 2;
    if (source.includes(t)) s += 1;
    if (kindLabel.includes(t)) s += 1;
  }
  return s;
}

function FieldKit() {
  const [kindFilter, setKindFilter] = useState<ResourceKind | "all">("all");
  const [query, setQuery] = useState("");
  const user = readStore("thesauce_user");
  const niche = user?.niche?.trim() || "your space";

  const filtered = useMemo(() => {
    const q = query.trim();
    const tokens = tokenize(q);
    let base: Resource[];
    if (tokens.length === 0) {
      base = RESOURCES;
    } else {
      const scored = RESOURCES.map((r) => ({ r, s: scoreResource(r, tokens) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s);
      base = scored.map((x) => x.r);
    }
    return kindFilter === "all" ? base : base.filter((r) => r.kind === kindFilter);
  }, [query, kindFilter]);

  const searching = query.trim().length > 0;

  return (
    <section className="pt-6">
      <div className="mb-3 flex items-baseline gap-4">
        <span className="mono-folio text-sauce-gold">Field kit</span>
        <span className="mono-folio text-sauce-muted">curated for {niche.toLowerCase()}</span>
        <span className="rule rule-strong flex-1" />
        <span className="mono-folio text-sauce-muted hidden sm:inline">
          {searching ? `${pad(filtered.length)} matches` : `${pad(filtered.length)} picks`}
        </span>
      </div>
      <p className="font-body text-caption italic leading-[1.55] text-sauce-creamMuted">
        Skills to drill, MCP servers to wire, repos to fork, plays to study, signal from your space.
      </p>

      {/* Semantic search */}
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-sauce-hairlineStrong bg-sauce-ink/60 px-4 py-3 transition focus-within:border-sauce-gold/60">
        <Search size={14} strokeWidth={1.8} className="shrink-0 text-sauce-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "I need better outreach support" or "how do I find first customers"'
          className="flex-1 bg-transparent font-body text-body leading-none text-sauce-cream outline-none placeholder:text-sauce-muted"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="grid h-6 w-6 place-items-center rounded-md text-sauce-muted transition hover:bg-sauce-surface hover:text-sauce-gold"
          >
            <X size={12} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Kind filter chips */}
      <ul className="mt-3 flex flex-wrap gap-2">
        {RESOURCE_FILTERS.map((f) => {
          const active = kindFilter === f.key;
          return (
            <li key={f.key}>
              <button
                onClick={() => setKindFilter(f.key)}
                className={`rounded-full border px-3 py-1.5 mono-folio transition ${
                  active
                    ? "border-sauce-gold bg-sauce-gold text-sauce-black"
                    : "border-sauce-borderStrong text-sauce-creamMuted hover:border-sauce-gold/60 hover:text-sauce-gold"
                }`}
              >
                {f.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-sauce-borderStrong bg-sauce-ink/30 px-5 py-6">
          <p className="mono-folio text-sauce-muted">No matches</p>
          <p className="mt-1 font-body text-caption text-sauce-creamMuted">
            Try different words, or{" "}
            <button
              onClick={() => {
                setQuery("");
                setKindFilter("all");
              }}
              className="text-sauce-gold underline decoration-sauce-gold/50 underline-offset-2 transition hover:decoration-sauce-gold"
            >
              browse all picks
            </button>
            .
          </p>
        </div>
      ) : (
        <ol className="mt-5 flex flex-col">
          {filtered.map((r, i) => (
            <ResourceRow key={r.id} resource={r} index={i + 1} />
          ))}
        </ol>
      )}
    </section>
  );
}

function ResourceRow({ resource, index }: { resource: Resource; index: number }) {
  const Icon = RESOURCE_ICON[resource.kind];
  return (
    <li className="border-t border-sauce-hairline last:border-b">
      <button
        type="button"
        className="group grid w-full grid-cols-[36px_1fr_auto] items-baseline gap-4 py-4 text-left transition hover:bg-sauce-surface/30"
      >
        <span className="mono-folio tabular text-sauce-muted transition group-hover:text-sauce-gold">
          {pad(index)}
        </span>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-sauce-gold/15 px-2 py-1 mono-folio text-sauce-gold">
              <Icon size={11} strokeWidth={1.8} />
              {RESOURCE_LABEL[resource.kind]}
            </span>
            <h4 className="font-display text-xl font-medium tracking-editorial text-sauce-cream">
              {resource.title}
            </h4>
          </div>
          <p className="max-w-[68ch] font-body text-caption leading-[1.55] text-sauce-creamMuted">
            {resource.description}
          </p>
          <p className="mono-folio text-sauce-muted">
            {resource.source} · {resource.meta}
            {resource.tag && <> · <span className="text-sauce-creamMuted">{resource.tag}</span></>}
          </p>
        </div>
        <ArrowUpRight
          size={14}
          className="self-start pt-1 text-sauce-creamMuted transition group-hover:text-sauce-gold"
        />
      </button>
    </li>
  );
}

/* ─── Defaults for newly-connected sources (mock) ─── */

function defaultMetricsFor(kind: ConnectionKind): ConnectionMetric[] {
  switch (kind) {
    case "x":
      return [
        { label: "Followers", value: "412", delta: "+18", trend: "up" },
        { label: "Impressions · 7d", value: "8.1k", delta: "+34%", trend: "up" },
        { label: "Replies · 7d", value: "26", delta: "+5", trend: "up" },
      ];
    case "youtube":
      return [
        { label: "Subscribers", value: "184", delta: "+12", trend: "up" },
        { label: "Watch hours · 30d", value: "92h", delta: "+18%", trend: "up" },
        { label: "Videos · 30d", value: "3", trend: "flat" },
      ];
    case "slack":
      return [
        { label: "Channels watched", value: "4", trend: "flat" },
        { label: "Messages · 7d", value: "212", delta: "+22", trend: "up" },
      ];
    case "linear":
      return [
        { label: "Issues shipped · 7d", value: "11", delta: "+3", trend: "up" },
        { label: "Cycle time", value: "1.4d", delta: "-12%", trend: "up" },
      ];
    case "gmail":
      return [
        { label: "Cold replies · 7d", value: "9", delta: "+4", trend: "up" },
        { label: "Reply rate", value: "18%", delta: "+3pt", trend: "up" },
      ];
    case "mcp":
      return [{ label: "Tools exposed", value: "0", trend: "flat" }];
    default:
      return [];
  }
}

function defaultFieldsFor(kind: ConnectionKind): string[] {
  switch (kind) {
    case "x":
      return ["Follower count", "Impressions", "Reply rate"];
    case "youtube":
      return ["Subscribers", "Watch hours", "Top videos"];
    case "slack":
      return ["Channel signal", "Message volume"];
    case "linear":
      return ["Issues shipped", "Cycle time", "Scope drift"];
    case "gmail":
      return ["Cold replies", "Reply rate", "Open rate"];
    case "mcp":
      return ["Custom tool list"];
    default:
      return [];
  }
}
