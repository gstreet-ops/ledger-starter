# Demo → Deploy Experience Fix

Read CLAUDE.md for system goals and .claude/context.md for project state.

## Context

The demo at ledger-starter.vercel.app has no clear path from "exploring the demo" to
"deploying my own instance." There's no demo banner visible, the demo data shows $0 YTD
(transactions are from 2024), and there's no call-to-action anywhere. Fix all four issues.

## Task 1: Update demo data to 2026 dates

Update `seed/demo-data.ts`:
- Change ALL transaction dates from 2024 to 2026 (January through May 2026)
- Keep the same descriptions, amounts, and account mappings
- This ensures the dashboard shows real-looking YTD numbers when viewing the demo

Then run the seed update against the live Supabase database:
- Connect to: postgresql://postgres.fmbfoqmlkozxdmruncho:AXmXVdxi9vJrPkjw@aws-1-us-east-2.pooler.supabase.com:6543/postgres
- Delete existing demo transactions (WHERE memo = 'DEMO')
- Re-run the demo data seed with 2026 dates
- Verify the transactions exist with: SELECT count(*) FROM transactions WHERE memo = 'DEMO'

## Task 2: Fix the demo banner

The `src/components/demo-banner.tsx` component exists but may not be rendering.
Check `src/app/layout.tsx` to ensure the DemoBanner component is included and visible.

The demo banner should:
- Appear at the top of every page when the current user's email matches NEXT_PUBLIC_DEMO_EMAIL
- Be a fixed amber/yellow banner: "You're viewing a demo of Ledger Starter"
- Include TWO buttons:
  - "Deploy Your Own" → links to the Vercel deploy button URL (same URL from README)
  - "View on GitHub" → links to https://github.com/gstreet-ops/ledger-starter
- Be dismissable (X button) but reappear on page navigation

The deploy button URL is:
https://vercel.com/new/clone?repository-url=https://github.com/gstreet-ops/ledger-starter&project-name=my-ledger&integration-ids=oac_jUduyjQgOyzev1fjrW83NYOv&env=PLAID_CLIENT_ID,PLAID_SECRET,PLAID_ENV,PLAID_TOKEN_ENCRYPTION_KEY,ANTHROPIC_API_KEY&envDescription=Plaid%20and%20Anthropic%20are%20optional.%20Supabase%20env%20vars%20are%20set%20automatically%20by%20the%20integration.&envLink=https://github.com/gstreet-ops/ledger-starter/blob/main/SETUP.md

## Task 3: Add "Get Your Own" CTA to sidebar footer

In `src/components/app-sidebar.tsx`, add a call-to-action in the sidebar footer
that ONLY appears when the user is the demo user (email matches NEXT_PUBLIC_DEMO_EMAIL).

Design:
- Small card below the Help and Sign Out links
- Indigo/blue accent background
- Text: "Like what you see?"
- Button: "Deploy Your Own" → links to the Vercel deploy button URL
- Keep it subtle but visible — not overwhelming

## Task 4: Create a landing page at /

Currently `/` (src/app/page.tsx) likely redirects to /dashboard or /login.
Replace it with a proper landing page that serves as the entry point for new visitors.

The landing page should:
- NOT require authentication (it's public)
- Have a clean, professional design using the existing Tailwind + shadcn/ui styling

Content structure:
1. **Hero section:**
   - Title: "Ledger Starter"
   - Subtitle: "Open-source accounting & tax tool for US small businesses"
   - Two prominent buttons:
     - "Try the Demo" → links to /demo (auto-login)
     - "Deploy Your Own" → links to the Vercel deploy button URL

2. **Feature highlights (3-4 cards):**
   - "Double-Entry Accounting" — balanced debits/credits, chart of accounts
   - "Bank Sync" — Plaid integration or CSV import
   - "Tax Ready" — Schedule C, state tax, quarterly estimates
   - "AI-Powered" — intelligent categorization and narrative reports

3. **How it works (3 steps):**
   - "1. Deploy" — One-click Vercel deploy with Supabase auto-provisioning
   - "2. Configure" — Setup wizard for your entity type, state, and tax settings
   - "3. Start Tracking" — Connect your bank or import statements

4. **Tech stack badges:**
   - Next.js, Supabase, Plaid, Claude AI, Tailwind, shadcn/ui

5. **Footer:**
   - GitHub link, MIT License

Keep it simple — one page, no scroll-jacking, no animations. Clean and professional.
The page should feel like a polished open-source project landing page.

## Task 5: Update middleware to allow public access to landing page

Check `src/middleware.ts` — the landing page at `/` must be accessible without authentication.
Also ensure `/demo` and `/login` remain public. The middleware should only require auth
for the app pages (dashboard, accounts, transactions, etc.).

## Task 6: Verify the build

After all changes, run `npm run build` and fix any TypeScript errors.
The build must pass cleanly.

## Important constraints:
- The landing page must NOT require authentication
- The demo banner must only show for the demo user, not regular users
- The sidebar CTA must only show for the demo user
- Demo data dates must be in 2026 (current year) so YTD metrics look real
- The deploy button URL must be identical to the one in README.md
- Don't break the existing /login flow — authenticated users should still go to /dashboard
- The landing page should be statically renderable (no DB queries, no force-dynamic)
