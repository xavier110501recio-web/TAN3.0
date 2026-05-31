import type { User } from "../types";

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function roman(n: number): string {
  return ["", "I", "II", "III", "IV", "V", "VI"][n] || String(n);
}

export function personalize(text: string, user: User | null): string {
  return String(text || "").replaceAll("[NICHE]", user?.niche || "your niche");
}

export function randomDone(streak: number): string {
  const pool = [
    "Done. Here's what's next.",
    "Day [streak] streak. Keep moving.",
    "That built something. Next:",
    "Good. Forward.",
    "[Streak] days in. Most stopped before this.",
    "Clean. Next mission:",
    "Noted. Here's tomorrow's move:",
    "That's the work. More of it:",
  ];
  return pool[Math.floor(Math.random() * pool.length)]
    .replaceAll("[streak]", String(streak))
    .replaceAll("[Streak]", String(streak));
}

export function inferNiche(raw: string): string {
  return raw.match(/(fitness|ecommerce|coaching|saas|freelance|agency|real estate|content)/i)?.[0] || "Service Business";
}
