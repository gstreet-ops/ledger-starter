> **START OF SESSION:** Read this file fully before doing anything else.
> Path: `C:\Users\brian\projects\gstreet-ledger\.claude\ledger-template-plan.md`
> **CREATED:** 2026-03-06

# GStreet Ledger — Template / Starter Kit Plan

## Vision
Spin off a clean, shareable version of gstreet-ledger as a small business
accounting starter kit. Target audience: US small businesses, sole proprietors,
single-member LLCs. Not Georgia-specific — user picks their own state.

## Two-Repo Strategy
- `gstreet-ledger` (private) — Brian's personal instance, real data, stays as-is
- `ledger-starter` (public template) — clean no-data version, wizard-first setup

## What's Already Clean / Reusable (no changes needed)
- All of `src/` — Next.js app, components, services, AI integration
- `drizzle/` migrations — schema is generic double-entry bookkeeping
- Plaid integration, AI categorization engine, tax computation service
- `.env.local.example` — already has no real values
- Phase prompts in `.claude/` — valuable build playbook

## What Needs to Change for Template
1. `CLAUDE.md` — remove Georgia/Schedule C hardcoding, replace with placeholders
   - Entity type: `{ENTITY_TYPE}` (Sole prop / SMLLC / S-Corp / Partnership)
   - State: `{STATE}` — user picks during wizard
   - Add "First-Time Setup" section pointing to /setup wizard
2. `.claude/context.md` — replace Supabase project IDs, account emails with placeholders
3. Seed data — replace with fictional demo transactions (no real account data)
4. Add `SETUP.md` — onboarding doc explaining wizard flow

## Wizard (/setup page) — First-Run Flow
New `/setup` route that collects:
1. Business entity type (Sole prop / SMLLC / S-Corp / Partnership)
2. State (dropdown — drives state tax form + rates)
3. Filing method (Self-file / CPA)
4. Bank connections (which banks to connect via Plaid)
5. Tax year start (Jan 1 or fiscal year)

Wizard writes to a `user_settings` table that drives:
- Which tax forms appear (Schedule C, state forms)
- Quarterly estimate logic
- Chart of Accounts defaults
- What exports get generated

## user_settings Table (new, needs schema + migration)
```
id, entity_type, state, filing_method, tax_year_start,
fiscal_year_end, plaid_enabled, created_at, updated_at
```

## Demo Data Strategy
- Small set of fictional transactions for first-run experience
- `seed/demo-data.ts` — clearly labeled as demo, easy to purge
- Existing `scripts/purge-synthetic-data.ts` already exists — extend it

## Positioning
- Small business accounting + tax tool
- AI-assisted categorization (Claude)
- State-agnostic (any US state)
- Self-file friendly, but CPA-exportable
- Plaid bank sync from day one

## Next Session — Suggested Work Order
1. Create `ledger-starter` repo (new GitHub repo under gstreet-ops)
2. Copy `src/`, `drizzle/`, scripts, config from gstreet-ledger
3. Rewrite `CLAUDE.md` as state-agnostic template
4. Write `SETUP.md` onboarding doc
5. Add `user_settings` schema + migration
6. Build `/setup` wizard page (multi-step form)
7. Wire wizard output to `user_settings` table
8. Create fictional demo seed data
9. Test full first-run flow (clone → setup → demo data → dashboard)
