# Ledger Starter

> **Template repository.** Before building, complete the `/setup` wizard to configure
> your entity type, state, and filing method. See `SETUP.md` for the full onboarding guide.

## System Goals
- Personal accounting + tax tool for US small businesses: sole proprietors,
  single-member LLCs, S-Corps, and partnerships.
- Maintains a correct double-entry ledger mapping accounts/tags to IRS Schedule C
  lines (or the appropriate schedule for your entity) and your state's income tax form.
- AI (Claude) is advisory only: proposes categorizations and explanations.
  Backend enforces invariants and auditability. Human approves all postings.
- Priorities: correctness > explainability > simple UX for one power user > scale.

## Stack
- Next.js 15 (App Router) + TypeScript
- Supabase (PostgreSQL) — create a dedicated project, see SETUP.md
- Drizzle ORM for migrations and type-safe queries
- Plaid — bank sync (sandbox for dev, production for live data)
- Tailwind CSS + shadcn/ui
- Anthropic API (Claude Sonnet) for in-app suggestions
- Vercel for deployment

## Configuration (set during /setup wizard)
- **Entity type**: {ENTITY_TYPE} — e.g. Sole Prop / SMLLC / S-Corp / Partnership
- **State**: {STATE} — drives state tax form, rates, and quarterly deadlines
- **Filing method**: {FILING_METHOD} — Self-file or CPA export mode
- **Tax year start**: {TAX_YEAR_START} — Jan 1 (calendar) or fiscal year
- **Plaid enabled**: {PLAID_ENABLED}

These values are persisted in the `user_settings` table and read at runtime.
Do not hardcode state or entity logic — always derive from `user_settings`.

## First-Time Setup
1. Copy `.env.local.example` to `.env.local` and fill in your API keys.
2. Run `npm install` and `npx drizzle-kit push` to apply migrations.
3. Navigate to `/setup` and complete the wizard.
4. (Optional) Run `npx tsx scripts/seed-demo-data.ts` to load demo transactions.
5. Create a Supabase Auth user and log in at `/login`.

## Key Invariants
1. Every transaction must balance: SUM(debit) = SUM(credit) per transaction_id.
2. Import rows are never deleted — they're the audit trail for raw bank data.
3. Claude suggestions are stored as JSONB but never auto-applied.
4. All financial amounts use numeric(12,2) — never floating point.
5. Plaid access tokens are encrypted at rest. Never exposed to client.
6. State-specific tax logic must read from `user_settings.state` — never hardcoded.

## Conventions
- All monetary values in USD cents internally, displayed as dollars.
- Dates in UTC, displayed in user's local timezone (configurable in settings).
- Account codes follow standard numbering: 1xxx assets, 2xxx liabilities,
  3xxx equity, 4xxx income, 5xxx-6xxx expenses.
- Migrations via Drizzle Kit. Never hand-edit the DB.

## Directory Structure
```
src/
  app/          — Next.js App Router pages + layouts
    setup/      — First-run wizard (entity type, state, filing method)
  components/   — React components (shadcn/ui based)
  lib/
    db/         — Drizzle schema, migrations, connection
    plaid/      — Plaid client, Link integration, sync service
    services/   — Business logic (ledger, categorization, tax)
    ai/         — Anthropic API integration (suggest, explain, narrate)
  types/        — Shared TypeScript types
seed/
  demo-data.ts  — Fictional demo transactions for first-run experience
```
