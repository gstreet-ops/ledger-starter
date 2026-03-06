# GStreet Ledger

## System Goals
- Personal accounting + tax tool for a US, Georgia-based single-member LLC
  (disregarded entity, Schedule C filer).
- Maintains a correct double-entry ledger mapping accounts/tags to IRS Schedule C
  lines and Georgia Form 500 categories.
- AI (Claude) is advisory only: proposes categorizations and explanations.
  Backend enforces invariants and auditability. Human approves all postings.
- Priorities: correctness > explainability > simple UX for one power user > scale.

## Stack
- Next.js 15 (App Router) + TypeScript
- Supabase (PostgreSQL) — Account 3 (dedicated, not shared)
- Drizzle ORM for migrations and type-safe queries
- Plaid — bank sync for Chase, Amex, Truist, Citi, USAA
- Tailwind CSS + shadcn/ui
- Anthropic API (Claude Sonnet) for in-app suggestions
- Vercel for deployment

## Tax Scope (v1)
- Disregarded entity / sole proprietorship (no S-corp)
- Schedule C (Form 1040) — all income and expense lines
- Georgia Form 500 pass-through
- Self-employment tax (15.3% with SS wage base cap)
- NO home office (Form 8829) — not claiming
- NO CPA — self-filing, exports are for own reference
- Quarterly estimated tax reminders (federal 1040-ES + GA)

## Key Invariants
1. Every transaction must balance: SUM(debit) = SUM(credit) per transaction_id.
2. Import rows are never deleted — they're the audit trail for raw bank data.
3. Claude suggestions are stored as JSONB but never auto-applied.
4. All financial amounts use numeric(12,2) — never floating point.
5. Plaid access tokens are encrypted at rest. Never exposed to client.

## Conventions
- All monetary values in USD cents internally, displayed as dollars.
- Dates in UTC, displayed in ET (Eastern Time).
- Account codes follow standard numbering: 1xxx assets, 2xxx liabilities,
  3xxx equity, 4xxx income, 5xxx-6xxx expenses.
- Migrations via Drizzle Kit. Never hand-edit the DB.

## Directory Structure
```
src/
  app/          — Next.js App Router pages + layouts
  components/   — React components (shadcn/ui based)
  lib/
    db/         — Drizzle schema, migrations, connection
    plaid/      — Plaid client, Link integration, sync service
    services/   — Business logic (ledger, categorization, tax)
    ai/         — Anthropic API integration (suggest, explain, narrate)
  types/        — Shared TypeScript types
```

## Cross-Project Context
Read C:\Users\brian\projects\PROJECT_REGISTRY.md for workspace-wide context.
This project is standalone (Account 3). No shared infra with other projects.
