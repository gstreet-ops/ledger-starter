Read CLAUDE.md for system goals and .claude/context.md for where we left off. Today we're building polish and intelligence features (Phase 5):

1. Create src/lib/ai/narrate.ts — Claude-powered narrative explanations:
   - narratePnL(pnlData, period): given P&L data, generate a plain-English summary ("Your revenue grew 15% this month, driven by...")
   - explainTransaction(transaction, lines): explain what a transaction means in tax context
   - periodComparison(currentPeriod, previousPeriod): compare two periods and highlight significant changes
   - Uses ANTHROPIC_API_KEY from env, gracefully returns null if not set

2. Create src/app/reports/narrative/page.tsx — "Explain This Period" view:
   - Date range picker (default: current month)
   - "Generate Narrative" button that calls Claude to explain the period
   - Shows P&L data alongside Claude's narrative explanation
   - Period-over-period comparison: select two periods, see what changed and why

3. Update src/app/dashboard/page.tsx — Dashboard intelligence:
   - "Month in Review" card: auto-generated narrative summary of current month vs previous
   - Top 5 expense categories this month with trend arrows (up/down vs last month)
   - Cash runway estimate: at current burn rate, how many months of runway
   - Effective tax rate display: estimated taxes / net profit

4. Create src/app/reports/export/route.ts — Month-end snapshot export:
   - GET endpoint that generates a comprehensive month-end report
   - Includes: P&L summary, top expenses, tax snapshot, narrative (if Anthropic key available)
   - Export as downloadable markdown file
   - Filename: "month-end-{year}-{month}.md"

5. Create src/app/settings/page.tsx — Settings page:
   - Plaid connection status overview
   - Environment check: show which API keys are configured (without revealing values)
   - Fiscal year setting (default: calendar year)
   - Default date range for reports
   - Add "Settings" to sidebar navigation

6. Polish the home page src/app/page.tsx:
   - Redirect to /dashboard if user is authenticated
   - Show a simple landing/login page if not authenticated

7. Run a full build (npx next build) to verify everything compiles cleanly before committing.

Commit after each logical step with descriptive messages. Update .claude/context.md to reflect all phases complete. Push to origin/main.
