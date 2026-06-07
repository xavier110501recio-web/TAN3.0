import type { Mission, User } from "../types";

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

const REVENUE_PATTERN = /\b(sale|sold|paid|paying|customer|client|booked|signed|deposit|invoice|revenue|first[\s-]?dollar)\b|\$\s?\d/i;

export function looksLikeRevenue(text: string | null | undefined): boolean {
  if (!text) return false;
  return REVENUE_PATTERN.test(text);
}

export interface ProofShape {
  lookFor: string[];
  placeholder: string;
}

export function inferProofShape(mission: Mission): ProofShape {
  const t = `${mission.title} ${mission.task}`.toLowerCase();

  if (/offer|one[- ]?sentence|elevator/.test(t)) {
    return {
      lookFor: [
        "One sentence — not a paragraph",
        "Names a specific person, result, and pain",
        "No jargon, no 'we help businesses…'",
      ],
      placeholder: "Paste your one-sentence offer. Would it survive being read aloud to a stranger?",
    };
  }
  if (/sale|revenue|sell|customer|paid|dollar|stripe|invoice|charge/.test(t)) {
    return {
      lookFor: [
        "Real revenue, even $1 — from a real customer",
        "Documented (Stripe, invoice, screenshot)",
        "Not a friend doing you a favor",
      ],
      placeholder: "$ amount, who paid, what they got. Or paste the receipt link.",
    };
  }
  if (/landing|page|website|launch|publish|post|video|tweet|reel/.test(t)) {
    return {
      lookFor: [
        "Live, public link — not a draft",
        "Speaks to one specific person, not 'everyone'",
        "Title or hook that'd stop the scroll",
      ],
      placeholder: "Drop the public link. Or describe what you shipped and where it lives.",
    };
  }
  if (/dm|email|message|cold|outreach|pitch|reach out/.test(t)) {
    return {
      lookFor: [
        "Sent to a real recipient (not yourself)",
        "Clear ask in the first two lines",
        "No 'just' or 'sorry to bother you'",
      ],
      placeholder: "Paste the message you sent, or a screenshot link.",
    };
  }
  if (/price|pricing|cost|number|budget|runway|track|expense/.test(t)) {
    return {
      lookFor: [
        "Actual numbers, not estimates",
        "Written somewhere you'll see again",
        "Connected to a decision you can make",
      ],
      placeholder: "Paste the numbers, or a link to your tracker.",
    };
  }
  if (/intro|connect|network|meet|call|conversation/.test(t)) {
    return {
      lookFor: [
        "Real human contacted (no listservs)",
        "Specific ask, not 'pick your brain'",
        "Includes who they are and why them",
      ],
      placeholder: "Who did you reach out to? What was the specific ask?",
    };
  }

  switch (mission.skill) {
    case "sales":
      return { lookFor: ["Real ask sent to a real person", "Specific number or commitment", "Followed up at least once"], placeholder: "Who did you ask? What did they say?" };
    case "marketing":
      return { lookFor: ["Live, public artifact (not a draft)", "Aimed at one specific person", "Title that'd make you stop scrolling"], placeholder: "Drop the public link or describe what you shipped." };
    case "communication":
      return { lookFor: ["Sent to a real recipient", "Clear ask in the first two lines", "No filler — every line earns its place"], placeholder: "Paste the message, or a screenshot link." };
    case "financial_literacy":
      return { lookFor: ["Actual numbers, not estimates", "Documented somewhere durable", "Tied to a decision you can act on"], placeholder: "The numbers, or a link to the tracker." };
    case "networking":
      return { lookFor: ["Real human contacted", "Specific ask, not vague", "Includes who and why them"], placeholder: "Who did you reach out to? What was the ask?" };
    case "discipline":
      return { lookFor: ["Honest answer, not the polished version", "Concrete proof (timestamp, log, photo)", "Names what almost stopped you"], placeholder: "What did you do? What almost stopped you?" };
    default:
      return { lookFor: ["Concrete output, not 'I thought about it'", "Shippable to a stranger as-is", "Honest about what's still rough"], placeholder: "Describe what you shipped. Paste a link if there is one." };
  }
}
