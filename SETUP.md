# Ledger Starter — Setup Guide

A double-entry accounting + tax tool for US small businesses.
Built on Next.js 15, Supabase, Drizzle ORM, Plaid, and Claude AI.

---

## One-Click Deploy

The fastest way to get started — click the button in the [README](./README.md) to deploy to Vercel with Supabase auto-provisioned. Plaid and Anthropic keys are optional and can be added later.

---

## Prerequisites (Local Development)

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- A free [Plaid](https://plaid.com/docs/quickstart/) developer account (optional — CSV import works without it)
- An [Anthropic API](https://console.anthropic.com/) key (optional — AI features work without it, see below)

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
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (required — use the pooler connection string from Supabase)
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Plaid (optional — skip if CSV-only)
PLAID_CLIENT_ID=your-client-id
PLAID_SECRET=your-sandbox-secret
PLAID_ENV=sandbox
PLAID_TOKEN_ENCRYPTION_KEY=your-32-byte-hex-key

# Anthropic (optional — needed for AI categorization + narrative reports)
ANTHROPIC_API_KEY=sk-ant-...
```

Generate the Plaid encryption key with: `openssl rand -hex 32`

---

## Step 4: Apply Database Migrations

```bash
npx drizzle-kit push
```

This creates all tables in your Supabase project, including `user_settings`.

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
before connecting your real accounts. The `/demo` route provides a quick-login experience
for testing. Remove demo data anytime:

```bash
npx tsx scripts/purge-synthetic-data.ts
```

---

## Step 8 (Optional): Connect Bank Accounts

Navigate to **Bank Connections** → **Add Account** to connect via Plaid.
For CSV import, use the **Imports** page to upload bank statement files.

---

## Features Requiring API Keys

| Feature | API Key | What happens without it |
|---|---|---|
| Bank sync (checking, savings, credit cards) | `PLAID_CLIENT_ID` + `PLAID_SECRET` | Use CSV/PDF import instead |
| AI transaction categorization | `ANTHROPIC_API_KEY` | Manual categorization works normally; a helpful prompt is shown |
| AI narrative reports | `ANTHROPIC_API_KEY` | P&L data is shown; AI summary shows a setup prompt |
| Community GitHub sharing | `GITHUB_COMMUNITY_TOKEN` | Reports are saved locally only |

All features degrade gracefully — no errors, no broken pages.

---

## What Drives What

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
src/app/community/ — Instance fingerprint + community sharing
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

The easiest way is the one-click deploy button in the README. For manual deploys:

```bash
vercel --prod
```

Add your environment variables in the Vercel dashboard under Project → Settings → Environment Variables.
