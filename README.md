# Ledger Starter

> Self-hosted, AI-assisted accounting + tax tool for US small businesses.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gstreet-ops/ledger-starter&project-name=my-ledger&integration-ids=oac_jUduyjQgOyzev1fjrW83NYOv&env=PLAID_CLIENT_ID,PLAID_SECRET,PLAID_ENV,PLAID_TOKEN_ENCRYPTION_KEY,ANTHROPIC_API_KEY&envDescription=Plaid%20and%20Anthropic%20are%20optional.%20Supabase%20env%20vars%20are%20set%20automatically%20by%20the%20integration.&envLink=https://github.com/gstreet-ops/ledger-starter/blob/main/SETUP.md)

---

## What You Get

- **Double-entry ledger** — every transaction balances, full audit trail
- **Bank sync via Plaid** — connect checking, savings, and credit cards
- **CSV/PDF import** — AmEx, Citi, and Truist statement parsers included
- **AI categorization** — Claude suggests accounts + tax categories, you approve
- **Tax dashboard** — Schedule C summary, SE tax, state tax, quarterly estimates
- **Reports** — P&L, trial balance, AI-narrated period summaries
- **CPA export** — year-end Schedule C package as CSV

## Quick Start

**Hosted (recommended):** Click the Deploy button above. Supabase is provisioned automatically. Add Plaid and Anthropic keys if you want bank sync and AI features.

**Local development:** See **[SETUP.md](./SETUP.md)** for the full guide.

```bash
git clone https://github.com/gstreet-ops/ledger-starter.git my-ledger
cd my-ledger && npm install
cp .env.local.example .env.local  # fill in your keys
npx drizzle-kit push && npm run dev
# visit http://localhost:3000/setup
```

## Features

| Feature | Requires |
|---|---|
| Double-entry ledger, chart of accounts, journal | Supabase (auto-provisioned) |
| Bank sync (checking, savings, credit cards) | Plaid API key (optional) |
| CSV/PDF statement import | Nothing extra |
| AI transaction categorization | Anthropic API key (optional) |
| AI narrative reports | Anthropic API key (optional) |
| Tax dashboard (federal + state) | Nothing extra |
| Quarterly estimate tracking | Nothing extra |
| CPA export | Nothing extra |
| Community instance sharing | Nothing extra |

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Supabase** (PostgreSQL) + Drizzle ORM
- **Plaid** for bank sync
- **Anthropic Claude** for AI features
- **Tailwind CSS** + shadcn/ui
- **Vercel** for deployment

## Who It's For

US sole proprietors, single-member LLCs, S-Corps, and partnerships who want a self-hosted alternative to QuickBooks with AI-powered categorization and a tax dashboard they can actually understand.

## Contributing

Contributions welcome. Please open an issue first to discuss what you'd like to change.

## License

MIT
