Initialize this project as a personal accounting system. Read CLAUDE.md for system goals and conventions. Do the following:

1. Run: npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes (use current directory, overwrite existing files)
2. Install dependencies: drizzle-orm drizzle-kit postgres @supabase/supabase-js @anthropic-ai/sdk plaid react-plaid-link
3. Run: npx shadcn@latest init -y
4. Create the Drizzle schema in src/lib/db/schema.ts with these tables: accounts, tax_categories, plaid_items, plaid_accounts, transactions, transaction_lines, sync_batches, import_rows, categorization_rules. Use the field specs from CLAUDE.md. All monetary values use numeric(12,2). Add a CHECK or trigger note for the double-entry invariant (SUM debit = SUM credit per transaction).
5. Create a seed file src/lib/db/seed.ts with the initial chart of accounts: 1000-1030 assets, 2000-2010 liabilities, 3000-3020 equity, 4000-4010 income, 5010-5180 and 6010-6040 expenses mapped to Schedule C lines.
6. Create drizzle.config.ts pointing to DATABASE_URL from env.
7. Create src/lib/supabase/client.ts and server.ts for Supabase client initialization.
8. Create src/lib/plaid/client.ts for Plaid client initialization using PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV from env.
9. Create a basic app layout in src/app/layout.tsx with shadcn/ui sidebar navigation: Dashboard, Bank Connections, Transactions, Accounts, Tax, Rules.
10. Create placeholder pages for each route: src/app/dashboard/page.tsx, src/app/connections/page.tsx, src/app/transactions/page.tsx, src/app/accounts/page.tsx, src/app/tax/page.tsx, src/app/rules/page.tsx.
11. Add a .env.local.example file (without real keys) documenting all required env vars.

Commit after each logical step with descriptive messages. Push to origin/main when done.
