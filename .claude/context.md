# Ledger Starter — Project Context

> Template file. Replace all {PLACEHOLDER} values after running the /setup wizard.
> Maintained by Claude across sessions for build continuity.

## Current State
- **Active branch**: main
- **Last deployment**: not yet deployed
- **Supabase project**: fmbfoqmlkozxdmruncho
- **Plaid**: {PLAID_ACCOUNT_EMAIL} — set after creating your Plaid developer account
- **Phase**: Fork cleanup complete — independent from gstreet-ledger
- **Note**: This project has its own Supabase (fmbfoqmlkozxdmruncho) and Vercel project

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

### Fork cleanup 2026-03-07
- Renamed package from gstreet-ledger to ledger-starter
- Replaced all GStreet branding (sidebar, Plaid, help page GitHub URL)
- Made AI prompts (narrate, suggest) read state dynamically from user_settings
- Cleaned FAQ data: removed Georgia-specific entries, made state-agnostic
- Removed georgiaIncomeTax function; all callers now use stateTax with user_settings state
- Removed GA fallback in stateTax — returns "Not configured" for unknown states
- Renamed ga_form_category column to state_form_category (migration 0005)
- Updated all references across schema, queries, seed files, and UI
