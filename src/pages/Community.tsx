import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Copy, Mail, Trophy, UserPlus, Users, X } from "lucide-react";
import type { CommunityPost, Invite, InviteKind, Mission, Snapshot } from "../types";
import { readStore, snapshot, updateStore } from "../utils/storage";
import { pad } from "../utils/format";
import { Shell } from "../components/Shell";
import { CommunitySkeleton } from "../components/Skeletons";
import { AttritionStrip } from "../components/AttritionStrip";

type FeedFilter = "wins" | "milestones" | "commitments" | "all";

export function Community() {
  const [state, setState] = useState<Snapshot>(snapshot);
  const [invites, setInvites] = useState<Invite[]>(() => readStore("thesauce_invites"));
  const [content, setContent] = useState("");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("wins");
  const [inviteOpen, setInviteOpen] = useState<InviteKind | null>(null);
  // TODO(api): mock skeleton hold — when wiring real API, only show <CommunitySkeleton /> if the request hasn't resolved within ~200ms (otherwise it flickers on fast responses).
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, []);

  const currentMission: Mission | undefined = state.missions.find((m) => m.mission_number === state.user.current_day);
  const dayNum = state.user.current_day;

  const wins = useMemo(() => state.community.filter((p) => p.type === "win"), [state.community]);
  const filteredFeed = useMemo(() => {
    if (feedFilter === "all") return state.community;
    if (feedFilter === "wins") return state.community.filter((p) => p.type === "win");
    if (feedFilter === "milestones") return state.community.filter((p) => p.type === "milestone");
    return state.community.filter((p) => p.type === "commitment");
  }, [state.community, feedFilter]);

  const cofounderInvite = invites.find((i) => i.kind === "cofounder" && i.status === "joined");
  const acceptedFriends = invites.filter((i) => i.kind === "friend" && i.status === "joined");

  function post() {
    if (!content.trim()) return;
    const newPost: CommunityPost = {
      id: Date.now(),
      name: state.user.community_anonymous ? "Anonymous" : state.user.name,
      city: state.user.city || "Building",
      type: "commitment",
      content,
      niche: state.user.niche,
      timestamp: "just now",
      reactions: { fire: 0, flex: 0, bolt: 0 },
    };
    updateStore("thesauce_community", [newPost, ...state.community]);
    setState(snapshot());
    setContent("");
  }

  function addInvite(kind: InviteKind, name: string, email: string) {
    const fresh: Invite = {
      id: `inv-${Date.now()}`,
      kind,
      name: name.trim(),
      email: email.trim(),
      status: "pending",
      invited_at: new Date().toISOString(),
    };
    const next = [fresh, ...invites];
    updateStore("thesauce_invites", next);
    setInvites(next);
    setInviteOpen(null);
  }

  function revokeInvite(id: string) {
    const next = invites.filter((i) => i.id !== id);
    updateStore("thesauce_invites", next);
    setInvites(next);
  }

  const folio = ["VOL. 01", `CREW 04`, `${state.community.length} DISPATCHES`];

  return (
    <Shell folio={folio} title="The crew." hideFolio>
      {loading ? <CommunitySkeleton /> : (
      <div className="flex flex-col gap-section animate-screen-enter">
        <p className="-mt-4 mb-[-32px] max-w-measure text-lede text-sauce-creamMuted md:-mt-14 md:mb-[-48px]">
          Build with the people you'd be embarrassed to quit in front of. Invite a cofounder, drag your friends in,
          and watch the rest of the crew ship in real time.
        </p>

        {/* ─── Invite & Team ─── */}
        <section className="flex flex-col gap-6">
          <header className="flex items-baseline justify-between border-b border-sauce-hairlineStrong pb-3">
            <h2 className="font-display text-[28px] font-medium tracking-editorial text-sauce-cream">Your team</h2>
            <span className="mono-folio text-sauce-creamMuted">
              {cofounderInvite ? "1 cofounder" : "Solo"} · {acceptedFriends.length} friend{acceptedFriends.length === 1 ? "" : "s"}
            </span>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InviteCard
              kind="cofounder"
              title="Bring your cofounder"
              caption="They join the same team. Shared roadmap, shared streak, shared receipts."
              cta={cofounderInvite ? `Locked in with ${cofounderInvite.name}` : "Invite cofounder"}
              accepted={!!cofounderInvite}
              icon={<Users size={14} strokeWidth={1.7} />}
              onOpen={() => setInviteOpen("cofounder")}
              disabled={!!cofounderInvite}
            />
            <InviteCard
              kind="friend"
              title="Pull in a friend"
              caption="Normal platform invite. Their own roadmap — but they'll see your wins and you'll see theirs."
              cta="Invite friend"
              accepted={false}
              icon={<UserPlus size={14} strokeWidth={1.7} />}
              onOpen={() => setInviteOpen("friend")}
            />
          </div>

          {invites.length > 0 && (
            <ul className="flex flex-col border-t border-sauce-hairline">
              {invites.map((inv) => (
                <li key={inv.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b border-sauce-hairline py-3">
                  <span className={`mono-folio rounded-full border px-2 py-1 ${inv.kind === "cofounder" ? "border-sauce-gold/40 text-sauce-gold" : "border-sauce-borderStrong text-sauce-creamMuted"}`}>
                    {inv.kind === "cofounder" ? "Cofounder" : "Friend"}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-lg tracking-editorial text-sauce-cream">{inv.name}</span>
                    <span className="mono-folio text-sauce-muted">{inv.email}</span>
                  </div>
                  <span className={`mono-folio ${inv.status === "joined" ? "text-sauce-gold" : inv.status === "pending" ? "text-sauce-creamMuted" : "text-sauce-muted"}`}>
                    {inv.status}
                  </span>
                  {inv.status === "pending" && (
                    <button onClick={() => revokeInvite(inv.id)} aria-label="Revoke invite" className="text-sauce-muted transition hover:text-sauce-gold">
                      <X size={14} strokeWidth={1.6} />
                    </button>
                  )}
                  {inv.status !== "pending" && <span aria-hidden />}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ─── Quit-rate motivation strip ─── */}
        {currentMission && <AttritionStrip dayNum={dayNum} />}

        {/* ─── Dispatch feed ─── */}
        <section className="flex flex-col gap-6">
          <header className="flex flex-col gap-3 border-b border-sauce-hairlineStrong pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-[28px] font-medium tracking-editorial text-sauce-cream">The dispatch board</h2>
              <span className="mono-folio text-sauce-creamMuted">
                Wins post automatically when you clear a shareable mission. Or file one by hand below.
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mono-folio">
              {(["wins", "milestones", "commitments", "all"] as FeedFilter[]).map((f) => {
                const active = feedFilter === f;
                const count = f === "all" ? state.community.length : f === "wins" ? wins.length : state.community.filter((p) => p.type === f.slice(0, -1)).length;
                return (
                  <button
                    key={f}
                    onClick={() => setFeedFilter(f)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition ${active ? "border-sauce-gold bg-sauce-gold/15 text-sauce-cream" : "border-sauce-borderStrong text-sauce-creamMuted hover:border-sauce-gold/40 hover:text-sauce-cream"}`}
                  >
                    <span className="capitalize">{f}</span>
                    <span className="tabular text-sauce-muted">{pad(count)}</span>
                  </button>
                );
              })}
            </div>
          </header>

          {/* Optional manual share */}
          <div className="grid grid-cols-1 gap-3 border border-sauce-hairlineStrong p-4 md:grid-cols-[1fr_auto] md:items-end md:gap-6">
            <div className="flex flex-col gap-2">
              <span className="mono-folio text-sauce-gold">File one manually</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="A win, a milestone, or a public commitment."
                rows={2}
                className="textarea-bare no-scrollbar !border-0 !py-2 !text-[15px]"
              />
            </div>
            <button onClick={post} disabled={!content.trim()} className="btn-gold disabled:opacity-50">
              Post
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Feed */}
          <ol className="flex flex-col">
            {filteredFeed.length === 0 && (
              <li className="border-y border-sauce-hairline py-12 text-center mono-folio italic text-sauce-creamMuted">
                Nothing in this lane yet. Be the first.
              </li>
            )}
            {filteredFeed.map((p) => (
              <li key={p.id} className="grid grid-cols-1 gap-3 border-t border-sauce-hairline py-6 last:border-b sm:grid-cols-[180px_1fr] sm:gap-6">
                <div className="flex flex-col gap-1">
                  <span className="font-display text-lg font-medium tracking-editorial text-sauce-cream">{p.name}</span>
                  <span className="mono-folio text-sauce-creamMuted">{p.city} · {p.niche}</span>
                  <span className="mono-folio text-sauce-muted">{p.timestamp}</span>
                  <span className="mt-1 mono-folio inline-flex items-center gap-1.5 text-sauce-gold">
                    {p.type === "win" && <Trophy size={11} strokeWidth={1.8} />}
                    {p.type}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <p className="font-body text-body leading-[1.6] text-sauce-cream">{p.content}</p>
                  <div className="flex items-center gap-5 mono-folio text-sauce-creamMuted">
                    <span>Fire <span className="text-sauce-cream tabular">{pad(p.reactions.fire)}</span></span>
                    <span>Flex <span className="text-sauce-cream tabular">{pad(p.reactions.flex)}</span></span>
                    <span>Bolt <span className="text-sauce-cream tabular">{pad(p.reactions.bolt)}</span></span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
      )}

      <AnimatePresence>
        {inviteOpen && (
          <InviteSheet
            kind={inviteOpen}
            onClose={() => setInviteOpen(null)}
            onSend={addInvite}
          />
        )}
      </AnimatePresence>
    </Shell>
  );
}

interface InviteCardProps {
  kind: InviteKind;
  title: string;
  caption: string;
  cta: string;
  accepted: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  onOpen: () => void;
}

function InviteCard({ kind, title, caption, cta, accepted, disabled, icon, onOpen }: InviteCardProps) {
  return (
    <div className={`group flex flex-col gap-4 border ${kind === "cofounder" ? "border-sauce-gold/35" : "border-sauce-hairlineStrong"} bg-sauce-ink/40 p-5`}>
      <div className="flex items-center justify-between">
        <span className={`mono-folio inline-flex items-center gap-1.5 ${kind === "cofounder" ? "text-sauce-gold" : "text-sauce-creamMuted"}`}>
          {icon}
          {kind === "cofounder" ? "Same team" : "Platform invite"}
        </span>
        {accepted && <Check size={14} strokeWidth={1.8} className="text-sauce-gold" />}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-[22px] font-medium leading-[1.1] tracking-editorial text-sauce-cream">{title}</h3>
        <p className="font-body text-[14px] leading-[1.55] text-sauce-creamMuted">{caption}</p>
      </div>
      <button
        onClick={onOpen}
        disabled={disabled}
        className={`mt-auto inline-flex items-center justify-between border-t border-sauce-hairline pt-3 text-left mono-folio transition ${disabled ? "text-sauce-muted" : kind === "cofounder" ? "text-sauce-gold hover:text-sauce-goldBright" : "text-sauce-cream hover:text-sauce-gold"}`}
      >
        <span>{cta}</span>
        {!disabled && <ArrowRight size={12} strokeWidth={1.8} />}
      </button>
    </div>
  );
}

interface InviteSheetProps {
  kind: InviteKind;
  onClose: () => void;
  onSend: (kind: InviteKind, name: string, email: string) => void;
}

function InviteSheet({ kind, onClose, onSend }: InviteSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const link = `https://thesauce.app/i/${kind}-${Math.random().toString(36).slice(2, 9)}`;

  function copyLink() {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(link).catch(() => undefined);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function send() {
    if (!name.trim() || !email.trim()) return;
    onSend(kind, name, email);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-sauce-black/80 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.26, ease: [0.2, 0.7, 0.2, 1] }}
        className="w-full max-w-[520px] border border-sauce-gold/35 bg-sauce-ink p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="mono-folio text-sauce-gold">
            {kind === "cofounder" ? "Invite cofounder · same team" : "Invite friend · platform"}
          </span>
          <button onClick={onClose} aria-label="Close" className="text-sauce-muted transition hover:text-sauce-cream">
            <X size={16} strokeWidth={1.6} />
          </button>
        </div>

        <h3 className="font-display text-[clamp(26px,3.4vw,32px)] font-medium leading-[1.1] tracking-editorial text-sauce-cream">
          {kind === "cofounder" ? "Lock in your other half." : "Drag a friend into the work."}
        </h3>
        <p className="mt-2 font-body text-[14px] text-sauce-creamMuted">
          {kind === "cofounder"
            ? "Cofounders share the roadmap, the streak, and the receipts. Pick carefully."
            : "Friends keep their own roadmap. They just see your wins and you'll see theirs — accountability without overlap."}
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="mono-folio text-sauce-creamMuted">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={kind === "cofounder" ? "Your cofounder's name" : "Your friend's name"}
              className="input !py-2 !text-[15px]"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="mono-folio text-sauce-creamMuted">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="them@example.com"
              className="input !py-2 !text-[15px]"
            />
          </label>

          <div className="flex flex-col gap-2 border-t border-sauce-hairline pt-4">
            <span className="mono-folio text-sauce-muted">Or send a link</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate border border-sauce-hairlineStrong bg-sauce-surface/60 px-3 py-2 font-mono text-[12px] text-sauce-creamMuted">
                {link}
              </code>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-2 border border-sauce-borderStrong px-3 py-2 mono-folio text-sauce-cream transition hover:border-sauce-gold hover:text-sauce-gold"
              >
                {copied ? <Check size={12} strokeWidth={1.8} /> : <Copy size={12} strokeWidth={1.8} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-sauce-hairlineStrong pt-4">
          <button onClick={onClose} className="mono-folio text-sauce-creamMuted transition hover:text-sauce-cream">
            Cancel
          </button>
          <button onClick={send} disabled={!name.trim() || !email.trim()} className="btn-gold disabled:opacity-50">
            <Mail size={12} strokeWidth={1.8} />
            Send invite
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

