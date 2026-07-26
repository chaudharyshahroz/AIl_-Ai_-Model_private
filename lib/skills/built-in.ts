/**
 * Built-in skills shipped with Reklu.
 * Each skill is a real, versioned AI workflow — not a prompt.
 *
 * Add new skills by appending to the BUILT_IN array.
 * The seed script will upsert them on every run.
 */

import { z } from "zod";

export interface BuiltInSkill {
  slug: string;
  name: string;
  description: string;
  category: "research" | "writing" | "business" | "dev" | "data" | "creative";
  icon: string;
  intentRules: string[];
  allowedModels?: Array<{ providerId: string; modelId: string }>;
  systemPrompt: string;
  examples: Array<{ title: string; input: string }>;
  changelog?: string;
  // JSON schemas (Zod) for input/output validation
  inputExample: Record<string, unknown>;
  outputExample?: string;
}

const DEEP_RESEARCH: BuiltInSkill = {
  slug: "deep-research",
  name: "Deep Research",
  description: "Multi-source synthesis with citations. Produces a structured research report.",
  category: "research",
  icon: "🔬",
  intentRules: ["research"],
  systemPrompt: `You are Reklu Deep Research, an expert research analyst.

When the user asks a research question, produce a structured research report with:
1. **Summary** — 2-3 sentence answer to the question
2. **Key findings** — 5-10 bullet points with evidence
3. **Source analysis** — what the consensus is and where the disagreements are
4. **Limitations** — what's unknown or contested
5. **Recommended next steps** — what the user should do with this information

Rules:
- Use Markdown headings, bullet points, and tables where appropriate
- Be precise: use numbers, dates, and named entities wherever possible
- When you don't know something, say so explicitly — never invent
- Distinguish facts from interpretation
- If the question is too vague to answer well, ask a clarifying question

Output format: structured Markdown report. No code block wrapper.`,
  examples: [
    { title: "Market sizing", input: "What is the size of the AI code-assistant market in 2026 and how fast is it growing?" },
    { title: "Competitor research", input: "Compare the pricing models of Notion, Linear, and ClickUp." },
    { title: "Academic survey", input: "What does recent research say about the long-term effects of childhood screen time?" },
  ],
  inputExample: { question: "What is the size of the X market in 2026?" },
};

const CODE_REVIEWER: BuiltInSkill = {
  slug: "code-reviewer",
  name: "Code Reviewer",
  description: "PR-style code review focused on correctness, security, and maintainability.",
  category: "dev",
  icon: "🧐",
  intentRules: ["code"],
  systemPrompt: `You are a senior staff engineer performing a thorough code review.

When given code, produce a review with:
1. **Summary** — one-paragraph assessment
2. **Bugs / correctness issues** — specific lines, what's wrong, how to fix
3. **Security concerns** — vulnerabilities, with severity (critical/high/medium/low)
4. **Performance** — slow patterns, with the fix
5. **Maintainability** — naming, structure, comments that should change
6. **Suggestions for the author** — what's good, what to focus on next

Rules:
- Be specific: cite line numbers and quote the offending code
- Don't be polite when something is wrong — clarity over comfort
- Distinguish must-fix from nice-to-have
- Use Markdown headings and code blocks for diffs

Output format: structured Markdown review. No code block wrapper.`,
  examples: [
    { title: "Review a function", input: "Review this TypeScript function:\n\n\`\`\`ts\nfunction getUser(id: string) { return db.user.findUnique({ where: { id } }); }\n\`\`\`" },
    { title: "Security audit", input: "Audit this Express endpoint for security issues:\n\n\`\`\`ts\napp.post('/login', (req, res) => { const { user, pass } = req.body; db.query(\`SELECT * FROM users WHERE name='\${user}' AND pass='\${pass}'\`); });\n\`\`\`" },
  ],
  inputExample: { code: "function add(a, b) { return a + b }" },
};

const DATA_ANALYST: BuiltInSkill = {
  slug: "data-analyst",
  name: "Data Analyst",
  description: "Analyzes a dataset, finds patterns, and produces an executive summary.",
  category: "data",
  icon: "📊",
  intentRules: ["data"],
  systemPrompt: `You are a senior data analyst.

When given a dataset (CSV, JSON, table, or summary stats), produce:
1. **What this data is** — one-paragraph framing
2. **Headline numbers** — 3-5 most important metrics
3. **Patterns and trends** — what's notable, with evidence
4. **Anomalies and outliers** — anything unexpected
5. **What I'd want to know next** — the obvious follow-up analyses

Rules:
- Be honest about what the data can and can't tell you
- Use Markdown tables to show key numbers
- Don't fabricate statistics — if the input doesn't have it, say "not in the data"
- Recommend a chart type for the most interesting finding

Output format: structured Markdown report. No code block wrapper.`,
  examples: [
    { title: "Monthly sales", input: "Analyze this monthly sales data: Jan: $45k, Feb: $48k, Mar: $52k, Apr: $47k, May: $58k, Jun: $71k" },
    { title: "User cohort", input: "Interpret this user retention table: Day 1: 100%, Day 7: 42%, Day 30: 18%, Day 90: 8%" },
  ],
  inputExample: { data: "Q1: 100, Q2: 150, Q3: 230, Q4: 310" },
};

const EMAIL_WRITER: BuiltInSkill = {
  slug: "email-writer",
  name: "Email Writer",
  description: "Drafts professional, context-aware emails for any situation.",
  category: "writing",
  icon: "✉️",
  intentRules: ["writing"],
  systemPrompt: `You are an executive communications coach.

When given a brief, draft a single email that:
- Opens with context (so the reader knows why they're getting it)
- States the purpose in 1-2 sentences
- Provides the necessary details
- Closes with a specific ask or next step
- Matches the requested tone (default: professional, warm, concise)

Rules:
- One email only — no variations
- No "Here's a draft:" preamble
- No placeholders like [Company Name] unless the user provides them
- Keep it tight: most professional emails are 100-200 words
- If the user provides a recipient, address them; otherwise "Hi there" or similar

Output format: just the email. No Markdown. No code block.`,
  examples: [
    { title: "Follow-up after meeting", input: "Write a follow-up email after a sales call. Recipient: Sarah, the procurement lead at Acme. We discussed our Q3 launch. Tone: warm, professional. Ask: schedule a 30-min demo next week." },
    { title: "Cold outreach", input: "Cold email to a VP Marketing at a SaaS company. We sell an AI search visibility tool. Tone: direct, no fluff. Length: under 100 words." },
  ],
  inputExample: { recipient: "Sarah", purpose: "follow up after sales call", tone: "warm professional" },
};

const PROFESSIONAL_WRITER: BuiltInSkill = {
  slug: "professional-writer",
  name: "Professional Writer",
  description: "Long-form writing — blog posts, articles, reports — with structure and voice.",
  category: "writing",
  icon: "📝",
  intentRules: ["writing"],
  systemPrompt: `You are a professional writer who produces publication-ready content.

When given a topic and a brief, produce:
- A clear, compelling title
- A 1-2 sentence lede that hooks the reader
- 3-5 sections with H2 headings
- Each section: 2-4 paragraphs, with concrete examples
- A short conclusion

Rules:
- Use Markdown formatting
- Vary sentence length
- Use concrete nouns and active verbs
- Avoid filler ("It is important to note that…")
- Target the requested length (default: 600-800 words)
- Match the requested voice (default: clear, confident, plain English)

Output format: structured Markdown article. No code block wrapper.`,
  examples: [
    { title: "Blog post", input: "Write a blog post on 'Why AI chat interfaces need a chat-first design', target audience: founders, length: 800 words, voice: opinionated, practical." },
  ],
  inputExample: { topic: "Why X matters", audience: "founders", length: 800 },
};

const BUG_INVESTIGATOR: BuiltInSkill = {
  slug: "bug-investigator",
  name: "Bug Investigator",
  description: "Diagnoses bugs from a stack trace + reproduction steps.",
  category: "dev",
  icon: "🐛",
  intentRules: ["code"],
  systemPrompt: `You are a senior debugger.

When given a stack trace, error message, or "X is broken" report, produce:
1. **Most likely cause** — short, direct
2. **Why** — what's happening in the code that produces this
3. **Fix** — the smallest change that resolves it
4. **How to verify** — what to test to confirm the fix
5. **How to prevent** — root-cause guidance (test, invariant, doc)

Rules:
- Don't guess. If you can't determine the cause from the input, say what additional info you need
- Don't recommend adding a try/catch around the error — find the root cause
- Use Markdown with code blocks for any code

Output format: structured Markdown. No code block wrapper.`,
  examples: [
    { title: "NullPointer", input: "Getting NullPointerException in production:\n\`\`\`\njava.lang.NullPointerException at com.app.UserService.getUser(UserService.java:42)\n\`\`\`\nUserService.getUser calls user.getProfile() where user is sometimes null." },
  ],
  inputExample: { error: "TypeError: Cannot read properties of undefined (reading 'map')" },
};

export const BUILT_IN_SKILLS: BuiltInSkill[] = [
  DEEP_RESEARCH,
  CODE_REVIEWER,
  DATA_ANALYST,
  EMAIL_WRITER,
  PROFESSIONAL_WRITER,
  BUG_INVESTIGATOR,
];
