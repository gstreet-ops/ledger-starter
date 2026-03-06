Read CLAUDE.md for system goals and .claude/context.md for where we left off. Today we're building the quarterly estimated tax calculator and dashboard enhancements (Phase 4):

1. Create src/lib/services/quarterly-estimates.ts — Quarterly estimate engine:
   - quarterlyEstimate(year, quarter): compute estimated payment based on YTD income/expenses
   - Uses tax.ts functions for federal income + SE tax + Georgia tax
   - Annualizes YTD profit to project full-year liability, then divides by 4
   - Tracks safe harbor: prior year tax / 4 as minimum payment
   - Returns { federalIncome, selfEmployment, georgia, total, dueDate, quarter }

2. Create src/app/tax/quarterly/page.tsx — Quarterly estimates page:
   - Show all 4 quarters for current year with: due date, estimated amount, paid amount, status (upcoming/due/overdue/paid)
   - Input field to record actual payments made per quarter
   - Warning banner if next payment is due within 30 days
   - YTD projection: "At current pace, your full-year tax liability is ~$X"
   - Comparison: estimated vs actual YTD

3. Create src/app/tax/quarterly/actions.ts — Server actions:
   - recordPayment(year, quarter, amount, datePaid): store quarterly payment
   - getQuarterlyHistory(year): fetch all quarterly estimates and payments
   - Add estimated_tax_payments table to schema if not exists (year, quarter, estimated_amount, paid_amount, paid_date)

4. Update src/app/dashboard/page.tsx — Enhanced dashboard:
   - Add "Next Quarterly Estimate" card: shows amount due, due date, days until due
   - Color coding: green (>30 days), yellow (15-30 days), red (<15 days or overdue)
   - Add "Tax Summary" card: YTD federal + SE + GA estimated liability
   - Add monthly expense trend (last 6 months bar chart)

5. Update sidebar navigation — Add "Quarterly Estimates" under Tax section

6. Run a full build (npx next build) to verify everything compiles cleanly before committing.

Commit after each logical step with descriptive messages. Update .claude/context.md when done. Push to origin/main.
