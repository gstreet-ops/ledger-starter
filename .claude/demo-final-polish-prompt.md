# Demo Polish — Final Round

Read CLAUDE.md for system goals and .claude/context.md for project state.

## Context

The demo is mostly working but needs final polish. The demo banner, sidebar CTA, and
back link are all rendering. Dashboard shows real data. But several things need cleanup.

## Task 1: Rename back link

In `src/components/app-sidebar.tsx`, change "← Back to Ledger Starter" to
"← Ledger Starter Home". This makes it clearer the link goes to the landing page.

## Task 2: Move Community out of top-level sidebar

Remove "Community" from the main sidebar navigation list. Instead:
- Add a "Community" tab or section inside the Settings page (`src/app/(app)/settings/`)
- The Settings page should have the existing settings content plus a "Community" section
  that contains the fingerprint diff, sharing toggle, and share button
- The /community route can remain, but it should be accessed from Settings, not the sidebar
- Keep the nudge system on the dashboard — that's how users discover community features
  when they have changes worth sharing

## Task 3: Fix demo transaction status in the live database

Connect to the live Supabase and verify/fix transaction status:
```
postgresql://postgres.fmbfoqmlkozxdmruncho:AXmXVdxi9vJrPkjw@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

Run: `UPDATE transactions SET status = 'posted' WHERE memo = 'DEMO' AND status = 'pending';`

CC already did this in the last round but verify the dashboard query is actually counting
these transactions. If YTD still shows $0, the issue is in the dashboard query — check
`src/app/(app)/dashboard/page.tsx` for how it queries posted transactions.

## Task 4: Pre-fill narrative date range for demo

In `src/app/(app)/reports/narrative/page.tsx` or `narrative-view.tsx`:
- Default the "Start Date" to January 1 of the current year (2026-01-01)
- Default the "End Date" to today's date
- This ensures demo visitors clicking "Generate Narrative" get results immediately
  without having to manually adjust dates

## Task 5: Check Anthropic API key in Vercel

Verify ANTHROPIC_API_KEY is set in Vercel production env vars. If not, add it.
The demo needs this for the AI narrative and categorization features to work.

Check by running: `vercel env ls` from the project directory.
If ANTHROPIC_API_KEY is missing, it needs to be added from the .env.local file.

## Task 6: Verify the build and commit

Run `npm run build`, fix any errors. Commit and push to main.

## Important constraints:
- The Community page route should still work at /community (for direct links)
- The Settings page Community section should link to /community for the full view
- Don't break the nudge system — it should still show on the dashboard
- Sidebar should be cleaner without Community cluttering the nav
- The blue dot badge (unshared changes indicator) moves to the Settings nav item
