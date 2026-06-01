import type { Invite } from "../types";

const days = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const INVITE_SEEDS: Invite[] = [
  {
    id: "inv-1",
    kind: "cofounder",
    name: "Mara Chen",
    email: "mara@example.com",
    status: "joined",
    invited_at: days(11),
    joined_at: days(10),
    team_id: "team-1",
  },
  {
    id: "inv-2",
    kind: "friend",
    name: "Jonas",
    email: "jonas@example.com",
    status: "pending",
    invited_at: days(2),
  },
];
