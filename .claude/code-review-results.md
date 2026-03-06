# Code Review Results — gstreet-ledger

**Date:** 2026-03-05
**Reviewer:** Claude (automated)

---

## Area 1: Double-Entry Posting Logic

### CRITICAL-1: `parseFloat` used for balance validation (floating point on money)
- **File:** `src/app/transactions/new/actions.ts:12-13`
- Balance check uses `parseFloat` accumulation with a 0.001 epsilon band-aid. Accumulated IEEE 754 errors could exceed the epsilon, or an actually unbalanced transaction within 0.001 could pass.

### CRITICAL-2: `parseFloat` used in posting service
- **File:** `src/lib/services/posting.ts:18`
- Amounts from `numeric(12,2)` strings are converted via `parseFloat`, violating the "never floating point" invariant.

### CRITICAL-3: No database-level enforcement of SUM(debit) = SUM(credit)
- **File:** `src/lib/db/schema.ts:113`
- Comment claims "application logic + database trigger" but no trigger exists in any migration. `createTransaction` in queries.ts blindly inserts whatever lines it receives. Only the manual journal entry path validates balance.

### WARNING-1: CHECK constraint allows both debit AND credit positive on same line
- **File:** `src/lib/db/schema.ts:133-136`
- Current: `(debit >= 0 AND credit >= 0) AND (debit > 0 OR credit > 0)`. Should be: `(debit > 0 AND credit = 0) OR (debit = 0 AND credit > 0)`.

### WARNING-2: `bulkAccept` not wrapped in a single DB transaction
- **File:** `src/app/transactions/review/actions.ts:75-89`
- Each row processed in its own transaction. Partial failures leave data inconsistent.

### WARNING-3: Posting logic hardcodes two-line entries only
- **File:** `src/lib/services/posting.ts:35-65`
- Won't handle split transactions. Manual journal entry supports N lines but Plaid import does not.

---

## Area 2: Tax Calculations

### WARNING-1: Georgia tax uses raw net profit instead of AGI
- **File:** `src/lib/services/tax.ts:148-153, 251`
- GA taxable income should start from federal AGI (net profit minus 50% SE tax deduction). Currently overstates GA tax by ~$400 on $100K net profit.

### WARNING-2: Georgia standard deduction may be stale
- **File:** `src/lib/services/tax.ts:157-159`
- Uses $5,400 std deduction + $2,700 personal exemption. If HB 1015 applies for TY2025, the combined deduction should be $12,000 with no separate personal exemption. **Needs verification against enacted 2025 GA law.**

### WARNING-3: Annualization uses calendar days, not IRS quarters
- **File:** `src/lib/services/quarterly-estimates.ts:78-91`
- IRS annualized income installment method uses specific period cutoffs (3/31, 5/31, 8/31, 12/31). Current approach is a rough approximation.

### WARNING-4: No safe harbor logic
- **File:** `src/lib/services/quarterly-estimates.ts`
- No comparison against prior-year tax liability for safe harbor (100% / 110% if AGI > $150K).

### INFO: SE tax, federal brackets, due dates, flat GA 5.49% rate — all correct for 2025.

---

## Area 3: Plaid Security

### WARNING-1: `/api/sync` has no authentication
- **File:** `src/app/api/sync/route.ts:4`
- Anyone who discovers the URL can trigger a full Plaid sync.

### WARNING-2: `exchangePublicToken` and `fetchAndStoreAccounts` lack try/catch
- **File:** `src/lib/plaid/actions.ts:23, 66`
- Plaid API failures throw unhandled errors, bubble up as opaque 500s.

### WARNING-3: Missing runtime validation for Plaid env vars
- **File:** `src/lib/plaid/client.ts:10-11`
- Non-null assertions on `process.env.PLAID_CLIENT_ID!` and `process.env.PLAID_SECRET!` — silent `undefined` if missing.

### INFO: AES-256-GCM encryption correct. Access tokens never returned to client. Good error handling in sync flow.

---

## Area 4: Database Schema & Queries

### WARNING-1: No indexes on foreign keys or common query columns
- **File:** `src/lib/db/schema.ts`
- Zero indexes across the entire codebase. `transaction_lines.transaction_id`, `import_rows.sync_batch_id`, `transactions.date`, `transactions.status` all lack indexes.

### WARNING-2: `getImportRowCount` fetches all rows to count
- **File:** `src/lib/db/queries.ts:82-87`
- Uses `result.length` instead of `SELECT count(*)`.

### WARNING-3: `createTransaction` does not validate debit/credit balance
- **File:** `src/lib/db/queries.ts:330-363`
- (Duplicate of CRITICAL-3 above — same root cause.)

### WARNING-4: `estimatedTaxPayments` missing unique constraint on (year, quarter)
- **File:** `src/lib/db/schema.ts:183-201`
- Duplicate rows for same year/quarter can be inserted.

### INFO: All monetary fields use `numeric(12,2)`. All FKs correct. No SQL injection risk (Drizzle parameterizes). Import rows never deleted.

---

## Area 5: General Code Quality

### CRITICAL-1: No authentication on any route or server action
- **Files:** All `src/app/**/actions.ts`, all API routes
- All endpoints are publicly accessible. Anyone with the URL can create transactions, trigger syncs, or export financial data.

### CRITICAL-2: CSV parser does not handle quoted commas
- **File:** `src/lib/services/csv-import.ts:42`
- Naive `line.split(",")` breaks on fields with commas (e.g., `"Smith, John"`), silently corrupting imported data.

### CRITICAL-3: Pervasive `parseFloat` for financial calculations
- **Files:** `src/lib/services/tax.ts`, `src/lib/services/reports.ts`, `src/app/transactions/new/actions.ts`
- ~70 occurrences of `parseFloat` for monetary arithmetic across the codebase. (Overlaps with Area 1 CRITICAL-1/2.)

### WARNING-1: Server actions lack input validation
- **Files:** `src/app/rules/actions.ts:14-24`, `src/app/accounts/actions.ts:26-38`
- No sanitization of patterns, IDs, or names.

### WARNING-2: `catch (e: any)` leaks internal errors to clients
- **Files:** Multiple server actions and API routes
- Database errors and stack traces can reach the frontend.

### WARNING-3: Zero-amount postings not guarded
- **File:** `src/lib/services/posting.ts:18-19`

### WARNING-4: `as any` casts hide real type mismatches
- **Files:** `src/app/dashboard/page.tsx:90`, `src/app/transactions/journal/page.tsx:35`

### INFO: No hardcoded secrets. 18 console.log statements in production code.

---

## Summary

| Severity | Count | Key Themes |
|----------|-------|------------|
| CRITICAL | 5 | No auth, floating-point money math, no DB balance enforcement, CSV parsing |
| WARNING | 15 | GA tax calc, missing indexes, no input validation, error leaks, CHECK constraint |
| INFO | ~10 | Encryption solid, FKs correct, no SQL injection, audit trail preserved |

## Recommended Fix Priority

1. **No auth** — Add middleware or session checks (even a simple shared secret for single-user)
2. **parseFloat everywhere** — Replace with integer-cent arithmetic or decimal.js
3. **DB balance enforcement** — Add a trigger or application-level check in `createTransaction`
4. **CSV parser** — Use a proper CSV library (e.g., `papaparse`)
5. **GA tax inputs** — Fix AGI calculation, verify 2025 deduction amounts
6. **Add database indexes** — Performance will degrade over time
