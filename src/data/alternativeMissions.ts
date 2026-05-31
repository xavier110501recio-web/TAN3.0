import type { SkillName } from "../types";

export const ALTERNATIVE_MISSIONS: Record<number, Partial<Record<SkillName, string[]>>> = {
  1: {
    sales: [
      "Find one person who recently complained about a problem your idea solves in [NICHE]. Screenshot their post or comment. That is your target customer.",
      "Write a 3-sentence description of your ideal customer's worst day in [NICHE]. The day your product would have fixed.",
      "Find one paid offer in [NICHE]. Write down who buys it, what result they want, and what pain they are avoiding.",
    ],
    marketing: [
      "Search for [NICHE] on Reddit. Find the most upvoted post from the last month. Write what it proves your audience cares about.",
      "Look at the last 5 posts from your top competitor in [NICHE]. What do all 5 have in common? Write that down.",
      "Find one comment thread in [NICHE] where people are asking for help. Copy the exact words they use to describe the problem.",
    ],
    communication: [
      "Record a 60-second voice note explaining your idea as if telling a friend. Listen back. Rewrite the awkward parts.",
      "Write ten email subject lines for your offer. Pick the one that feels most true.",
      "Write one honest question you could ask a potential customer in [NICHE] without pitching them anything.",
    ],
    financial_literacy: [
      "Find one simple offer in [NICHE] and write the exact price. Then write one reason a customer would pay it.",
      "Write the cheapest version of your offer that still solves a real problem. Put one price next to it.",
      "List three things you are tempted to buy for this idea. Cross out anything that does not directly create revenue.",
    ],
    networking: [
      "Find one creator or operator in [NICHE] who already has your audience. Save their profile and write one way you could help them.",
      "Join one [NICHE] community and read five posts. Do not post yet. Write down the repeated problem.",
      "Find one person worth knowing in [NICHE]. Write a no-ask message that gives them a useful observation.",
    ],
    discipline: [
      "Set a 10-minute timer and do the smallest visible part of the mission. Stop when the timer ends and write what moved.",
      "Remove one distraction before starting today's task. Put the phone away, open the note, and do the first sentence.",
      "Write the thing you are avoiding in one line. Then do two minutes of it before thinking again.",
    ],
  },
  2: {
    sales: [
      "Send one follow-up to a person who already heard from you. Keep it one line and do not over-explain.",
      "Write the most likely objection a buyer in [NICHE] has. Answer it in one direct sentence.",
      "Ask one prospect what they have already tried to solve this. Do not pitch. Just ask.",
    ],
    marketing: [
      "Rewrite your last post with a stronger first sentence. Make the problem obvious in the first line.",
      "Find one strong opinion in [NICHE] you actually believe. Turn it into a 5-sentence post draft.",
      "Take one customer complaint from [NICHE] and write a post that describes it without selling.",
    ],
    communication: [
      "Record your 3-sentence pitch once. Delete every filler word from the written version.",
      "Write the same offer three ways: direct, casual, and premium. Keep the clearest one.",
      "Send one voice-note practice pitch to yourself and write the sentence that sounded weakest.",
    ],
    financial_literacy: [
      "Write your 30-day revenue target and divide it by your current price. That number is the customer count.",
      "List every cost you think you need. Mark each one revenue-first or vanity.",
      "Write one sentence explaining why your price is fair for the result you deliver.",
    ],
    networking: [
      "Answer one question in a [NICHE] community with no pitch and no link.",
      "Find one adjacent operator who serves your customer. Write one useful intro message.",
      "Leave one thoughtful comment on a post from someone your target buyer already trusts.",
    ],
    discipline: [
      "Write the one habit that made the last mission easier. Schedule it before tomorrow starts.",
      "Pick the hardest 8-minute part of today's mission and do only that.",
      "Write what you will do before opening any entertainment app today.",
    ],
  },
  3: {
    sales: [
      "Send one direct offer to the warmest person on your list. Make the result clear and the next step simple.",
      "Write a one-page offer with only three sections: result, price, start step.",
      "Ask one interested person directly if they want help solving the problem this week.",
    ],
    marketing: [
      "Take your best-performing post and write a second version with a sharper opening line.",
      "Post one honest lesson from your last 20 days of building in [NICHE]. Keep it specific.",
      "Write a post showing the before-and-after your customer wants, without mentioning features.",
    ],
    communication: [
      "Send a no-pitch update to one person who knows what you are building. Keep the conversation warm.",
      "Write a short progress update that explains what changed since your last conversation.",
      "Rewrite your offer in language a tired customer in [NICHE] would use after a long day.",
    ],
    financial_literacy: [
      "Write every potential dollar tied to this business, even if it is zero. Put today's date next to it.",
      "Map what breaks at 10 customers. Write the first fix only.",
      "Calculate how many sales at your price would make this month feel real.",
    ],
    networking: [
      "Find one referral partner in [NICHE]. Write the first value-first message with no ask.",
      "Identify one person who already has customer trust. Write how you could make their work easier.",
      "Send one useful resource to someone in your market without asking for anything.",
    ],
    discipline: [
      "Cut one fake-work task today and replace it with one direct customer-facing action.",
      "Write the next 30-day target in one sentence. Then write the first move.",
      "Set a timer for the ask you are avoiding. Do the first two minutes now.",
    ],
  },
};
