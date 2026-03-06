Read CLAUDE.md for system goals and .claude/context.md for where we left off.

Perform a comprehensive code review of the gstreet-ledger codebase. This is a personal accounting app handling financial data — correctness is critical. Use sub-agents to review these areas in parallel:

## Review Area 1: Double-Entry Posting Logic (CRITICAL)
Files: src/lib/services/posting.ts, src/lib/db/schema.ts (transaction_lines table)
- Verify SUM(debit) = SUM(credit) is enforced for every transaction
- Verify debit/credit direction is correct based on account types
- Verify amount handling: numeric(12,2) consistently? Any floating point math?
- Check for race conditions or partial writes (should be in a DB transaction)
- Verify the CHECK constraint on transaction_lines works correctly

## Review Area 2: Tax Calculations (CRITICAL)
Files: src/lib/services/tax.ts, src/lib/services/quarterly-estimates.ts
- Verify 2025 SE tax rate: 15.3% on 92.35% of net profit, SS wage base cap 176100
- Verify 2025 Georgia income tax brackets are correct
- Verify 2025 federal income tax brackets are correct
- Verify quarterly estimate logic: annualization, safe harbor, due dates
- Check for off-by-one errors in bracket calculations

## Review Area 3: Plaid Security
Files: src/lib/plaid/crypto.ts, src/lib/plaid/actions.ts, src/lib/plaid/client.ts
- Verify access tokens are encrypted before storage (AES-256-GCM)
- Verify access tokens are never sent to the client/browser
- Verify error handling for Plaid API failures

## Review Area 4: Database Schema and Queries
Files: src/lib/db/schema.ts, src/lib/db/queries.ts, src/lib/db/drizzle.ts
- Verify all foreign keys are correct
- Verify all monetary fields use numeric(12,2), not float
- Check for SQL injection risks
- Verify import_rows audit trail — rows should never be deleted

## Review Area 5: General Code Quality
Files: All src/ files
- TypeScript type safety — any use of any type?
- Error handling — are errors caught and handled gracefully?
- Edge cases — zero amounts, negative amounts, empty descriptions?
- Server actions — properly validated?

## Output Format
For each review area report CRITICAL, WARNING, and INFO issues.
Create .claude/code-review-results.md with full findings.
Then fix any CRITICAL issues. Commit fixes. Update .claude/context.md. Push to origin/main.
