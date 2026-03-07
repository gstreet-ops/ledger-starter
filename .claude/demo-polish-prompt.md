# Demo Polish — Run 1: Data Completeness + Reset Button

## Context

Ledger Starter is deployed at https://ledger-starter.vercel.app with a demo mode.
The /demo route auto-logs in a demo user and redirects to /dashboard.
Current demo data: 22 posted transactions for "Acme Consulting LLC" (TX, SMLLC).

Several pages are empty or broken for demo users because only `transactions` and
`transaction_lines` were seeded. This prompt fixes that and adds a reset button.

## Task 1: Expand seed/demo-data.ts

Add seeding for the tables that are currently empty. All new seed data should use
the same `DEMO_TAG = "DEMO"` memo convention for purge compatibility.

### 1a. Sync batches + import rows (so Review page has data)

Create 2 `sync_batches` records:
- Batch 1: Jan 2026, status "complete", addedCount: 12
- Batch 2: Mar 2026, status "complete", addedCount: 10

Create `import_rows` for each batch — use the SAME transactions that already exist
in the demo data but as import_rows with status "matched" (simulating that they
came from Plaid and were posted). Include: date, description, amount, the
sync_batch_id, and matchStatus "matched". This makes the Review page show
realistic data without duplicating financial totals.

### 1b. File import batches + rows (so Imports page has data)

Create 1 `file_import_batches` record:
- source: "amex", fileName: "amex-statement-jan-2026.xlsx", fileType: "xlsx"
- accountLast4: "4521", status: "complete", rowCount: 5
- statementPeriodStart: 2026-01-01, statementPeriodEnd: 2026-01-31

Create 5 `file_import_rows` for it — a subset of the Jan 2026 expenses:
Notion, GitHub Copilot, Adobe CC, Staples, Capital Grille.
parsedDate, parsedDescription, parsedAmount (negative for charges), matchStatus: "matched".

### 1c. Categorization rules (so Rules page has data)

Seed 3 `categorization_rules`:
1. Pattern "GitHub" → account 6010 (Software & Subscriptions)
2. Pattern "Adobe" → account 6010 (Software & Subscriptions)  
3. Pattern "Southwest|United|Delta|American Airlines" → account 6060 (Travel & Lodging)

Look up account IDs by code from the accounts table, same as demo-data.ts does.

### 1d. Estimated tax payments (so Quarterly page has data)

Seed 2 `estimated_tax_payments`:
1. Q1 2026: dueDate 2026-04-15, amount "3300.00", status "paid", paidDate 2026-04-10, paidAmount "3300.00"
2. Q2 2026: dueDate 2026-06-15, amount "3300.00", status "upcoming"

## Task 2: Wire isDemoUser() guards into all write server actions

Import `isCurrentUserDemo` from `@/lib/ai/demo-check` in every server action file
that performs writes (INSERT, UPDATE, DELETE). At the top of each write function,
add:

```typescript
if (await isCurrentUserDemo()) {
  return { error: "Demo mode — changes are not saved. Deploy your own instance to use all features." };
}
```

Files that need this guard (write functions only, skip read-only functions):

1. `src/app/(app)/transactions/new/actions.ts` — createTransactionAction
2. `src/app/(app)/transactions/review/actions.ts` — all write functions (match, ignore, bulk actions)
3. `src/app/(app)/transactions/journal/actions.ts` — voidTransactionAction
4. `src/app/(app)/rules/actions.ts` — createRuleAction, updateRuleAction, deleteRuleAction
5. `src/app/(app)/accounts/actions.ts` — addAccount, updateAccountAction
6. `src/app/(app)/connections/actions.ts` — mapPlaidAccount
7. `src/app/(app)/tax/quarterly/actions.ts` — recordPayment
8. `src/app/(app)/setup/actions.ts` — saveSetup
9. `src/app/(app)/community/actions.ts` — any write functions
10. `src/lib/plaid/actions.ts` — createLinkToken, exchangePublicToken

For functions that currently return void or redirect, change the return type to
`{ error?: string }` and return the error object. The calling component should
check for `.error` and show a toast or inline message.

IMPORTANT: Don't block read-only actions (fetchRules, fetchTrialBalance, etc.).

## Task 3: Create reset API route

Create `src/app/(app)/api/demo/reset/route.ts`:

The reset should:
1. Check `isCurrentUserDemo()` — return 403 if not demo user
2. Delete all rows from: transaction_lines, transactions, import_rows, sync_batches,
   file_import_rows, file_import_batches, estimated_tax_payments, categorization_rules
   (delete in FK order: children before parents)
3. Re-run the demo seed logic (same data as seed/demo-data.ts)
4. Return `{ success: true }` or `{ error: "..." }`

To avoid duplicating seed logic, refactor `seed/demo-data.ts` so the seeding logic
is in an exported `async function seedDemoData(db)` that both the CLI script and
the API route can call. Put the shared logic in `src/lib/services/demo-seed.ts`.
The CLI script becomes a thin wrapper that imports and calls it.

## Task 4: Add Reset button to demo banner

Update `src/components/demo-banner.tsx`:
- Add a "Reset Demo Data" button (right side of the banner)
- On click: show a confirm dialog, then POST to /api/demo/reset
- While resetting: show a spinner, disable the button
- On success: reload the page (router.refresh or window.location.reload)
- On error: show toast or inline error

Keep the banner clean — the reset button should be subtle (ghost variant, small).

## Task 5: Update purge script

Update `scripts/purge-synthetic-data.ts` to also purge the new tables:
- categorization_rules
- file_import_rows  
- file_import_batches

(It already handles the other tables.)

## Task 6: Re-seed production

After all code changes, push to GitHub (auto-deploys to Vercel), then run the
seed script against the production database. Read the DATABASE_URL from `.env.local`
in the project directory. Use the pooler URL (port 6543).

```bash
DATABASE_URL="<pooler-url-from-env.local>" npx tsx seed/demo-data.ts
```

## Verification

After deploy, visit https://ledger-starter.vercel.app/demo and check:
1. Dashboard — YTD metrics show (revenue, expenses, net profit, tax estimates)
2. Review page — shows import rows with matched status
3. Journal — shows 22 posted transactions
4. Imports — shows 1 batch with 5 rows
5. Rules — shows 3 categorization rules
6. Quarterly Estimates — shows Q1 (paid) and Q2 (upcoming)
7. Narrative — click Generate → shows pre-generated narrative
8. New Transaction — form loads, submit shows demo guard message
9. Reset button — click → data refreshes, all pages still work
10. Connections — shows mock bank accounts (already working)

## Conventions
- Monetary values in DB: string format like "5000.00" (numeric(12,2))
- Amounts in seed arrays: cents as integers (500000 = $5,000.00), divided by 100 when inserting
- DEMO_TAG = "DEMO" in memo field for all demo rows
- All DB-touching pages need `export const dynamic = "force-dynamic"`
- Use existing patterns from the codebase — don't introduce new libraries
