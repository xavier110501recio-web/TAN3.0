import { MISSIONS } from "../data/missions";
import { COMMUNITY_SEEDS } from "../data/communitySeeds";
import { CONNECTIONS } from "../data/connections";
import { INVITE_SEEDS } from "../data/inviteSeeds";
import type { ChatMessage, CheckIn, CommunityPost, Connection, Invite, Mission, Skills, Snapshot, Streak, User } from "../types";

interface Defaults {
  thesauce_streak: Streak;
  thesauce_missions: Mission[];
  thesauce_checkins: CheckIn[];
  thesauce_skills: Skills;
  thesauce_community: CommunityPost[];
  thesauce_chat_history: ChatMessage[];
  thesauce_dashboard_chat: ChatMessage[];
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
  updateStore("thesauce_connections", CONNECTIONS);
  updateStore("thesauce_invites", INVITE_SEEDS);
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
