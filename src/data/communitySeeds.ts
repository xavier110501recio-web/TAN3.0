import type { CommunityPost } from "../types";

const hours = (n: number) => `${n} hours ago`;
const days = (n: number) => `${n} day${n > 1 ? "s" : ""} ago`;

export const COMMUNITY_SEEDS: CommunityPost[] = [
  { id: 1, name: "Marcus", city: "Houston", type: "milestone", content: "Day 21. Still moving.", niche: "Ecommerce", timestamp: hours(6), reactions: { fire: 7, flex: 3, bolt: 2 } },
  { id: 2, name: "Priya", city: "London", type: "win", content: "First client booked. They found me through a post I almost didn't publish.", niche: "Freelancing", timestamp: hours(12), reactions: { fire: 14, flex: 9, bolt: 5 } },
  { id: 3, name: "Jordan", city: "Chicago", type: "commitment", content: "I will launch my landing page by this Friday.", niche: "SaaS", status: "open", timestamp: days(1), reactions: { fire: 4, flex: 6, bolt: 2 } },
  { id: 4, name: "Aaliyah", city: "Miami", type: "milestone", content: "Day 7 streak. Did not think I would make it past 3.", niche: "Coaching", timestamp: days(2), reactions: { fire: 11, flex: 7, bolt: 8 } },
  { id: 5, name: "Tyler", city: "Phoenix", type: "win", content: "First sale. $47. Proof it is real.", niche: "Ecommerce", timestamp: days(2), reactions: { fire: 22, flex: 15, bolt: 11 } },
  { id: 6, name: "Sam", city: "Austin", type: "milestone", content: "Mission 15 done. Outreach finally feels less terrifying.", niche: "Service Business", timestamp: days(3), reactions: { fire: 6, flex: 4, bolt: 3 } },
  { id: 7, name: "Devon", city: "Atlanta", type: "commitment", content: "I will send 5 outreach messages today before I open Instagram.", niche: "Freelancing", status: "completed", timestamp: days(3), reactions: { fire: 9, flex: 5, bolt: 4 } },
  { id: 8, name: "Keisha", city: "Dallas", type: "win", content: "Someone said yes to a discovery call. First time that has happened.", niche: "Coaching", timestamp: days(4), reactions: { fire: 13, flex: 8, bolt: 6 } },
  { id: 9, name: "Noah", city: "Denver", type: "milestone", content: "Posted the problem post. Zero polish. Three replies.", niche: "Fitness", timestamp: days(4), reactions: { fire: 8, flex: 5, bolt: 3 } },
  { id: 10, name: "Rina", city: "Seattle", type: "commitment", content: "I will ask for the sale directly before 5pm.", niche: "Consulting", timestamp: days(4), reactions: { fire: 12, flex: 7, bolt: 4 } },
  { id: 11, name: "Luis", city: "San Diego", type: "win", content: "Follow-up worked. Call booked for Monday.", niche: "Agency", timestamp: days(5), reactions: { fire: 10, flex: 6, bolt: 5 } },
  { id: 12, name: "Amara", city: "New York", type: "milestone", content: "Wrote the one-sentence offer. Finally sounds simple.", niche: "Digital Product", timestamp: days(5), reactions: { fire: 5, flex: 4, bolt: 2 } },
  { id: 13, name: "Chris", city: "Toronto", type: "commitment", content: "No logo work until I send the messages.", niche: "SaaS", timestamp: days(5), reactions: { fire: 15, flex: 10, bolt: 6 } },
  { id: 14, name: "Imani", city: "Charlotte", type: "win", content: "A stranger replied with the exact pain I was guessing at.", niche: "Coaching", timestamp: days(6), reactions: { fire: 9, flex: 3, bolt: 7 } },
  { id: 15, name: "Owen", city: "Portland", type: "milestone", content: "Day 10 complete. The uncomfortable thing is getting less loud.", niche: "Freelancing", timestamp: days(6), reactions: { fire: 6, flex: 7, bolt: 3 } },
  { id: 16, name: "Nia", city: "Tampa", type: "commitment", content: "I will answer one question in the community with no pitch.", niche: "Service Business", timestamp: days(6), reactions: { fire: 4, flex: 4, bolt: 2 } },
  { id: 17, name: "Eli", city: "Boston", type: "win", content: "Someone asked for pricing after the problem post.", niche: "Marketing", timestamp: days(7), reactions: { fire: 18, flex: 9, bolt: 8 } },
  { id: 18, name: "Sofia", city: "Orlando", type: "milestone", content: "Recorded the pitch. It sounded bad. Fixed it. Now it is clear.", niche: "Consulting", timestamp: days(7), reactions: { fire: 7, flex: 6, bolt: 3 } },
  { id: 19, name: "Malik", city: "Las Vegas", type: "commitment", content: "Today I cut the fake work and do the ask.", niche: "Ecommerce", timestamp: days(7), reactions: { fire: 11, flex: 6, bolt: 6 } },
  { id: 20, name: "Tara", city: "Minneapolis", type: "win", content: "First useful conversation with a real buyer. Everything changed.", niche: "Service Business", timestamp: days(7), reactions: { fire: 16, flex: 8, bolt: 5 } },
];
