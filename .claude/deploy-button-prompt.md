# Deploy Button + AI Graceful Degradation

Read CLAUDE.md for system goals and .claude/context.md for project state.

## Context

Ledger Starter needs a one-click deploy experience and graceful handling of missing AI features.
The deploy button uses Vercel's clone flow with the Supabase integration to auto-provision the database.
AI features (categorization suggestions and narrative reports) should work beautifully in demo mode
but degrade gracefully when no ANTHROPIC_API_KEY is configured.

## Task 1: Add Deploy to Vercel button to README.md

Update README.md to include a prominent deploy section near the top. The button URL should be:

```
https://vercel.com/new/clone?repository-url=https://github.com/gstreet-ops/ledger-starter&project-name=my-ledger&integration-ids=oac_jUduyjQgOyzev1fjrW83NYOv&env=PLAID_CLIENT_ID,PLAID_SECRET,PLAID_ENV,PLAID_TOKEN_ENCRYPTION_KEY,ANTHROPIC_API_KEY&envDescription=Plaid%20and%20Anthropic%20are%20optional.%20Supabase%20env%20vars%20are%20set%20automatically%20by%20the%20integration.&envLink=https://github.com/gstreet-ops/ledger-starter/blob/main/SETUP.md
```

Use the standard Vercel deploy badge:
```markdown
[![Deploy with Vercel](https://vercel.com/button)](URL_ABOVE)
```

The README should have this structure:
1. Title + one-line description
2. Deploy button (prominent, above the fold)
3. "What you get" — brief feature list
4. "Quick Start" — pointing to the deploy button for hosted, or SETUP.md for local
5. "Features" — more detailed feature breakdown
6. "Tech Stack" section
7. "Contributing" — link to CONTRIBUTING.md (we'll create later)
8. "License" — MIT

Keep it concise — this is a landing page, not documentation. SETUP.md handles the details.

## Task 2: Update .env.local.example with all current env vars

Add the missing env vars to `.env.local.example`:

```
# Demo mode (optional — for running a public demo instance)
DEMO_EMAIL=demo@your-app.app
DEMO_PASSWORD=your-demo-password
NEXT_PUBLIC_DEMO_EMAIL=demo@your-app.app
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# Community features (optional — for GitHub Issue posting)
# GITHUB_COMMUNITY_TOKEN=your-github-pat-with-issues-permission
```

Also fix the env var name: the example has `PLAID_ENCRYPTION_KEY` but the
actual code uses `PLAID_TOKEN_ENCRYPTION_KEY`. Fix the example to match.

## Task 3: Graceful AI degradation in suggest.ts

Update `src/lib/ai/suggest.ts`:

When `ANTHROPIC_API_KEY` is not set (undefined or empty string):
- The `suggestCategoriesBatch` function should NOT throw an error
- Instead, return an empty suggestions array with a `status: "ai_not_configured"` indicator
- Log a warning: "ANTHROPIC_API_KEY not set — AI categorization disabled"

## Task 4: Graceful AI degradation in narrate.ts

Update `src/lib/ai/narrate.ts`:

When `ANTHROPIC_API_KEY` is not set:
- `narratePnL` and `periodComparison` should NOT throw errors
- Instead, return a friendly message like:
  "AI narrative reports require an Anthropic API key. Add your key in Settings to enable AI-powered financial summaries."
- Log a warning: "ANTHROPIC_API_KEY not set — AI narrative disabled"

## Task 5: UI indicators for missing AI features

### 5a: Transaction review page
In the transaction review UI (wherever AI suggestions are displayed), if suggestions
come back with `status: "ai_not_configured"`:
- Show a subtle info card: "AI categorization is not configured. Add your Anthropic API key in Settings to get intelligent category suggestions."
- Don't show an error — just a helpful prompt
- The rest of the review flow works normally (manual categorization)

### 5b: Narrative reports page
On `src/app/reports/narrative/page.tsx`, if the narrative comes back as the
"AI not configured" message:
- Display it in a styled info card (not an error state)
- Include a link to Settings
- Show what the feature does: "When configured, AI generates plain-English summaries of your P&L, including trend analysis and period-over-period comparisons."

### 5c: Settings page — AI configuration section
Add a section to `src/app/settings/settings-view.tsx` (or wherever settings are rendered):
- Title: "AI Features"
- Status indicator: green dot + "Connected" if ANTHROPIC_API_KEY is set, or
  gray dot + "Not configured" if missing
- Brief description: "AI powers two features: intelligent transaction categorization and
  narrative financial reports."
- Note: "Your API key is set as an environment variable (ANTHROPIC_API_KEY). Update it in
  your hosting provider's settings (Vercel → Project Settings → Environment Variables)."
- Don't allow editing the key in the UI (it's an env var, not a DB setting) — just show status

## Task 6: Update SETUP.md

Update the SETUP.md to:
1. Add a "One-Click Deploy" section at the top pointing to the Vercel deploy button
2. Mark Plaid and Anthropic as clearly OPTIONAL throughout
3. Fix the PLAID_ENCRYPTION_KEY → PLAID_TOKEN_ENCRYPTION_KEY naming
4. Add a "Features requiring API keys" section explaining what Plaid and Anthropic enable
5. Add a note about the /demo route for testing

## Task 7: Verify the build

After all changes, run `npm run build` and fix any TypeScript errors.
The build must pass cleanly.

## Important constraints:
- AI degradation must be graceful — no errors, no broken pages, just helpful prompts
- The deploy button URL must be exactly right — test the URL format carefully
- README should be concise and scannable — it's a landing page
- Don't create a Settings UI for entering the API key (it's an env var)
- The demo instance should continue to work perfectly (it has the API key set)
