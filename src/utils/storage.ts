import { MISSIONS } from "../data/missions";
import { COMMUNITY_SEEDS } from "../data/communitySeeds";
import { CONNECTIONS } from "../data/connections";
import { INVITE_SEEDS } from "../data/inviteSeeds";
import type { ChatMessage, ChatSession, CheckIn, CommunityPost, Connection, Invite, Mission, Skills, Snapshot, Streak, User } from "../types";
import type { ApiMission, MeSnapshot } from "../api/types";

interface Defaults {
  thesauce_streak: Streak;
  thesauce_missions: Mission[];
  thesauce_checkins: CheckIn[];
  thesauce_skills: Skills;
  thesauce_community: CommunityPost[];
  thesauce_chat_history: ChatMessage[];
  thesauce_dashboard_chat: ChatMessage[];
  thesauce_chat_sessions: ChatSession[];
  thesauce_active_chat_id: string | null;
  thesauce_connections: Connection[];
  thesauce_invites: Invite[];
  thesauce_user: User | null;
}

const defaults: Defaults = {
  thesauce_streak: { count: 0, longest: 0, last_checkin_date: null },
  thesauce_missions: MISSIONS.map((m) => ({ ...m, completed: false, completed_at: null })),
  thesauce_checkins: [],
  thesauce_skills: { sales: 0, marketing: 0, communication: 0, financial_literacy: 0, networking: 0, discipline: 0 },
  thesauce_community: COMMUNITY_SEEDS,
  thesauce_chat_history: [{ role: "coach", content: "Tell me the specific thing in the way. Not the whole mess. One thing. Then we solve that and move.", timestamp: new Date().toISOString() }],
  thesauce_dashboard_chat: [],
  thesauce_chat_sessions: [],
  thesauce_active_chat_id: null,
  thesauce_connections: CONNECTIONS,
  thesauce_invites: INVITE_SEEDS,
  thesauce_user: null,
};

export type StoreKey = keyof Defaults;

export function initStorage(): void {
  (Object.entries(defaults) as [StoreKey, Defaults[StoreKey]][]).forEach(([key, value]) => {
    if (value !== null && !localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value));
  });
}

export function readStore<K extends StoreKey>(key: K): Defaults[K] {
  const raw = localStorage.getItem(key);
  if (!raw) return defaults[key];
  try {
    return JSON.parse(raw) as Defaults[K];
  } catch {
    return defaults[key];
  }
}

export function updateStore<K extends StoreKey>(key: K, value: Defaults[K]): Defaults[K] {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function resetDemo(): void {
  Object.keys(localStorage).filter((k) => k.startsWith("thesauce_")).forEach((k) => localStorage.removeItem(k));
  initStorage();
}

export function freshUserStores(): void {
  updateStore("thesauce_streak", { count: 0, longest: 0, last_checkin_date: null });
  updateStore("thesauce_missions", MISSIONS.map((m) => ({ ...m, completed: false, completed_at: null })));
  updateStore("thesauce_checkins", []);
  updateStore("thesauce_skills", { sales: 0, marketing: 0, communication: 0, financial_literacy: 0, networking: 0, discipline: 0 });
  updateStore("thesauce_community", COMMUNITY_SEEDS);
  updateStore("thesauce_chat_history", defaults.thesauce_chat_history);
  updateStore("thesauce_dashboard_chat", []);
  updateStore("thesauce_chat_sessions", []);
  updateStore("thesauce_active_chat_id", null);
  updateStore("thesauce_connections", CONNECTIONS);
  updateStore("thesauce_invites", INVITE_SEEDS);
}

/**
 * Mirror a server-side MeSnapshot into the localStorage keys the existing
 * pages still read from. Transitional shim — when each page migrates to
 * calling `api.*` directly, drop the corresponding write here.
 */
export function bootstrapFromSnapshot(snap: MeSnapshot): void {
  const p = snap.profile;
  const user: User = {
    name: p.name,
    email: p.email ?? "",
    city: p.city,
    raw_dump: p.raw_dump,
    goal: p.goal,
    idea_type: p.idea_type,
    niche: p.niche,
    blockers: p.blockers,
    daily_time: p.daily_time,
    budget: p.budget,
    current_situation: p.current_situation,
    existing_skills: p.existing_skills,
    ninety_day_target: p.ninety_day_target,
    current_day: p.current_day,
    current_zone: p.current_zone,
    is_pro: p.is_pro,
    execution_score: p.execution_score,
    onboarding_complete: p.onboarding_complete,
    plan_summary_seen: p.plan_summary_seen,
    community_anonymous: p.community_anonymous,
    joined_at: p.joined_at,
    first_dollar_badge: p.first_dollar_badge,
    current_mission_title: p.current_mission_title ?? undefined,
    team_id: p.team_id ?? undefined,
  };
  updateStore("thesauce_user", user);
  updateStore("thesauce_streak", snap.streak);
  updateStore("thesauce_skills", snap.skills);
}

/**
 * Convert API mission shape (nullable fields) into the legacy in-app
 * Mission shape (optional fields) used by components like RoadmapView
 * and MissionCard. Strip out fields the UI doesn't read (id).
 */
export function apiMissionToLegacy(m: ApiMission): Mission {
  return {
    mission_number: m.mission_number,
    zone: m.zone,
    title: m.title,
    task: m.task,
    why: m.why,
    skill: m.skill,
    xp: m.xp,
    simplified_task: m.simplified_task ?? undefined,
    completed: m.completed,
    completed_at: m.completed_at,
    simplified: m.simplified,
    adjusted: m.adjusted,
    shareable: m.shareable,
    share_prompt: m.share_prompt ?? undefined,
  };
}

/**
 * Mirror server-side missions into localStorage so the existing pages
 * (Dashboard / Missions / CheckIn) keep reading from there during the
 * transition. Drop this once those pages call api.missions directly.
 */
export function bootstrapMissionsFromApi(missions: ApiMission[]): void {
  updateStore("thesauce_missions", missions.map(apiMissionToLegacy));
}

export function snapshot(): Snapshot {
  return {
    user: readStore("thesauce_user") as User,
    streak: readStore("thesauce_streak"),
    missions: readStore("thesauce_missions"),
    checkins: readStore("thesauce_checkins"),
    skills: readStore("thesauce_skills"),
    community: readStore("thesauce_community"),
    chat: readStore("thesauce_chat_history"),
  };
}
