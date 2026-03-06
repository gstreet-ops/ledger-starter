Read CLAUDE.md for system goals and .claude/context.md for where we left off. 

The Plaid Link flow opens correctly and the user can select a sandbox bank (First Platypus Bank), log in with user_good/pass_good, and select accounts. But after the flow completes, no bank connection appears on the connections page. The token exchange or account storage is failing silently.

Debug and fix the Plaid connection flow:

1. Check the server-side token exchange in src/lib/plaid/actions.ts — add proper error logging
2. Check the PlaidLinkButton onSuccess handler — ensure it calls exchangePublicToken and fetchAndStoreAccounts correctly
3. Check the encryption in src/lib/plaid/crypto.ts — ensure ENCRYPTION_KEY or a fallback is available
4. Test the full flow: Connect a Bank → First Platypus Bank → user_good/pass_good → select all accounts → verify connection appears
5. After connection works, test Sync Now to pull sandbox transactions
6. Verify transactions appear on the Review page

Also run the seed file to populate the chart of accounts if not already done:
- Check if accounts table has data, if not, run the seed

Fix any issues found. Commit and push when the full flow works end to end.
