# Ledger Starter — Fork Cleanup from GStreet Ledger

Read CLAUDE.md for system goals and .claude/context.md for project state.

This project was forked from gstreet-ledger (a personal accounting tool hardcoded for a Georgia single-member LLC). Ledger-starter is being established as its own independent project — a polished, state-agnostic boilerplate for US small business accounting. Clean up ALL gstreet/Georgia-specific references and make it fully template-driven.

## Task 1: Package identity
- In package.json, change `"name"` from `"gstreet-ledger"` to `"ledger-starter"`

## Task 2: Remove GStreet branding
- src/components/app-sidebar.tsx line ~62: Change "GStreet Ledger" to "Ledger Starter" (or better: read business name from user_settings, fall back to "Ledger Starter")
- src/lib/plaid/actions.ts lines 12-13: Change `client_user_id: "gstreet-ledger-user"` to `"ledger-starter-user"` and `client_name: "GStreet Ledger"` to `"Ledger Starter"`
- src/app/help/page.tsx line ~201: Change the GitHub issues URL from `gstreet-ops/gstreet-ledger` to `gstreet-ops/ledger-starter`

## Task 3: Remove Georgia hardcoding from AI prompts
These AI system prompts currently say "Georgia" — they should read the state from user_settings instead.

- src/lib/ai/narrate.ts (TWO places, lines ~38 and ~138): The system prompt says "Schedule C filer, Georgia". Change to dynamically inject the state from user_settings. Add a `state` parameter to the narrate functions, or fetch user_settings inside them. Example: "Schedule C filer, {state_label}"
- src/lib/ai/suggest.ts (line ~57): Same issue — "Schedule C filer, Georgia" should be dynamic based on user_settings state.

## Task 4: Clean up FAQ data
- src/lib/help/faq-data.ts: Search for any "Georgia" or "GA" hardcoded references in FAQ answers. Replace with generic state-agnostic language like "your state" or "the state you selected during setup". The FAQ should work for any US state.

## Task 5: Fix GA fallback in tax service
- src/lib/services/tax.ts line ~234: `STATE_TAX_RATES[state.toUpperCase()] ?? STATE_TAX_RATES["GA"]` — change the fallback from "GA" to throw an error or return a "state not configured" message. A Texas user shouldn't silently get Georgia tax rates.
- Remove the deprecated `georgiaIncomeTax` function (lines ~249-257) — it's no longer needed in ledger-starter.

## Task 6: Rename gaFormCategory column
The schema has a column called `ga_form_category` on the accounts table. This is Georgia-specific naming. Rename it:
- In src/lib/db/schema.ts: Change `gaFormCategory` to `stateFormCategory` (and the SQL column from `ga_form_category` to `state_form_category`)
- Create a new Drizzle migration for this rename: `ALTER TABLE accounts RENAME COLUMN ga_form_category TO state_form_category;`
- Search the entire codebase for `gaFormCategory` and `ga_form_category` and update all references to use `stateFormCategory` / `state_form_category`

## Task 7: Update context files
- .claude/context.md: Update the "Current State" section:
  - Active branch: main
  - Phase: Fork cleanup complete — independent from gstreet-ledger
  - Note that this project has its own Supabase (fmbfoqmlkozxdmruncho) and Vercel project
- Add a session log entry for today's cleanup

## Task 8: Verify the build
After all changes, run `npm run build` and fix any TypeScript errors. The build must pass cleanly.

## Important constraints:
- Do NOT change the database schema in destructive ways — only the column rename (Task 6)
- The `gaFormCategory` values in seed/setup.ts and seed/demo-data.ts also need updating to `stateFormCategory`
- All AI prompt changes should read state from user_settings (the data is already there from the /setup wizard)
- Keep the demo route, demo banner, and demo mode working — those are part of ledger-starter's identity
