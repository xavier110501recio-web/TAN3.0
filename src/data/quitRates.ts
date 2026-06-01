/**
 * Mocked attrition curve — % of users who quit BEFORE completing this mission.
 * Hand-tuned to read like a real funnel: gentle in zone 1, steep middle,
 * flattens after day 22 once the survivors are committed.
 */
export const QUIT_RATES: Record<number, number> = {
  1: 4,
  2: 9,
  3: 14,
  4: 19,
  5: 27,
  6: 32,
  7: 38,
  8: 41,
  9: 45,
  10: 48,
  11: 53,
  12: 57,
  13: 60,
  14: 62,
  15: 65,
  16: 67,
  17: 69,
  18: 70,
  19: 72,
  20: 73,
  21: 75,
  22: 76,
  23: 77,
  24: 78,
  25: 78,
  26: 79,
  27: 79,
  28: 80,
  29: 80,
  30: 81,
};

export function quitRateAt(missionNumber: number): number {
  if (missionNumber <= 1) return QUIT_RATES[1];
  if (missionNumber >= 30) return QUIT_RATES[30];
  return QUIT_RATES[missionNumber] ?? 50;
}
