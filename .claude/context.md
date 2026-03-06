# GStreet Ledger — Project Context

> Maintained by Claude across sessions. Lives in repo for Claude Code continuity.

## Current State
- **Active branch**: main
- **Last deployment**: not yet deployed
- **Supabase project**: Account 3 — iehbxzhyykveopqaqvww (brian+ledger@globestreet.com)
- **Plaid**: developer account created (brian@globestreet.com, GStreet Ops, 2FA enabled)
- **Phase**: 5 COMPLETE — polish and intelligence features

## Architecture Notes
- Next.js 15 + Supabase + Drizzle + Plaid + Anthropic API
- See CLAUDE.md for full stack and conventions
- Planning doc lives in Claude.ai project (not in repo)
- Schema has 9 tables, seed has full Chart of Accounts with Schedule C mapping

## Active Work
- Phase 5 complete, all core phases done
- Supabase Auth added: middleware redirects to /login, session-based cookie auth via @supabase/ssr
- Synthetic test data seeded: 25 posted transactions (20 expenses, 5 income), 10 categorization rules
- 48 Plaid sandbox import_rows pending for categorization/posting testing

## Known Issues & Blockers
- Anthropic API key not yet added to .env.local (needed Phase 1C)

## Session Log
### 2026-03-05 — Project Planning, Repo Setup, Phase 0 Bootstrap
- Full architecture planning doc created in Claude.ai project
- Created GitHub repo gstreet-ops/gstreet-ledger (private)
- Created Supabase Account 3 (brian+ledger@globestreet.com)
- Created Plaid developer account (brian@globestreet.com, GStreet Ops)
- All API keys wired into .env.local (Supabase + Plaid sandbox)
- Phase 0 bootstrap complete: Next.js 15, Drizzle schema (9 tables), seed data, Supabase/Plaid clients, shadcn/ui sidebar with 6 pages
- Updated PROJECT_REGISTRY.md and .supabase-accounts.md
- Decisions: Plaid from day one, no home office, no S-corp, no CPA, CSV/Excel exports

### 2026-03-05 — Phase 1A: Plaid Bank Connections
- Plaid Link integration (create/exchange tokens, fetch accounts)
- Bank Connections page with account mapping to Chart of Accounts
- Encrypted Plaid access tokens (AES-256-GCM)

### 2026-03-05 — Phase 1B: Transaction Sync Pipeline
- Plaid transaction sync service (cursor-based, added/modified/removed)
- POST /api/sync route for triggering sync
- Transaction review page with status/batch filters and pagination
- Sync Now button on Bank Connections page
- CSV import fallback service for historical data
- Query helpers for import rows and sync batches

### 2026-03-05 — Phase 1C: AI-Assisted Categorization
- Categorization rule engine (pattern matching on merchant/name, priority-based)
- Anthropic API integration for AI category suggestions (Claude Sonnet, batch support)
- Double-entry posting service (creates balanced transactions + lines)
- Server actions: accept, edit+accept, skip, bulk accept, create rule, run categorization
- Review page UI: suggestion display with confidence badges, tooltips, bulk select, edit mode
- New queries: getRules, createRule, getAccountsWithTaxCategories, getImportRowById, getPlaidAccountById

### 2026-03-05 — Phase 2: Double-Entry Ledger Views & Reports
- Chart of Accounts page: grouped by type (collapsible), balances from transaction_lines, add/edit/deactivate
- Transaction Journal: filterable (date, status, account), sortable, expandable rows showing lines, void support
- Manual Transaction Entry: dynamic line items, real-time debit/credit balance validation, server action posting
- Reports page: Trial Balance (all accounts with debits/credits/balance) + P&L (income vs expenses, date range)
- Dashboard: YTD revenue/expenses/net profit cards, cash balance, monthly income vs expenses bar chart (recharts), recent transactions
- Reports service: trialBalance(), profitAndLoss(), balanceSheet(), cashFlow(), monthlyPnl()
- Query layer: getAccountBalances, getTransactionsWithLines, createTransaction, getTransactionById, voidTransaction, getRecentTransactions
- Updated sidebar: Review, Journal, New Transaction, Accounts, Reports, Tax, Rules
- Added shadcn components: dialog, label, card, tabs, collapsible, textarea
- Added recharts dependency for dashboard charts

### 2026-03-05 — Phase 3: Tax Mapping & Reporting
- Tax categories seed data (Schedule C lines, GA Form 500, SE tax)
- Tax computation service: scheduleCReport, selfEmploymentTax, georgiaIncomeTax, federalIncomeTax, quarterlyEstimate
- Tax dashboard: Schedule C summary table, tax estimate cards (federal/SE/GA), quarterly payment calendar with due dates
- Year selector with arrow navigation, Export CSV button
- Schedule C CSV export endpoint (GET /tax/export?year=YYYY)
- Rules management page: full CRUD table (add/edit/delete/toggle active), inline editing, test rule input
- New queries: getTaxCategories, getScheduleCTotals, getAllRules, updateRule, deleteRule

### 2026-03-05 — Phase 4: Quarterly Estimates & Dashboard Enhancements
- New estimated_tax_payments table (Drizzle schema + migration)
- Quarterly estimates service with YTD annualization: projects full-year liability based on elapsed days
- Quarterly Estimates page: 4 quarter cards with status (upcoming/due/overdue/paid), payment recording, warning banners
- Server actions: recordPayment (upsert), getQuarterlyData
- Dashboard enhancements: YTD Tax Liability card (federal + SE + GA), Next Quarterly Estimate card with color-coded urgency
- Sidebar: added "Quarterly Estimates" nav item under Tax
- Schema: 10 tables total

### 2026-03-05 — Phase 5: Polish & Intelligence
- AI narrative service (narrate.ts): narratePnL, explainTransaction, periodComparison using Claude Sonnet
- Narrative report page: date range picker, P&L display alongside AI narrative, period-over-period comparison
- Dashboard intelligence: top 5 expense categories with trend arrows (vs last month), cash runway estimate, effective tax rate
- Month-end export endpoint (GET /reports/export?year=&month=): downloadable markdown with P&L, top expenses, tax snapshot, AI narrative
- Settings page: Plaid connection status, environment config check, fiscal year info
- Sidebar: added Narrative and Settings nav items

### 2026-03-05 — Auth: Supabase Auth Integration
- Installed @supabase/ssr, replaced raw supabase-js clients with SSR cookie-based clients
- Next.js middleware redirects unauthenticated users to /login (public paths: /login)
- Login page: email/password via supabase.auth.signInWithPassword
- Sidebar: sign-out button in footer
- /api/sync protected with server-side session verification
- Note: need to create a user in Supabase Auth dashboard before first login
