Read CLAUDE.md for system goals and .claude/context.md for where we left off. 

We have 48 sandbox transactions from Plaid sitting in import_rows. Before connecting real banks, we need to test the full pipeline end-to-end with this synthetic data:

1. First, verify the chart of accounts is seeded (should have 33 accounts from the seed run).

2. Create src/lib/db/seed-test-data.ts — Generate additional realistic test transactions:
   - 20 expense transactions across different Schedule C categories (software subscriptions, office supplies, travel, meals, advertising, professional services, etc.)
   - 5 income transactions (client payments of varying amounts)
   - Use realistic merchant names and descriptions
   - Spread across Jan-Mar 2026 date range
   - Insert directly into transactions + transaction_lines tables (already posted, to test reports)

3. Test the categorization flow with the 48 Plaid sandbox transactions:
   - Create 5-10 categorization rules for common patterns (e.g., "KFC" → Meals, "Uber" → Travel, "United Airlines" → Travel)
   - Run the categorization engine on the pending import_rows
   - Verify rules match correctly

4. Test the posting flow:
   - Accept a few categorized transactions through the review UI actions
   - Verify double-entry transaction_lines are created correctly (debit expense, credit bank)
   - Verify SUM(debit) = SUM(credit) for each posted transaction

5. Test reports with the seeded + posted data:
   - Verify Dashboard shows non-zero YTD metrics
   - Verify P&L report shows income and expenses
   - Verify Trial Balance balances
   - Verify Tax page shows Schedule C line totals
   - Verify Quarterly Estimates compute non-zero values

6. Run the seed-test-data.ts script to populate test transactions, then verify all reports update.

7. Run a full build to ensure no errors.

Commit the seed-test-data.ts and any categorization rules. Update .claude/context.md. Push to origin/main.
