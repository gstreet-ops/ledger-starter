# Demo Polish — Banner Fix + Navigation Back to Landing Page

Read CLAUDE.md for system goals and .claude/context.md for project state.

## Context

Two issues with the demo experience:
1. Demo banner isn't showing — likely because NEXT_PUBLIC_DEMO_EMAIL isn't set in Vercel
2. No way to get back to the landing page from inside the demo

## Task 1: Add missing Vercel env vars

Run the following commands to add the demo env vars to Vercel production:

```
cd C:\Users\brian\projects\ledger-starter
echo "demo@ledger-starter.app" | vercel env add NEXT_PUBLIC_DEMO_EMAIL production
echo "demo@ledger-starter.app" | vercel env add DEMO_EMAIL production
echo "LedgerDemo2026!" | vercel env add DEMO_PASSWORD production
echo "https://ledger-starter.vercel.app" | vercel env add NEXT_PUBLIC_SITE_URL production
```

If the `vercel` CLI isn't available or these fail, document the env vars that need
to be added manually in the Vercel dashboard.

## Task 2: Add "Back to Home" link in sidebar for demo users

In `src/components/app-sidebar.tsx`, add a link back to the landing page `/` for demo users.
This should appear at the TOP of the sidebar, above the nav items, as a subtle link:
- Text: "← Back to Ledger Starter"
- Links to `/` (the landing page)
- Only visible for demo users (email matches NEXT_PUBLIC_DEMO_EMAIL)
- Styled subtly — small text, muted color, not a big button

## Task 3: Add some color/polish to the landing page

The landing page at `src/app/page.tsx` is functional but plain. Add some visual polish:

1. **Hero section**: Add a subtle gradient background (e.g., from white to slate-50 or a very light blue)
2. **Feature cards**: Add colored icon backgrounds that differentiate each card:
   - Double-Entry: blue accent
   - Bank Sync: green accent
   - Tax Ready: amber accent
   - AI-Powered: purple accent
3. **"How It Works" numbers**: Make the numbered circles use the primary brand color
4. **Deploy button**: Make the "Deploy Your Own" button more prominent — consider using
   a gradient or a stronger contrasting color so it stands out from the "Try Demo" button
5. **Add a subtle hero illustration or icon** — even just a larger lucide icon like
   BookOpen or Calculator centered above the title to give the page visual weight

Keep it clean and professional — don't overdo it. The goal is "polished open-source project"
not "marketing site."

## Task 4: Redeploy to apply env vars

After setting env vars, trigger a redeploy:
```
cd C:\Users\brian\projects\ledger-starter
vercel --prod --yes
```

## Task 5: Verify the build

Run `npm run build` and fix any TypeScript errors. Build must pass cleanly.
