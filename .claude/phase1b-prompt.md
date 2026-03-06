Read CLAUDE.md for system goals and .claude/context.md for where we left off. Today we're building the transaction sync pipeline (Phase 1B):

1. Create src/lib/plaid/sync.ts — Transaction sync service using Plaid's transactions/sync endpoint:
   - For each active plaid_item, fetch added/modified/removed transactions since last cursor
   - Store raw Plaid transaction objects as import_rows with raw_json preserved
   - Update cursor on plaid_items after successful sync
   - Track sync stats (added/modified/removed counts) in sync_batches
   - Handle Plaid error codes gracefully (ITEM_LOGIN_REQUIRED, etc.)

2. Create src/app/api/sync/route.ts — API route that triggers sync for all active plaid_items
   - POST handler that runs sync for all active items
   - Returns sync results summary
   - Will become a cron job later (Vercel cron)

3. Create src/app/transactions/review/page.tsx — Transaction review screen:
   - Table showing import_rows: date, amount, merchant (from Plaid), description, Plaid category, match status
   - Filter by: sync batch, institution, match status (pending/matched/ignored)
   - Sort by date, amount
   - Pagination for large result sets

4. Add "Sync Now" button to the Bank Connections page that triggers manual sync via the API route

5. Create src/lib/services/csv-import.ts — Simple CSV upload fallback:
   - Parse generic CSV with columns: date, amount, description
   - Store as import_rows with source type "csv"
   - For edge cases where Plaid doesn't have historical data

6. Update src/lib/db/queries.ts with new query helpers:
   - getImportRows: fetch import_rows with filters and pagination
   - getSyncBatches: fetch recent sync batches with stats
   - getImportRowsByBatch: fetch rows for a specific sync batch

Commit after each logical step with descriptive messages. Update .claude/context.md when done. Push to origin/main.
