# Ledger Starter — Setup Guide

A double-entry accounting + tax tool for US small businesses.
Built on Next.js 15, Supabase, Drizzle ORM, Plaid, and Claude AI.

---

## Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- A free [Plaid](https://plaid.com/docs/quickstart/) developer account (optional — CSV import works without it)
- An [Anthropic API](https://console.anthropic.com/) key (optional — AI categorization requires it)

---

## Step 1: Clone & Install

```bash
git clone https://github.com/gstreet-ops/ledger-starter.git my-ledger
cd my-ledger
npm install
```

---

## Step 2: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project.
2. Note your **Project URL** and **anon key** (Settings → API).
3. Also grab the **service role key** for server-side operations.

---

## Step 3: Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Drizzle — use the pooler connection string from Supabase)
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Plaid (optional — skip if CSV-only)
PLAID_CLIENT_ID=your-client-id
PLAID_SECRET=your-sandbox-secret
PLAID_ENV=sandbox

# Plaid token encryption key (generate with: openssl rand -hex 32)
PLAID_ENCRYPTION_KEY=your-32-byte-hex-key

# Anthropic (optional — needed for AI categorization)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Step 4: Apply Database Migrations

```bash
npx drizzle-kit push
```

This creates all 10 tables in your Supabase project, including `user_settings`.

---

## Step 5: Create Auth User

In your Supabase dashboard → Authentication → Users → Add User.
Enter an email and password you'll use to log in.

---

## Step 6: Run the App & Complete Setup Wizard

```bash
npm run dev
```

Navigate to `http://localhost:3000/setup` and complete the 4-step wizard:

1. **Business** — Your business name, owner name, timezone
2. **Tax Setup** — Entity type (Sole Prop / SMLLC / S-Corp), state, filing method, tax year
3. **Banking** — Enable or skip Plaid bank sync
4. **Confirm** — Review and save

After the wizard, you'll land on the dashboard.

---

## Step 7 (Optional): Load Demo Data

```bash
npx tsx seed/demo-data.ts
```

This loads fictional transactions for "Acme Consulting LLC" so you can explore the UI
before connecting your real accounts. Remove them anytime:

```bash
npx tsx scripts/purge-synthetic-data.ts
```

---

## Step 8 (Optional): Connect Bank Accounts

Navigate to **Bank Connections** → **Add Account** to connect via Plaid.
For CSV import, use the **Imports** page to upload bank statement files.

---

## What drives what

The `/setup` wizard writes to the `user_settings` table. The app reads this at runtime:

| Setting | Drives |
|---|---|
| `entity_type` | Tax schedule shown (Schedule C, K-1, etc.) |
| `state` | State tax rate + form label on tax page |
| `filing_method` | CPA export mode vs self-file summaries |
| `tax_year_start` | Quarterly estimate due dates |
| `plaid_enabled` | Whether Bank Connections page is active |

---

## Project Structure

```
src/app/setup/     — First-run wizard
src/app/dashboard/ — YTD metrics, charts
src/app/transactions/review/ — AI-assisted categorization
src/app/tax/       — Schedule C summary + quarterly estimates
src/app/reports/   — P&L, trial balance, narrative
drizzle/           — Migration SQL files
seed/demo-data.ts  — Fictional demo transactions
```

---

## Customizing for Your State

The tax service in `src/lib/services/tax.ts` reads `user_settings.state` to
determine state income tax rates and form labels. Add your state's rates to the
`STATE_TAX_RATES` map at the top of that file if it isn't already there.

---

## Deploying to Vercel

```bash
vercel --prod
```

Add your environment variables in the Vercel dashboard under Project → Settings → Environment Variables.
