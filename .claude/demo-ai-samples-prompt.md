# Demo AI Samples + Plaid Error Fix

Read CLAUDE.md for system goals and .claude/context.md for project state.

## Context

The demo should showcase AI features and bank sync without requiring live API keys.
Instead of connecting to Anthropic or Plaid APIs, we pre-generate sample outputs
so the demo always works, loads instantly, and costs nothing.

## Task 1: Pre-generate sample narrative for the demo

Create a static sample narrative that displays when the demo user clicks "Generate Narrative"
instead of calling the Anthropic API.

In `src/lib/ai/narrate.ts`, when the current user is the demo user (check via a parameter
or env var), return a pre-written narrative instead of calling the API.

Sample narrative content (for Acme Consulting LLC, Jan-May 2026):

```
## Financial Summary — January through May 2026

**Acme Consulting LLC** generated **$7,500 in revenue** during this period, driven
primarily by consulting engagements including website redesign, SEO consulting,
and monthly retainer agreements.

**Total expenses were $1,568**, with the largest categories being:
- **Travel** ($832): A client visit to Chicago including flights, hotel, and ground transportation
- **Software & Subscriptions** ($246): Recurring tools including Notion, GitHub Copilot, Adobe Creative Cloud, and Figma
- **Marketing** ($299): Meta advertising and Canva Pro annual subscription
- **Meals & Entertainment** ($276): Client dinners and meeting expenses
- **Office Supplies** ($137): Printer supplies, equipment, and shipping

**Net profit of $5,932** represents a healthy **79% profit margin**, typical for a
consulting business with low overhead.

**Tax implications:** At this pace, estimated annual income of ~$72,772 would result in
approximately $16,775 in combined federal, self-employment, and state taxes. Texas has
no state income tax, so the liability is entirely federal ($6,493) and self-employment ($10,282).

**Recommendation:** Consider making Q1 estimated tax payment of ~$4,194 before the
April 15 deadline to avoid underpayment penalties.
```

Also create a sample period comparison for the demo (comparing Jan-Feb vs Mar-May).

## Task 2: Pre-generate sample AI categorization suggestions

In `src/lib/ai/suggest.ts`, when the current user is the demo user, return
pre-built suggestions instead of calling the API.

For the demo transactions, create suggestions that match what Claude would actually suggest:
- "Notion — Annual Plan" → Software & Subscriptions (6010)
- "GitHub Copilot — Monthly" → Software & Subscriptions (6010)
- "Adobe Creative Cloud — Monthly" → Software & Subscriptions (6010)
- "Staples — Printer Ink + Paper" → Office Supplies (6030)
- "The Capital Grille — Client Dinner" → Meals & Entertainment (6050)
- "Southwest Airlines — Austin → Chicago" → Travel (6060)
- "Meta Ads — February Campaign" → Marketing & Promotion (6070)
- etc.

Each suggestion should include a confidence score (0.85-0.95) and a brief reason,
matching the format the real AI would return:
```json
{
  "accountId": "...",
  "accountName": "Software & Subscriptions",
  "confidence": 0.92,
  "reason": "Notion is a productivity/project management SaaS tool"
}
```

Store these as a static map in a new file: `src/lib/ai/demo-suggestions.ts`

## Task 3: Fix Plaid "Failed to initialize" on Bank Connections page

The Bank Connections page shows "Failed to initialize Plaid Link" when Plaid isn't configured.
This looks like the app is broken.

Replace the error state in `src/app/(app)/connections/` with a friendly info card:

**When Plaid is not configured (no PLAID_CLIENT_ID):**
Show an info card instead of the error:
- Icon: Landmark or Building2 from lucide
- Title: "Bank Sync"
- Description: "Connect your bank accounts to automatically import transactions.
  Supports checking, savings, and credit card accounts from thousands of financial institutions."
- "How to set up:" with brief steps:
  1. Create a free Plaid developer account at plaid.com
  2. Add your Plaid credentials in environment variables
  3. Come back here to connect your first account
- Link: "Learn more in the Setup Guide" → links to SETUP.md section

**When Plaid IS configured but no accounts connected:**
Show the current "No bank connections yet" message with the Connect a Bank button.
No error message.

**For the demo user specifically:**
Show sample connected accounts (not real — just UI mockups):
- "Checking ••••4521 — First National Bank" — Last synced: 2 hours ago
- "Business Visa ••••8832 — Chase" — Last synced: 2 hours ago
This shows visitors what the connected state looks like without any real Plaid connection.

## Task 4: Hide "Connect a Bank" and "Sync Now" buttons for demo user

On the Bank Connections page, when it's the demo user:
- Don't show the "Connect a Bank" button (it would fail anyway)
- Don't show "Sync Now" (nothing to sync)
- Show a note: "In your own instance, you'll connect real bank accounts here via Plaid."

## Task 5: Verify the build and commit

Run `npm run build`, fix errors. Commit and push to main.

## Important constraints:
- Demo AI samples must match the actual demo transaction data (amounts, descriptions)
- The narrative sample should look exactly like what Claude would generate
- The categorization suggestions should use real account IDs from the demo Chart of Accounts
- The Plaid fix must handle three states: not configured, configured but empty, and demo user
- Sample bank accounts for demo are purely visual — no real Plaid calls
- Pass isDemo from the server layout to any components that need it
