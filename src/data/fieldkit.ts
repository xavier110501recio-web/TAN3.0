import type { Resource } from "../types";

export const RESOURCES: Resource[] = [
  // ─── Skill drills ───
  {
    id: "fk-1",
    kind: "skill",
    title: "Cold email that gets a reply",
    description: "The 4-line structure that beat templates in 2025 outreach tests. Subject. Hook. Specific ask. Out.",
    source: "Founder's Notebook",
    meta: "8 min read",
    tag: "Sales",
    keywords: ["outreach", "cold email", "leads", "prospect", "dm", "reply", "first customer", "sales", "pitch", "find customers"],
  },
  {
    id: "fk-2",
    kind: "skill",
    title: "Why one good hook beats ten posts",
    description: "How to write the first line that earns the next ten seconds of attention.",
    source: "Marketing field manual",
    meta: "6 min read",
    tag: "Marketing",
    keywords: ["hook", "writing", "content", "post", "engagement", "attention", "copy", "social", "audience", "reach"],
  },
  {
    id: "fk-3",
    kind: "skill",
    title: "Building the morning anchor",
    description: "The 23-minute routine that protects your most productive hour from the rest of the day.",
    source: "Discipline drills",
    meta: "Drill · 30 days",
    tag: "Discipline",
    keywords: ["routine", "habit", "morning", "focus", "deep work", "consistency", "willpower", "productivity", "burnout"],
  },

  // ─── MCP servers ───
  {
    id: "fk-4",
    kind: "mcp",
    title: "Linear MCP",
    description: "Pull issue velocity, cycle time, and scope drift straight into your daily briefings.",
    source: "github/linear-mcp",
    meta: "MCP · open-source",
    keywords: ["productivity", "engineering", "ship", "issues", "velocity", "task management", "linear", "tracking"],
  },
  {
    id: "fk-5",
    kind: "mcp",
    title: "Calendar MCP",
    description: "Auto-block deep work the second your daily check-in lands. No friction.",
    source: "modelcontextprotocol.io",
    meta: "MCP · official",
    keywords: ["calendar", "schedule", "deep work", "time blocking", "focus", "productivity", "discipline"],
  },
  {
    id: "fk-6",
    kind: "mcp",
    title: "Notion+ MCP",
    description: "Bi-directional sync — coach notes write back to your daily log without leaving the chat.",
    source: "notion-community",
    meta: "MCP · beta",
    keywords: ["notes", "knowledge", "docs", "writing", "sync", "notion", "second brain"],
  },

  // ─── Repositories ───
  {
    id: "fk-7",
    kind: "repo",
    title: "indie-saas-starter",
    description: "Next.js + Stripe + auth + transactional emails. Clone to first dollar in 8 hours.",
    source: "github.com/indie",
    meta: "1.2k★ · MIT",
    tag: "SaaS",
    keywords: ["saas", "starter", "boilerplate", "stripe", "nextjs", "auth", "build", "ship", "first dollar", "mvp", "launch", "code"],
  },
  {
    id: "fk-8",
    kind: "repo",
    title: "outreach-templates",
    description: "47 cold email templates with reply rates from real 2025 sends. Plus the bad ones, so you know.",
    source: "github.com/outreach",
    meta: "Open data",
    tag: "Sales",
    keywords: ["outreach", "cold email", "templates", "sales", "pitch", "leads", "first customer", "reply", "dm"],
  },

  // ─── Plays · case studies ───
  {
    id: "fk-9",
    kind: "play",
    title: "How Levels.io launched 12 products",
    description: "Public dollar-by-dollar log of a one-person product studio's first decade. Patterns you can run today.",
    source: "Nomad List talk",
    meta: "Case · 22 min",
    tag: "Solo SaaS",
    keywords: ["solo", "indie", "build in public", "products", "case study", "launch", "saas", "founder", "ship"],
  },
  {
    id: "fk-10",
    kind: "play",
    title: "Zero to $20k MRR in 90 days",
    description: "A service founder's exact post cadence, offer iteration, and price changes — week by week.",
    source: "Indie Hackers",
    meta: "Case · 14 min",
    tag: "Service",
    keywords: ["mrr", "service", "agency", "revenue", "first dollar", "pricing", "growth", "case study", "scale", "money"],
  },

  // ─── Signal · news in space ───
  {
    id: "fk-11",
    kind: "signal",
    title: "X reach algorithm shifts to replies",
    description: "Posts with high reply density now boosted 3× over likes. Optimize for conversation, not applause.",
    source: "X engineering",
    meta: "Signal · 2d ago",
    keywords: ["x", "twitter", "social", "algorithm", "engagement", "reach", "audience", "marketing", "distribution"],
  },
  {
    id: "fk-12",
    kind: "signal",
    title: "Agent SDK 2.0 ships",
    description: "Solo founders can wire voice agents in an afternoon. Worth a look before your competition does.",
    source: "openai.com",
    meta: "Signal · 4d ago",
    keywords: ["ai", "agents", "openai", "voice", "automation", "build", "tools", "tech"],
  },
];
