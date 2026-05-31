export type SkillName =
  | "sales"
  | "marketing"
  | "communication"
  | "financial_literacy"
  | "networking"
  | "discipline";

export type Skills = Record<SkillName, number>;

export interface Mission {
  mission_number: number;
  zone: number;
  title: string;
  task: string;
  why: string;
  skill: SkillName;
  xp: number;
  simplified_task?: string;
  completed?: boolean;
  completed_at?: string | null;
  simplified?: boolean;
  adjusted?: boolean;
}

export type CheckInOutcome =
  | "completed"
  | "completed_with_issue"
  | "partial"
  | "done"
  | "too_hard"
  | "adjusted"
  | "need_help";

export interface CheckIn {
  date: string;
  mission_number: number;
  outcome: CheckInOutcome;
  obstacle: string | null;
  note: string | null;
  mood: number | null;
}

export interface ChatMessage {
  role: "user" | "coach";
  content: string;
  timestamp: string;
}

export interface ComposerAttachment {
  id: string;
  kind: "file";
  name: string;
  size: number;
}

export interface ComposerConnection {
  id: string;
  kind: "notion";
  pageId: string;
  title: string;
}

export interface MapAnnotation {
  id: string;
  selectedText: string;
  comment: string;
  context?: { missionNumber?: number; zone?: number; section?: string };
}

export interface Streak {
  count: number;
  longest: number;
  last_checkin_date: string | null;
}

export interface CommunityPost {
  id: number;
  name: string;
  city: string;
  type: "milestone" | "win" | "commitment";
  content: string;
  niche: string;
  status?: "open" | "completed";
  timestamp: string;
  reactions: { fire: number; flex: number; bolt: number };
}

export interface User {
  name: string;
  email: string;
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
  first_dollar_badge?: boolean;
  current_mission_title?: string;
  attachments?: ComposerAttachment[];
  connections?: ComposerConnection[];
}

export interface Snapshot {
  user: User;
  streak: Streak;
  missions: Mission[];
  checkins: CheckIn[];
  skills: Skills;
  community: CommunityPost[];
  chat: ChatMessage[];
}

export interface DebriefResult {
  coachMessage: string;
  nextMission: Mission | null;
  xpEarned: number;
  skillIncrement: { skillName: SkillName; amount: number };
}

export interface CoachResponse {
  response: string;
}

export interface PlanSummary {
  phaseDescriptions: string[];
  blockerResponse: string;
  prioritySkills: SkillName[];
  outcomeStatement: string;
}
