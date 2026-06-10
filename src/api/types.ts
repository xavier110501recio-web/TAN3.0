// API types for thesauce-backend.
//
// Manually authored to match the Pydantic schemas in
// THE-BACKEND/src/thesauce/schemas/. Regenerate from the live OpenAPI
// schema once the backend is running with:
//   npx openapi-typescript http://localhost:8000/openapi.json -o src/api/types.ts
// (script at THE-BACKEND/scripts/generate_frontend_types.sh).

export type Skill =
  | "sales"
  | "marketing"
  | "communication"
  | "financial_literacy"
  | "networking"
  | "discipline";

export type RoadmapStatus = "pending" | "generating" | "ready" | "failed";

export interface Skills {
  sales: number;
  marketing: number;
  communication: number;
  financial_literacy: number;
  networking: number;
  discipline: number;
}

export interface Streak {
  count: number;
  longest: number;
  last_checkin_date: string | null;
}

export interface Profile {
  user_id: string;
  name: string;
  email: string | null;
  city: string;
  raw_dump: string;
  goal: string;
  idea_type: string;
  niche: string;
  blockers: string[];
  daily_time: string;
  budget: string;
  current_situation: string;
  existing_skills: string;
  ninety_day_target: string;
  current_day: number;
  current_zone: number;
  is_pro: boolean;
  execution_score: number;
  onboarding_complete: boolean;
  plan_summary_seen: boolean;
  community_anonymous: boolean;
  joined_at: string;
  first_dollar_badge: boolean;
  current_mission_title: string | null;
  team_id: string | null;
  roadmap_status: RoadmapStatus;
  referral_credit: number;
}

export interface MeSnapshot {
  profile: Profile;
  streak: Streak;
  skills: Skills;
  current_mission_number: number | null;
}

export interface OnboardingPayload {
  name: string;
  city: string;
  raw_dump: string;
  blockers?: string[];
  daily_time?: string;
  budget?: string;
  ninety_day_target?: string;
  current_situation?: string;
  existing_skills?: string;
}
