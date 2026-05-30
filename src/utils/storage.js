import { MISSIONS } from "../data/missions";
import { COMMUNITY_SEEDS } from "../data/communitySeeds";

const defaults = {
  thesauce_streak: { count: 0, longest: 0, last_checkin_date: null },
  thesauce_missions: MISSIONS.map((m) => ({ ...m, completed: false, completed_at: null })),
  thesauce_checkins: [],
  thesauce_skills: { sales: 0, marketing: 0, communication: 0, financial_literacy: 0, networking: 0, discipline: 0 },
  thesauce_community: COMMUNITY_SEEDS,
  thesauce_chat_history: [{ role: "coach", content: "Tell me the specific thing in the way. Not the whole mess. One thing. Then we solve that and move.", timestamp: new Date().toISOString() }],
};

export function initStorage() {
  Object.entries(defaults).forEach(([key, value]) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value));
  });
}

export function readStore(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return defaults[key] ?? null;
  try { return JSON.parse(raw); } catch { return defaults[key] ?? null; }
}

export function updateStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function resetDemo() {
  Object.keys(localStorage).filter((k) => k.startsWith("thesauce_")).forEach((k) => localStorage.removeItem(k));
  initStorage();
}

export function freshUserStores() {
  updateStore("thesauce_streak", { count: 0, longest: 0, last_checkin_date: null });
  updateStore("thesauce_missions", MISSIONS.map((m) => ({ ...m, completed: false, completed_at: null })));
  updateStore("thesauce_checkins", []);
  updateStore("thesauce_skills", { sales: 0, marketing: 0, communication: 0, financial_literacy: 0, networking: 0, discipline: 0 });
  updateStore("thesauce_community", COMMUNITY_SEEDS);
  updateStore("thesauce_chat_history", defaults.thesauce_chat_history);
}
