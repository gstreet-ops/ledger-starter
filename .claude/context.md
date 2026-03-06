# Ledger Starter — Project Context

> Template file. Replace all {PLACEHOLDER} values after running the /setup wizard.
> Maintained by Claude across sessions for build continuity.

## Current State
- **Active branch**: main
- **Last deployment**: not yet deployed
- **Supabase project**: {YOUR_SUPABASE_PROJECT_ID} — set after creating your Supabase project
- **Plaid**: {PLAID_ACCOUNT_EMAIL} — set after creating your Plaid developer account
- **Phase**: Template scaffold complete — run /setup wizard to begin

## Setup Status
- [ ] `.env.local` filled in from `.env.local.example`
- [ ] `npm install` run
- [ ] `npx drizzle-kit push` run against your Supabase project
- [ ] `/setup` wizard completed (entity type, state, filing method)
- [ ] Supabase Auth user created
- [ ] Demo data seeded (optional): `npx tsx scripts/seed-demo-data.ts`

## Architecture Notes
- Next.js 15 + Supabase + Drizzle + Plaid + Anthropic API
- See CLAUDE.md for full stack and conventions
- user_settings table drives all entity/state/filing behavior
- Schema has 10 tables (9 core + user_settings), seed has full Chart of Accounts

## Session Log
### Template created 2026-03-06
- Scaffolded from gstreet-ledger (private instance)
- src/, drizzle/ migrations, scripts copied as-is (generic double-entry)
- CLAUDE.md rewritten as state-agnostic template
- context.md replaced with placeholder version
- user_settings schema + migration added
- /setup wizard page added (multi-step: entity → state → filing → Plaid → confirm)
- seed/demo-data.ts added with fictional Acme Consulting transactions
- SETUP.md onboarding doc written
