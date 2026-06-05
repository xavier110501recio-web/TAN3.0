import type { Mission, User } from "../types";

/**
 * Returns up to `limit` missions to surface in the Coach's focus panel.
 *
 * MVP heuristic: current actionable mission + the next uncompleted ones in order.
 * In production this is where a semantic clustering pass would pick the missions
 * that "hang together" — e.g., all sales-bucket plays around an outreach push.
 */
export function selectFocusedMissions(missions: Mission[], user: User, limit = 3): Mission[] {
  const sorted = [...missions].sort((a, b) => a.mission_number - b.mission_number);
  const currentIdx = sorted.findIndex((m) => m.mission_number === user.current_day);
  const startIdx = currentIdx >= 0 ? currentIdx : 0;
  const slice = sorted.slice(startIdx);
  return slice.filter((m) => !m.completed).slice(0, limit);
}
