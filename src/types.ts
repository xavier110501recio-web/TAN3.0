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
  shareable?: boolean;
  share_prompt?: string;
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

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
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

export type ConnectionKind =
  | "stripe"
  | "notion"
  | "linear"
  | "slack"
  | "x"
  | "instagram"
  | "youtube"
  | "gmail"
  | "mcp";

export type ConnectionCategory = "revenue" | "audience" | "ops" | "mcp";
export type ConnectionStatus = "connected" | "available";

export interface ConnectionMetric {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}

export interface ConnectionUsage {
  timestamp: string;
  action: string;
  surface: string;
  result?: string;
}

export interface Connection {
  id: string;
  kind: ConnectionKind;
  name: string;
  blurb: string;
  category: ConnectionCategory;
  status: ConnectionStatus;
  connected_at?: string;
  last_sync?: string;
  metrics?: ConnectionMetric[];
  usage?: ConnectionUsage[];
  fields_pulled?: string[];
}

export type ResourceKind = "skill" | "mcp" | "repo" | "play" | "signal";

export interface Resource {
  id: string;
  kind: ResourceKind;
  title: string;
  description: string;
  source: string;
  meta: string;
  tag?: string;
  href?: string;
  keywords?: string[];
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

export type InviteKind = "cofounder" | "friend";
export type InviteStatus = "pending" | "joined" | "declined";

export interface Invite {
  id: string;
  kind: InviteKind;
  name: string;
  email: string;
  status: InviteStatus;
  invited_at: string;
  joined_at?: string;
  team_id?: string;
}

export interface TeamMate {
  name: string;
  email: string;
  role: "cofounder" | "you";
  current_day: number;
  current_mission_title?: string;
  joined_at: string;
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
  team_id?: string;
  team?: TeamMate[];
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
