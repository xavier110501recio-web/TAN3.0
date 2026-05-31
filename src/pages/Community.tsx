import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { CommunityPost, Snapshot } from "../types";
import { snapshot, updateStore } from "../utils/storage";
import { pad } from "../utils/format";
import { Shell } from "../components/Shell";

export function Community() {
  const [state, setState] = useState<Snapshot>(snapshot);
  const [content, setContent] = useState("");

  function post() {
    if (!content.trim()) return;
    const newPost: CommunityPost = {
      id: Date.now(),
      name: state.user.community_anonymous ? "Anonymous" : state.user.name,
      city: state.user.city || "Building",
      type: "commitment",
      content,
      niche: state.user.niche,
      timestamp: "now",
      reactions: { fire: 0, flex: 0, bolt: 0 },
    };
    updateStore("thesauce_community", [newPost, ...state.community]);
    setState(snapshot());
    setContent("");
  }

  const folio = ["DISPATCHES", `${state.community.length} ENTRIES`];

  return (
    <Shell folio={folio} title="Dispatches.">
      <div className="flex flex-col gap-12 animate-screen-enter">
        <p className="max-w-measure text-lede text-sauce-creamMuted">
          Anonymous wins, milestones, and commitments. Honest field reports from the rest of the crew.
        </p>

        {/* Submit */}
        <section className="border-y border-sauce-hairlineStrong py-6">
          <p className="mono-folio mb-3 text-sauce-gold">File a dispatch</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="A win, a milestone, or a public commitment."
            rows={3}
            className="textarea-bare no-scrollbar !border-0 !pt-0"
          />
          <div className="mt-3 flex justify-end">
            <button onClick={post} className="btn-gold">
              Post
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        </section>

        {/* Feed — editorial entries */}
        <ol className="flex flex-col">
          {state.community.map((p) => (
            <li key={p.id} className="grid grid-cols-1 gap-3 border-t border-sauce-hairline py-6 last:border-b sm:grid-cols-[180px_1fr] sm:gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-display text-lg font-medium tracking-editorial text-sauce-cream">{p.name}</span>
                <span className="mono-folio text-sauce-creamMuted">{p.city} · {p.niche}</span>
                <span className="mono-folio text-sauce-muted">{p.timestamp}</span>
                <span className="mt-1 mono-folio text-sauce-gold">{p.type}</span>
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
      </div>
    </Shell>
  );
}
