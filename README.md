# ledger-starter

> A self-hosted, AI-assisted accounting + tax tool for US small businesses.
> Double-entry ledger, Plaid bank sync, Schedule C support, AI categorization.

**Stack:** Next.js 15 · Supabase · Drizzle ORM · Plaid · Claude AI · Vercel

---

## What it does

- **Double-entry ledger** — every transaction balances, full audit trail
- **Bank sync** — connect checking, savings, and credit cards via Plaid
- **CSV import** — AmEx, Citi, and Truist PDF/XLSX parsers included
- **AI categorization** — Claude suggests account + tax category, you approve
- **Tax dashboard** — Schedule C summary, SE tax estimate, quarterly reminders
- **Reports** — P&L, trial balance, AI-narrated period summaries
- **CPA export** — year-end Schedule C package as CSV

## Who it's for

US sole proprietors, single-member LLCs, S-Corps, and partnerships who want:
- A self-hosted alternative to QuickBooks / Wave
- AI help with categorization (not just rules)
- A tax snapshot they understand without an accountant

## Quick Start

```bash
git clone https://github.com/gstreet-ops/ledger-starter.git my-ledger
cd my-ledger
npm install
cp .env.local.example .env.local
# fill in .env.local — see SETUP.md
npx drizzle-kit push
npm run dev
# visit http://localhost:3000/setup
```

See **[SETUP.md](./SETUP.md)** for the full onboarding guide.

## Screenshots

Coming soon.

## License

MIT
