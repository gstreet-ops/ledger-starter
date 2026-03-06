Read CLAUDE.md for system goals and .claude/context.md for where we left off. Today we're building Plaid bank connections (Phase 1A):

1. Create src/lib/plaid/actions.ts — Server actions for:
   - createLinkToken: generates Plaid Link token for the frontend
   - exchangePublicToken: exchanges public_token for access_token, stores in plaid_items
   - getAccounts: fetches accounts for a connected item, stores in plaid_accounts
   - syncTransactions: placeholder for Phase 1B

2. Create src/components/plaid-link-button.tsx — Client component that:
   - Calls createLinkToken server action on mount
   - Renders a "Connect a Bank" button using react-plaid-link's usePlaidLink hook
   - On success, calls exchangePublicToken then getAccounts

3. Update src/app/connections/page.tsx — "Bank Connections" page with:
   - "Connect a Bank" button using the PlaidLinkButton component
   - List of connected institutions with status indicators (active/error/needs_reauth)
   - Each institution shows its accounts with: name, type, mask (last 4), last sync time
   - Account mapping: dropdown to link each Plaid account to a ledger account from the chart of accounts

4. Create src/lib/db/queries.ts — Database query helpers:
   - getPlaidItems: fetch all plaid_items with their accounts
   - getAccounts: fetch chart of accounts for the mapping dropdown
   - updatePlaidAccountMapping: link a plaid_account to a ledger account

5. Wire up environment variables: PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV from .env.local

6. Test with Plaid sandbox — use sandbox test credentials to verify the Link flow works end to end

Commit after each logical step with descriptive messages. Update .claude/context.md when done. Push to origin/main.
