Read CLAUDE.md for system goals and .claude/context.md for where we left off. Today we're building tax mapping and reporting (Phase 3):

1. Seed src/lib/db/seed-tax-categories.ts — Tax categories seed data:
   - Schedule C line items: Line 1 (Gross Receipts), Line 8 (Advertising), Line 9 (Car/Truck), Line 10 (Commissions), Line 11 (Contract Labor), Line 15 (Insurance), Line 16a/b (Interest), Line 17 (Legal/Professional), Line 18 (Office), Line 20a/b (Rent/Lease), Line 21 (Repairs), Line 22 (Supplies), Line 23 (Taxes/Licenses), Line 24a (Travel), Line 24b (Meals - 50% deductible), Line 25 (Utilities), Line 26 (Wages), Line 27a (Other Expenses)
   - Georgia Form 500: GA pass-through income category
   - Self-employment tax: SE tax category for net profit

2. Update src/lib/db/schema.ts if needed — Ensure accounts have tax_category_id FK and that tax_categories table has all required fields

3. Create src/lib/services/tax.ts — Tax computation functions:
   - scheduleCReport(year): aggregate all posted transactions by Schedule C line, return line-by-line totals
   - selfEmploymentTax(netProfit): compute SE tax (15.3% on 92.35% of net profit, with SS wage base cap - use 2025 cap of $176,100)
   - georgiaIncomeTax(netProfit): estimate GA state income tax on LLC pass-through (use 2025 GA brackets: 1% to 5.49% graduated)
   - federalIncomeTax(netProfit): rough estimate using 2025 brackets (for quarterly estimate purposes only, not tax advice)
   - quarterlyEstimate(year, quarter): compute estimated federal + SE + GA tax payment due
   - quarterlyDueDates(year): return Q1-Q4 due dates (Apr 15, Jun 15, Sep 15, Jan 15)

4. Update src/app/tax/page.tsx — Tax dashboard:
   - Schedule C Summary: table showing each line item with YTD total
   - Tax Estimate section: federal income tax + SE tax + Georgia tax estimates
   - Quarterly estimates: what's due next, how much, when
   - Year selector (default current year)

5. Create src/app/tax/export/route.ts — Year-end CSV/Excel export:
   - GET endpoint that generates a CSV with: Schedule C line, description, YTD total
   - Include a summary section with net profit, SE tax, estimated federal + GA tax
   - Download as "schedule-c-export-{year}.csv"

6. Create src/app/rules/page.tsx — Categorization rules management:
   - Table of all rules: pattern, match field, target account, priority, hit count, active status
   - Add new rule form (pattern, match field dropdown, account dropdown, priority)
   - Edit/delete/toggle active on existing rules
   - Test a rule: input a sample description, see which rule matches

7. Update src/lib/db/queries.ts with:
   - getTaxCategories: fetch all tax categories
   - getTransactionsByTaxCategory(year): aggregate posted transactions by tax category
   - getScheduleCTotals(year): sum amounts per Schedule C line for the year

Commit after each logical step with descriptive messages. Update .claude/context.md when done. Push to origin/main.
