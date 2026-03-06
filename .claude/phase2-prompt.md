Read CLAUDE.md for system goals and .claude/context.md for where we left off. Today we're building the double-entry ledger views and reports (Phase 2):

1. Update src/app/accounts/page.tsx — Chart of Accounts view:
   - Table showing all accounts: code, name, type, Schedule C line, active status
   - Current balance for each account (computed from transaction_lines)
   - Group by type (assets, liabilities, equity, income, expenses)
   - Collapsible sections per type
   - "Add Account" button with a form dialog (code, name, type, Schedule C line)
   - Edit/deactivate existing accounts

2. Create src/app/transactions/journal/page.tsx — Transaction journal view:
   - Table of all posted transactions: date, description, status, total amount
   - Expandable rows showing transaction_lines (account, debit, credit, memo)
   - Filter by: date range, account, status (pending/posted/voided)
   - Sort by date (default newest first), amount, description
   - Pagination
   - Click a transaction to see full detail with all lines

3. Create src/app/transactions/new/page.tsx — Manual transaction entry:
   - Date picker, description field, memo field
   - Dynamic line items: add rows with account dropdown, debit/credit amount, memo
   - Real-time validation: show running total of debits vs credits
   - Cannot submit unless SUM(debit) = SUM(credit)
   - "Add Line" button to add more rows
   - Submit creates transaction + transaction_lines via server action

4. Create src/lib/services/reports.ts — Report computation functions:
   - trialBalance(): for each account, sum all debits and credits, show balance
   - profitAndLoss(startDate, endDate): income minus expenses for the period
   - balanceSheet(asOfDate): assets = liabilities + equity snapshot
   - cashFlow(startDate, endDate): summarize cash movements by category

5. Create src/app/dashboard/page.tsx — Dashboard with key metrics:
   - YTD Revenue (sum of income accounts)
   - YTD Expenses (sum of expense accounts)
   - YTD Net Profit (revenue - expenses)
   - Current cash balance (sum of bank/checking accounts)
   - Recent transactions list (last 10)
   - Mini P&L chart (monthly income vs expenses using recharts or similar)

6. Create src/app/reports/page.tsx — Reports page:
   - Trial Balance view
   - P&L statement with date range picker
   - Add "Reports" to the sidebar navigation

7. Update src/lib/db/queries.ts with:
   - getAccountBalances: aggregate debits/credits per account
   - getTransactionsWithLines: fetch transactions with their lines joined
   - createTransaction: insert transaction + lines in a single db transaction
   - getTransactionById: fetch single transaction with lines
   - voidTransaction: mark transaction as voided

Commit after each logical step with descriptive messages. Update .claude/context.md when done. Push to origin/main.
