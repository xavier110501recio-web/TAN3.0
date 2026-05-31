import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BadgeDollarSign, Bot, Check, Flame, Home, Lock, Map, MessageCircle, Send, Sparkles, Trophy, Users, Zap } from "lucide-react";
import "./styles.css";
import { MISSIONS } from "./data/missions";
import { COMMUNITY_SEEDS } from "./data/communitySeeds";
import { generateAlternativeMission, generateCoachResponse, generateMissionDebrief, generatePlanSummary } from "./utils/MockCoach";
import { freshUserStores, initStorage, readStore, resetDemo, updateStore } from "./utils/storage";

const nav = [
  ["/dashboard", Home, "Home"],
  ["/missions", Map, "Map"],
  ["/coach", Bot, "Coach"],
  ["/community", Users, "Crew"],
];

function App() {
  useEffect(() => initStorage(), []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing preview />} />
        <Route path="/start" element={<Start />} />
        <Route path="/generating" element={<Generating />} />
        <Route path="/dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="/checkin" element={<Guard><CheckIn /></Guard>} />
        <Route path="/missions" element={<Guard><Missions /></Guard>} />
        <Route path="/coach" element={<Guard><Coach /></Guard>} />
        <Route path="/community" element={<Guard><Community /></Guard>} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function Guard({ children }) {
  const user = readStore("thesauce_user");
  if (!user) return <Navigate to="/" replace />;
  if (!user.onboarding_complete) return <Navigate to="/start" replace />;
  if (!user.is_pro && user.current_day > 10) return <Navigate to="/upgrade" replace />;
  return children;
}

function Shell({ children, title }) {
  return (
    <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col border-x border-sauce-border bg-sauce-black/95">
        <header className="sticky top-0 z-20 border-b border-sauce-border bg-sauce-black/90 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sauce-gold">TheSauce</p>
              <h1 className="font-heading text-3xl font-bold leading-none">{title}</h1>
            </div>
            <CoachMark />
          </div>
        </header>
        <section className="flex-1 px-5 py-5">{children}</section>
        <BottomNav />
      </div>
    </main>
  );
}

function BottomNav() {
  const location = useLocation();
  return (
    <nav className="sticky bottom-0 grid grid-cols-4 border-t border-sauce-border bg-sauce-black/95 px-2 py-2 backdrop-blur">
      {nav.map(([to, Icon, label]) => (
        <a key={to} href={to} className={`flex flex-col items-center gap-1 rounded-md py-2 text-[11px] font-medium transition ${location.pathname === to ? "border border-sauce-gold/30 bg-sauce-gold/10 text-sauce-gold" : "text-sauce-muted hover:bg-sauce-surface hover:text-sauce-gold"}`}>
          <Icon size={18} />
          {label}
        </a>
      ))}
    </nav>
  );
}

function CoachMark({ big = false }) {
  return <div className={`${big ? "h-20 w-20" : "h-11 w-11"} grid place-items-center rounded-full border border-sauce-gold/40 bg-sauce-gold/10 text-sauce-gold shadow-[0_0_35px_rgba(200,164,90,.16)]`}><Zap size={big ? 34 : 20} /></div>;
}

function Landing({ preview = false }) {
  const navigate = useNavigate();
  const user = readStore("thesauce_user");
  const [heroIdea, setHeroIdea] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "1") {
      resetDemo();
      navigate("/", { replace: true });
      return;
    }
    if (!preview && user?.onboarding_complete) navigate("/dashboard", { replace: true });
  }, []);
  const live = ["Maya finished Mission 4", "Tyler made his first $47", "Jordan posted before overthinking", "Priya booked a client"];
  const [liveIndex, setLiveIndex] = useState(0);
  const [showActivity, setShowActivity] = useState(false);
  useEffect(() => {
    const showTimer = setInterval(() => {
      setShowActivity(true);
      setTimeout(() => {
        setShowActivity(false);
        setLiveIndex((index) => (index + 1) % live.length);
      }, 2100);
    }, 4200);
    const first = setTimeout(() => setShowActivity(true), 700);
    const firstHide = setTimeout(() => {
      setShowActivity(false);
      setLiveIndex((index) => (index + 1) % live.length);
    }, 2800);
    return () => {
      clearInterval(showTimer);
      clearTimeout(first);
      clearTimeout(firstHide);
    };
  }, []);
  function generateFromHero() {
    const raw = heroIdea.trim();
    if (raw.length < 20) {
      navigate("/start", { state: { rawDump: heroIdea } });
      return;
    }
    const now = new Date().toISOString();
    freshUserStores();
    updateStore("thesauce_user", {
      name: "Builder",
      email: "",
      city: "",
      raw_dump: raw,
      goal: raw.slice(0, 160),
      idea_type: "service",
      niche: inferNiche(raw),
      blockers: ["I don't know where to start"],
      daily_time: "30 minutes",
      budget: "$0",
      current_situation: "Building on the side",
      existing_skills: "None stated",
      ninety_day_target: "Make my first dollar outside my job",
      current_day: 1,
      current_zone: 1,
      is_pro: false,
      execution_score: 0,
      onboarding_complete: true,
      plan_summary_seen: false,
      community_anonymous: false,
      joined_at: now,
    });
    navigate("/generating");
  }
  return (
    <main className="min-h-screen overflow-hidden bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-sauce-gold">TheSauce</p>
          <button onClick={() => { resetDemo(); window.location.reload(); }} className="rounded border border-sauce-border px-2 py-1 text-xs text-sauce-muted">Reset</button>
        </div>
        <section className="flex min-h-[calc(100vh-9rem)] flex-col justify-center py-10">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
            <CoachMark big />
            <div>
              <h1 className="font-heading text-6xl font-bold leading-[.9]">Never Be Directionless Again.</h1>
              <p className="mt-5 text-lg leading-7 text-sauce-muted">Get a clear business roadmap personalized to your idea, your schedule and the life you actually live.</p>
            </div>
            <textarea
              value={heroIdea}
              onChange={(e) => setHeroIdea(e.target.value)}
              placeholder="Describe your idea, your day-to-day life, what's been stopping you. Write freely - the more real this is, the better your plan."
              className="no-scrollbar h-36 w-full resize-none overflow-hidden rounded-md border border-sauce-border bg-sauce-surface p-4 text-base leading-6 text-sauce-cream outline-none placeholder:text-sauce-muted focus:border-sauce-gold"
            />
            <div>
              <button onClick={generateFromHero} className="btn-gold w-full px-5 py-4 text-base">Show me what to do <ArrowRight className="inline" size={18} /></button>
              <p className="mt-3 text-center text-xs font-medium text-sauce-muted">No payment required. Takes less than 90 seconds.</p>
            </div>
          </motion.div>
        </section>
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-40 mx-auto h-16 w-full max-w-md px-6">
          <AnimatePresence>
            {showActivity && (
              <motion.div
                key={`${live[liveIndex]}-${liveIndex}`}
                initial={{ opacity: 0, y: 34, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="rounded-md border border-sauce-gold/30 bg-sauce-surface px-4 py-3 text-center text-sm font-medium text-sauce-cream shadow-[0_18px_50px_rgba(0,0,0,.5)]"
              >
                {live[liveIndex]}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <section className="border-t border-sauce-border py-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sauce-gold">How it works</p>
          <h2 className="mt-3 font-heading text-4xl font-bold leading-none">One clear move every day.</h2>
          <div className="mt-6 grid gap-3">
            {[
              ["Dump the idea", "Say what you are building, what blocks you, and how much time you actually have."],
              ["Get the map", "TheSauce turns that into a 30-day execution path with market-facing missions."],
              ["Report back", "Check in after each mission. The coach adjusts the next move around what happened."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-md border border-sauce-border bg-sauce-surface p-4">
                <h3 className="font-heading text-2xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-sauce-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="border-t border-sauce-border py-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sauce-gold">Built for action</p>
          <h2 className="mt-3 font-heading text-4xl font-bold leading-none">No vague plans. No fake progress.</h2>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {["Daily missions", "XP and streaks", "Coach chat", "Community posts"].map((item) => (
              <div key={item} className="rounded-md border border-sauce-border bg-sauce-surface p-4 text-sm font-semibold">{item}</div>
            ))}
          </div>
          <button onClick={generateFromHero} className="btn-gold mt-6 w-full px-5 py-4 text-base">Show me what to do <ArrowRight className="inline" size={18} /></button>
        </section>
      </div>
    </main>
  );
}

function Start() {
  const navigate = useNavigate();
  const locationState = window.history.state?.usr || {};
  const [raw, setRaw] = useState(locationState.rawDump || "");
  const [form, setForm] = useState({ name: "", email: "", city: "" });
  const startReady = raw.trim().length >= 3 && form.name.trim() && form.email.trim() && form.city.trim();
  function submit() {
    if (!startReady) return;
    const now = new Date().toISOString();
    freshUserStores();
    updateStore("thesauce_user", {
      ...form, raw_dump: raw, goal: raw.slice(0, 160), idea_type: "service", niche: inferNiche(raw), blockers: ["I don't know where to start"],
      daily_time: "30 minutes", budget: "$0", ninety_day_target: "Make my first dollar outside my job",
      current_situation: "Building on the side", existing_skills: "None stated", current_day: 1, current_zone: 1, is_pro: false,
      execution_score: 0, onboarding_complete: true, plan_summary_seen: false, community_anonymous: false, joined_at: now,
    });
    navigate("/generating");
  }
  return (
    <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-7">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-sauce-gold">90 second dump</p>
        <h1 className="mt-3 font-heading text-5xl font-bold leading-none">Tell the truth about the idea.</h1>
        <textarea value={raw} onChange={e => setRaw(e.target.value)} placeholder="What are you trying to build? Who is it for? What keeps stopping you?" className="mt-6 h-44 resize-none rounded-md border border-sauce-border bg-sauce-surface p-4 outline-none focus:border-sauce-gold" />
        <div className="mt-4 grid gap-3">
          {["name", "email", "city"].map(k => <input key={k} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={k[0].toUpperCase() + k.slice(1)} className="input" />)}
        </div>
        <button disabled={!startReady} onClick={submit} className="btn-gold mt-5 px-5 py-4">Build my roadmap <ArrowRight className="inline" size={18} /></button>
        <p className="mt-3 text-center text-xs leading-5 text-sauce-muted">Your answers stay on this device for the MVP demo. No payment info, no public posting, no external services.</p>
      </div>
    </main>
  );
}

function Generating() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const lines = ["Reading your constraints", "Mapping first market contact", "Cutting the unnecessary", "Building Mission 1"];
  useEffect(() => {
    const t = setInterval(() => setStep(s => s + 1), 900);
    const n = setTimeout(() => navigate("/dashboard"), 3900);
    return () => { clearInterval(t); clearTimeout(n); };
  }, []);
  return <main className="grid min-h-screen place-items-center bg-sauce-black text-sauce-cream noise"><div className="text-center"><CoachMark big /><p className="mt-8 font-heading text-4xl font-bold">Building the map.</p><p className="mt-3 font-mono text-xs uppercase tracking-[.28em] text-sauce-gold">{lines[step % lines.length]}</p><Typing /></div></main>;
}

function Dashboard() {
  const [state, setState] = useState(snapshot());
  const [showPlan, setShowPlan] = useState(!state.user.plan_summary_seen);
  const mission = state.missions.find(m => m.mission_number === state.user.current_day) || state.missions.at(-1);
  const revenueWin = state.checkins.some(c => /sale|sold|paid|customer|client|dollar|revenue|\$/i.test(c.note || ""));
  return (
    <Shell title={`Day ${state.user.current_day}`}>
      {showPlan && <PlanModal user={state.user} onClose={() => { updateStore("thesauce_user", { ...state.user, plan_summary_seen: true }); setShowPlan(false); setState(snapshot()); }} />}
      {revenueWin && state.user.first_dollar_badge && <Celebration user={state.user} />}
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat icon={Flame} label="Streak" value={state.streak.count} />
          <Stat icon={Trophy} label="XP" value={state.user.execution_score} />
          <Stat icon={Map} label="Zone" value={state.user.current_zone} />
        </div>
        <MissionCard mission={mission} state={state} onStateChange={() => setState(snapshot())} />
        <section className="rounded-md border border-sauce-border bg-sauce-surface p-4">
          <p className="font-mono text-[10px] uppercase tracking-[.24em] text-sauce-gold">Skills</p>
          {Object.entries(state.skills).map(([k, v]) => <div key={k} className="mt-3"><div className="mb-1 flex justify-between text-xs capitalize text-sauce-muted"><span>{k.replace("_", " ")}</span><span>{v}/100</span></div><div className="h-2 rounded-full bg-sauce-border"><div className="h-2 rounded-full bg-sauce-gold" style={{ width: `${v}%` }} /></div></div>)}
        </section>
      </div>
    </Shell>
  );
}

function CheckIn() {
  const navigate = useNavigate();
  const [outcome, setOutcome] = useState("completed");
  const [note, setNote] = useState("");
  const [mood, setMood] = useState(4);
  const [done, setDone] = useState(null);
  const state = snapshot();
  const mission = state.missions.find(m => m.mission_number === state.user.current_day);
  function submit() {
    const result = generateMissionDebrief(outcome, note, state.user.current_day, state.user);
    const today = new Date().toISOString().slice(0, 10);
    const checkin = { date: new Date().toISOString(), mission_number: state.user.current_day, outcome, obstacle: outcome === "completed" ? null : note, note, mood };
    let user = { ...state.user };
    let missions = state.missions;
    let skills = { ...state.skills };
    let streak = { ...state.streak };
    if (outcome !== "partial") {
      missions = missions.map(m => m.mission_number === mission.mission_number ? { ...m, completed: true, completed_at: new Date().toISOString() } : m);
      skills[mission.skill] = Math.min(100, (skills[mission.skill] || 0) + 8);
      user.execution_score += mission.xp;
      user.current_day += 1;
      user.current_zone = user.current_day > 20 ? 3 : user.current_day > 10 ? 2 : 1;
      if (/sale|sold|paid|customer|client|dollar|revenue|\$/i.test(note)) user.first_dollar_badge = true;
      if (streak.last_checkin_date !== today) { streak.count += 1; streak.last_checkin_date = today; streak.longest = Math.max(streak.longest, streak.count); }
    }
    updateStore("thesauce_user", user); updateStore("thesauce_missions", missions); updateStore("thesauce_skills", skills); updateStore("thesauce_streak", streak); updateStore("thesauce_checkins", [...state.checkins, checkin]);
    setDone(result);
  }
  if (done) return <Shell title="Debrief"><div className="grid gap-5"><CoachMark big /><div className="rounded-md border border-sauce-gold/30 bg-sauce-gold/10 p-4"><p className="leading-7">{done.coachMessage}</p></div><div className="rounded-md border border-sauce-border bg-sauce-surface p-4"><p className="font-mono text-xs uppercase tracking-[.22em] text-sauce-gold">XP earned</p><p className="mt-2 font-heading text-5xl font-bold">+{done.xpEarned}</p></div><button onClick={() => navigate("/dashboard")} className="btn-gold px-5 py-4">Back to dashboard <ArrowRight className="inline" size={18} /></button></div></Shell>;
  return (
    <Shell title="Check in">
      <div className="grid gap-4">
        <p className="text-sauce-muted">Report what happened. The mission is only complete after this.</p>
        <div className="grid gap-2">{[["completed", "Completed"], ["completed_with_issue", "Completed, hit friction"], ["partial", "Partial"]].map(([v, l]) => <button key={v} onClick={() => setOutcome(v)} className={`rounded-md border px-4 py-3 text-left ${outcome === v ? "border-sauce-gold bg-sauce-gold/10 text-sauce-gold" : "border-sauce-border bg-sauce-surface text-sauce-muted"}`}>{l}</button>)}</div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What happened? Mention wins, friction, replies, revenue, or what blocked you." className="h-36 resize-none rounded-md border border-sauce-border bg-sauce-surface p-4 outline-none focus:border-sauce-gold" />
        <label className="text-sm text-sauce-muted">Mood: {mood}</label><input type="range" min="1" max="5" value={mood} onChange={e => setMood(Number(e.target.value))} />
        <button onClick={submit} className="btn-gold px-5 py-4">Submit debrief</button>
      </div>
    </Shell>
  );
}

function Missions() {
  const { user, missions } = snapshot();
  return <Shell title="Mission Map"><div className="grid gap-3">{missions.map(m => <div key={m.mission_number} className={`rounded-md border p-4 ${m.completed ? "border-sauce-success bg-sauce-success/10" : m.mission_number <= user.current_day ? "border-sauce-gold/40 bg-sauce-surface" : "border-sauce-border bg-transparent opacity-55"}`}><div className="flex items-center justify-between"><p className="font-mono text-xs text-sauce-gold">Mission {m.mission_number}</p>{m.mission_number > user.current_day && <Lock size={15} />}{m.completed && <Check size={15} />}</div><h2 className="mt-2 font-heading text-2xl font-bold">{m.title}</h2><p className="mt-2 text-sm leading-6 text-sauce-muted">{m.task}</p><p className="mt-3 text-xs uppercase tracking-[.18em] text-sauce-gold">{m.skill.replace("_", " ")} +{m.xp} XP</p></div>)}</div></Shell>;
}

function Coach() {
  const [state, setState] = useState(snapshot());
  const [text, setText] = useState("");
  function send() {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text, timestamp: new Date().toISOString() };
    const coach = generateCoachResponse(text, state.chat, state.user).response;
    const history = [...state.chat, userMsg, { role: "coach", content: coach, timestamp: new Date().toISOString() }];
    updateStore("thesauce_chat_history", history); setState(snapshot()); setText("");
  }
  return <Shell title="Coach"><div className="flex min-h-[70vh] flex-col"><div className="flex-1 space-y-3">{state.chat.map((m, i) => <div key={i} className={`max-w-[88%] rounded-md border p-3 text-sm leading-6 ${m.role === "user" ? "ml-auto border-sauce-gold/30 bg-sauce-gold/10" : "border-sauce-border bg-sauce-surface"}`}>{m.content}</div>)}</div><div className="mt-4 flex gap-2"><input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Tell the coach what's in the way." className="input flex-1" /><button onClick={send} className="btn-gold px-4"><Send size={18} /></button></div></div></Shell>;
}

function Community() {
  const [state, setState] = useState(snapshot());
  const [content, setContent] = useState("");
  function post() {
    if (!content.trim()) return;
    const next = [{ id: Date.now(), name: state.user.community_anonymous ? "Anonymous" : state.user.name, city: state.user.city || "Building", type: "commitment", content, niche: state.user.niche, timestamp: "now", reactions: { fire: 0, flex: 0, bolt: 0 } }, ...state.community];
    updateStore("thesauce_community", next); setState(snapshot()); setContent("");
  }
  return <Shell title="Community"><div className="grid gap-4"><div className="rounded-md border border-sauce-border bg-sauce-surface p-3"><textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Post a win, milestone, or commitment." className="h-24 w-full resize-none bg-transparent outline-none" /><button onClick={post} className="btn-gold mt-2 px-4 py-2">Post</button></div>{state.community.map(p => <article key={p.id} className="rounded-md border border-sauce-border bg-sauce-surface p-4"><div className="flex justify-between"><p className="font-semibold">{p.name} <span className="font-normal text-sauce-muted">/ {p.city}</span></p><p className="font-mono text-xs text-sauce-gold">{p.type}</p></div><p className="mt-3 leading-6">{p.content}</p><div className="mt-3 flex gap-3 text-sm text-sauce-muted"><span>🔥 {p.reactions.fire}</span><span>💪 {p.reactions.flex}</span><span>⚡ {p.reactions.bolt}</span></div></article>)}</div></Shell>;
}

function Upgrade() {
  const navigate = useNavigate();
  const user = readStore("thesauce_user");
  function unlock() { updateStore("thesauce_user", { ...user, is_pro: true }); navigate("/dashboard"); }
  return <main className="grid min-h-screen place-items-center bg-sauce-black px-5 text-sauce-cream noise"><section className="w-full max-w-md"><CoachMark big /><h1 className="mt-8 font-heading text-5xl font-bold leading-none">Zone 2 is ready. Are you?</h1><p className="mt-4 text-sauce-muted">The free sprint got you through Foundation. Unlock the next zone and keep the market-facing work moving.</p><div className="mt-6 grid gap-3"><div className="rounded-md border border-sauce-gold/40 bg-sauce-gold/10 p-4"><BadgeDollarSign className="text-sauce-gold" /><h2 className="mt-3 font-heading text-3xl">Pro</h2><p className="text-sauce-muted">Zones 2 and 3, coach memory, community posting, and full mission map.</p></div><button onClick={unlock} className="btn-gold px-5 py-4">Unlock Zone 2 <ArrowRight className="inline" size={18} /></button></div></section></main>;
}

function MissionCard({ mission, state, onStateChange, compact = false, locked = false, message = null }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState("normal");
  const [localMission, setLocalMission] = useState(mission);
  const [doneMessage, setDoneMessage] = useState(message);
  const [celebrating, setCelebrating] = useState(false);
  const [oldXp, setOldXp] = useState(state?.user?.execution_score || 0);
  const [newXp, setNewXp] = useState(state?.user?.execution_score || 0);
  const [oldStreak, setOldStreak] = useState(state?.streak?.count || 0);
  const [newStreak, setNewStreak] = useState(state?.streak?.count || 0);
  const user = state?.user || readStore("thesauce_user");
  const checkins = state?.checkins || readStore("thesauce_checkins");
  const adjustedCount = checkins.filter((c) => c.mission_number === localMission.mission_number && c.outcome === "adjusted").length;
  const options = [
    ["done", "✅ Done"],
    ["too_hard", "😕 Too hard"],
    ...(adjustedCount >= 2 ? [] : [["adjust", "🔄 Adjust step"]]),
    ["need_help", "💬 Need help"],
  ];

  function submit() {
    if (selected === "done") completeMission();
    if (selected === "too_hard") showSimplified();
    if (selected === "adjust") adjustMission();
    if (selected === "need_help") openCoach();
  }

  function saveCheckin(outcome) {
    const next = [...readStore("thesauce_checkins"), {
      date: new Date().toISOString(),
      mission_number: localMission.mission_number,
      outcome,
      obstacle: outcome === "completed" ? null : note || null,
      note: note || null,
      mood: null,
    }];
    updateStore("thesauce_checkins", next);
    return next;
  }

  function completeMission() {
    const snap = snapshot();
    const current = localMission;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();
    let streak = { ...snap.streak };
    const userNext = { ...snap.user };
    const skills = { ...snap.skills };
    const missions = snap.missions.map((m) => m.mission_number === current.mission_number ? { ...current, completed: true, completed_at: now } : m);
    setOldXp(userNext.execution_score);
    setOldStreak(streak.count);
    skills[current.skill] = Math.min(100, (skills[current.skill] || 0) + 8);
    userNext.execution_score += current.xp;
    userNext.current_day += 1;
    userNext.current_zone = userNext.current_day > 20 ? 3 : userNext.current_day > 10 ? 2 : 1;
    if (/sale|sold|paid|customer|client|dollar|revenue|\$/i.test(note)) userNext.first_dollar_badge = true;
    if (streak.last_checkin_date !== today) {
      streak.count += 1;
      streak.last_checkin_date = today;
      streak.longest = Math.max(streak.longest, streak.count);
    }
    updateStore("thesauce_user", userNext);
    updateStore("thesauce_missions", missions);
    updateStore("thesauce_skills", skills);
    updateStore("thesauce_streak", streak);
    saveCheckin("completed");
    setNewXp(userNext.execution_score);
    setNewStreak(streak.count);
    setCelebrating(true);
    setDoneMessage(randomDone(streak.count));
    setSelected(null);
    onStateChange?.();
  }

  function showSimplified() {
    saveCheckin("too_hard");
    setDoneMessage("Too hard usually means too vague. Here is a smaller version of the same task:");
    setLocalMission({ ...localMission, task: localMission.simplified_task || localMission.task, simplified: true });
    setSelected(null);
    onStateChange?.();
  }

  function adjustMission() {
    saveCheckin("adjusted");
    setMode("loading");
    setTimeout(() => {
      const snap = snapshot();
      const alternative = generateAlternativeMission(localMission, snap.user, note);
      const missions = snap.missions.map((m) => m.mission_number === localMission.mission_number ? alternative : m);
      updateStore("thesauce_missions", missions);
      setLocalMission(alternative);
      setDoneMessage("Different angle. Same direction.");
      setMode("normal");
      setSelected(null);
      onStateChange?.();
    }, 1500);
  }

  function openCoach() {
    const snap = snapshot();
    const userMessage = { role: "user", content: `I need help with: ${localMission.title}`, timestamp: new Date().toISOString() };
    const coachMessage = {
      role: "coach",
      content: generateCoachResponse(`${userMessage.content}. ${note}`, snap.chat, { ...snap.user, current_mission_title: localMission.title }).response,
      timestamp: new Date().toISOString(),
    };
    updateStore("thesauce_chat_history", [...snap.chat, userMessage, coachMessage]);
    saveCheckin("need_help");
    navigate("/coach");
  }

  if (mode === "loading") {
    return <section className="rounded-md border border-sauce-gold/40 bg-sauce-surface p-5 text-center"><p className="text-sm italic text-sauce-muted">Finding a better fit...</p><Typing /></section>;
  }

  const nextMission = state?.missions?.find((m) => m.mission_number === localMission.mission_number + 1);
  const previewMission = state?.missions?.find((m) => m.mission_number === localMission.mission_number + 2);

  if (celebrating) {
    return (
      <section className="relative overflow-hidden rounded-md border border-sauce-success bg-sauce-surface p-5 animate-success-flash">
        <Confetti />
        <p className="text-sm italic leading-6 text-sauce-muted">{doneMessage}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded border border-sauce-border p-3"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-sauce-muted">XP</p><p className="font-mono text-xl text-sauce-gold">{oldXp} → {newXp}</p></div>
          <div className="rounded border border-sauce-border p-3"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-sauce-muted">Streak</p><p className="font-mono text-xl text-sauce-gold">{oldStreak} → {newStreak}</p></div>
        </div>
        {nextMission && <div className="mt-5"><MissionCard mission={nextMission} state={snapshot()} onStateChange={onStateChange} /></div>}
        {previewMission && <div className="mt-4 opacity-50 blur-[1px]"><MissionCard mission={previewMission} state={snapshot()} compact locked /></div>}
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden rounded-md border p-5 shadow-[0_0_45px_rgba(200,164,90,.08)] ${celebrating ? "animate-success-flash border-sauce-success" : locked ? "border-sauce-border bg-sauce-surface/40 blur-[1px]" : "border-sauce-gold/40 bg-sauce-surface"}`}>
      {doneMessage && <p className="mb-4 text-sm italic leading-6 text-sauce-muted">{doneMessage}</p>}
      <p className="font-mono text-xs uppercase tracking-[.24em] text-sauce-gold">Mission {localMission.mission_number}</p>
      <h2 className={`${compact ? "text-2xl" : "text-4xl"} mt-2 font-heading font-bold leading-none`}>{localMission.title}</h2>
      <p className="mt-4 leading-7">{personalize(localMission.task, user)}</p>
      <p className="mt-4 text-sm leading-6 text-sauce-muted">{personalize(localMission.why, user)}</p>
      <div className="mt-4 flex items-center justify-between border-t border-sauce-border pt-4"><span className="text-xs uppercase tracking-[.2em] text-sauce-gold">{localMission.skill.replace("_", " ")}</span><span className="font-mono text-sm">+{localMission.xp} XP</span></div>
      {!compact && !locked && !celebrating && adjustedCount >= 2 && <p className="mt-4 rounded border border-sauce-gold/30 bg-sauce-gold/10 p-3 text-sm italic text-sauce-muted">You have tried two versions of this. Sometimes the resistance is the point. Try completing this one.</p>}
      {!compact && !locked && !celebrating && <ResponseControls options={options} selected={selected} setSelected={setSelected} note={note} setNote={setNote} submit={submit} />}
    </section>
  );
}

function ResponseControls({ options, selected, setSelected, note, setNote, submit }) {
  return (
    <div className="mt-5">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {options.map(([value, label]) => (
          <button key={value} onClick={() => setSelected(value)} className={`min-h-[52px] rounded-md border px-3 text-sm font-medium text-sauce-cream transition ${buttonState(value, selected)}`}>{label}</button>
        ))}
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={1} placeholder="What happened? (optional)" className="no-scrollbar mt-3 max-h-20 min-h-9 w-full resize-none overflow-hidden rounded border border-sauce-border bg-sauce-surface2 px-3 py-2 text-[13px] text-sauce-cream outline-none placeholder:text-sauce-muted focus:border-sauce-gold" />
      <AnimatePresence>{selected && <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: .2 }} onClick={submit} className="btn-gold mt-3 w-full px-5 py-4">Submit <ArrowRight className="inline" size={18} /></motion.button>}</AnimatePresence>
    </div>
  );
}

function buttonState(value, selected) {
  if (value !== selected) return "border-sauce-border bg-sauce-surface2";
  if (value === "done") return "border-sauce-success bg-sauce-success/20";
  if (value === "too_hard") return "border-sauce-goldDim bg-sauce-gold/10";
  return "border-sauce-gold bg-sauce-gold/10";
}

function Confetti() {
  return <div className="pointer-events-none absolute inset-0">{Array.from({ length: 10 }).map((_, i) => <span key={i} className="confetti" style={{ left: `${15 + i * 7}%`, "--cx": `${(i - 5) * 12}px`, "--cy": `${70 + (i % 3) * 22}px`, "--cr": `${80 + i * 30}deg`, animationDelay: `${i * 25}ms` }} />)}</div>;
}

function personalize(text, user) {
  return String(text || "").replaceAll("[NICHE]", user?.niche || "your niche");
}

function randomDone(streak) {
  const pool = ["Done. Here's what's next.", "Day [streak] streak. Keep moving.", "That built something. Next:", "Good. Forward.", "[Streak] days in. Most stopped before this.", "Clean. Next mission:", "Noted. Here's tomorrow's move:", "That's the work. More of it:"];
  return pool[Math.floor(Math.random() * pool.length)].replaceAll("[streak]", streak).replaceAll("[Streak]", streak);
}

function PlanModal({ user, onClose }) {
  const plan = generatePlanSummary(user);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-sauce-black/90 p-5"><motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md rounded-md border border-sauce-gold/40 bg-sauce-surface p-5"><CoachMark /><h2 className="mt-4 font-heading text-4xl font-bold">Your first map is built.</h2><p className="mt-3 leading-7 text-sauce-muted">{plan.blockerResponse}</p><p className="mt-3 leading-7">{plan.outcomeStatement}</p><div className="mt-4 grid gap-2">{plan.phaseDescriptions.map(p => <p key={p} className="rounded border border-sauce-border p-3 text-sm text-sauce-muted">{p}</p>)}</div><button onClick={onClose} className="btn-gold mt-5 w-full px-5 py-4">Start Mission 1</button></motion.section></div>;
}

function Celebration({ user }) {
  return <div className="mb-4 rounded-md border border-sauce-gold/40 bg-sauce-gold/10 p-5"><Sparkles className="text-sauce-gold" /><h2 className="mt-3 font-heading text-4xl font-bold">First dollar.</h2><p className="mt-2 text-sauce-muted">{user.current_day - 1} days of showing up. That is not luck. Zone 4 is waiting when this sprint is done.</p></div>;
}

function Stat({ icon: Icon, label, value }) {
  return <div className="rounded-md border border-sauce-border bg-sauce-surface p-3"><Icon className="text-sauce-gold" size={18} /><p className="mt-2 font-heading text-3xl font-bold">{value}</p><p className="font-mono text-[10px] uppercase tracking-[.2em] text-sauce-muted">{label}</p></div>;
}

function Typing() { return <div className="mt-8 flex justify-center gap-2">{[0, 1, 2].map(i => <span key={i} className="h-2 w-2 animate-typing-bounce rounded-full bg-sauce-gold" style={{ animationDelay: `${i * 120}ms` }} />)}</div>; }
function inferNiche(raw) { return raw.match(/(fitness|ecommerce|coaching|saas|freelance|agency|real estate|content)/i)?.[0] || "Service Business"; }
function snapshot() { return { user: readStore("thesauce_user"), streak: readStore("thesauce_streak"), missions: readStore("thesauce_missions"), checkins: readStore("thesauce_checkins"), skills: readStore("thesauce_skills"), community: readStore("thesauce_community"), chat: readStore("thesauce_chat_history") }; }

createRoot(document.getElementById("root")).render(<App />);
