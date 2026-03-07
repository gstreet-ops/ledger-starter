# Demo Experience Fixes — Round 2

Read CLAUDE.md for system goals and .claude/context.md for project state.

## Context

Testing the live demo at ledger-starter.vercel.app revealed several issues:
1. Dashboard shows $0 YTD — demo transactions are status "pending", dashboard only counts "posted"
2. Demo banner not rendering — likely needs the demo user check on the server side
3. "← Back to Ledger Starter" link not visible in sidebar
4. Sidebar CTA card not visible for demo user

## Task 1: Fix demo transaction status

Connect to the live database and update all demo transactions to "posted":
```
postgresql://postgres.fmbfoqmlkozxdmruncho:AXmXVdxi9vJrPkjw@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

Run: `UPDATE transactions SET status = 'posted' WHERE memo = 'DEMO';`

Also update `seed/demo-data.ts` to set status "posted" when inserting, so future
seeds don't have this problem. Add `status: "posted"` to the insert values.

Verify: Run a query to confirm all 22 transactions are now "posted".

## Task 2: Debug and fix the demo banner

The DemoBanner component in `src/components/demo-banner.tsx` checks
`user?.email === process.env.NEXT_PUBLIC_DEMO_EMAIL` client-side.

Potential issues:
- The env var might not be available client-side (check NEXT_PUBLIC_ prefix)
- The Supabase getUser() call might fail silently
- The component might be rendering but hidden by CSS

Add console.log debugging temporarily, or better: change the approach to pass
`isDemo` as a prop from the server component layout where we already have the
user session. The `(app)/layout.tsx` could check the user email server-side
and pass it down.

The fix should:
- Check the demo user on the server side in `src/app/(app)/layout.tsx`
- Pass `isDemo` as a prop to DemoBanner
- DemoBanner renders if isDemo is true (no client-side auth check needed)

## Task 3: Fix sidebar "Back to Ledger Starter" link

The link was added in `src/components/app-sidebar.tsx` but isn't rendering.
Same issue as the banner — the demo user check is client-side and may be failing.

Fix: Pass `isDemo` from the server layout to AppSidebar as a prop, and use
that to conditionally show the back link and the "Like what you see?" CTA card.

## Task 4: Verify all demo-specific UI elements

After fixes, verify these all work:
1. Demo banner at top with "Deploy Your Own" and "View on GitHub" buttons
2. "← Back to Ledger Starter" link at top of sidebar
3. "Like what you see? Deploy Your Own" card at bottom of sidebar
4. Dashboard shows non-zero YTD numbers from the 22 posted transactions
5. "Recent Transactions" shows actual transactions

## Task 5: Commit, push, and verify

Commit all changes, push to main (auto-deploys to Vercel).
After deploy completes, note any issues that need further attention.

## Task 6: Verify the build

Run `npm run build` and fix any TypeScript errors. Build must pass cleanly.

## Important constraints:
- The demo user check should happen SERVER-SIDE in the layout, not client-side
- Pass isDemo as a prop to avoid client-side auth calls that may fail
- Demo transactions must be "posted" status for YTD metrics to work
- Update the seed file so future seeds create posted transactions
- Don't break the regular (non-demo) user experience
