# Ledger Starter — Project Context

> Template file. Replace all {PLACEHOLDER} values after running the /setup wizard.
> Maintained by Claude across sessions for build continuity.

## Current State
- **Active branch**: main
- **Last deployment**: 2026-03-07 — https://ledger-starter.vercel.app (auto-deploys on push)
- **Supabase project**: fmbfoqmlkozxdmruncho
- **Plaid**: {PLAID_ACCOUNT_EMAIL} — set after creating your Plaid developer account
- **Phase**: Deployed and demo-ready. Landing page + demo + deploy button all live.
- **Note**: This project has its own Supabase (fmbfoqmlkozxdmruncho) and Vercel project (prj_Dl5mFHGYHIBM95j9MNYTP52GdW4k)
- **Migrations applied**: 0000-0007 (7 total)
- **Demo**: demo@ledger-starter.app / Acme Consulting LLC / TX / 22 posted transactions (Jan-May 2026)
- **Git author**: Brian <brian@globestreet.com>

## Setup Status
- [ ] `.env.local` filled in from `.env.local.example`
- [ ] `npm install` run
- [ ] `npx drizzle-kit push` run against your Supabase project
- [ ] `/setup` wizard completed (entity type, state, filing method)
- [ ] Supabase Auth user created
- [ ] Demo data seeded (optional): `npx tsx scripts/seed-demo-data.ts`

## Architecture Notes
- Next.js 15 + Supabase + Drizzle + Plaid + Anthropic API
- See CLAUDE.md for full stack and conventions
- user_settings table drives all entity/state/filing behavior
- Schema has 10 tables (9 core + user_settings), seed has full Chart of Accounts

## Session Log
### Template created 2026-03-06
- Scaffolded from gstreet-ledger (private instance)
- src/, drizzle/ migrations, scripts copied as-is (generic double-entry)
- CLAUDE.md rewritten as state-agnostic template
- context.md replaced with placeholder version
- user_settings schema + migration added
- /setup wizard page added (multi-step: entity → state → filing → Plaid → confirm)
- seed/demo-data.ts added with fictional Acme Consulting transactions
- SETUP.md onboarding doc written

### Fork cleanup 2026-03-07
- Renamed package from gstreet-ledger to ledger-starter
- Replaced all GStreet branding (sidebar, Plaid, help page GitHub URL)
- Made AI prompts (narrate, suggest) read state dynamically from user_settings
- Cleaned FAQ data: removed Georgia-specific entries, made state-agnostic
- Removed georgiaIncomeTax function; all callers now use stateTax with user_settings state
- Removed GA fallback in stateTax — returns "Not configured" for unknown states
- Renamed ga_form_category column to state_form_category (migration 0005)
- Updated all references across schema, queries, seed files, and UI

### Community features Phase 1 — 2026-03-07
- Base manifest (public/base-manifest.json) with 13 tables, 21 routes, 2 integrations
- Fingerprint collector service (schema shape, integration inventory, diff, hash)
- /community page with diff cards, fingerprint viewer, sharing toggle
- Migration 0006: community sharing columns on user_settings
- Sidebar nav: Community link with Users icon

### Community features Phase 2 — 2026-03-07
- POST /api/community/share with local storage + optional GitHub Issues posting
- Migration 0007: community_reports table for local audit trail
- Share dialog with diff preview, optional description, privacy note
- Change-based nudge on dashboard (respects snooze, sharing toggle)
- Blue dot badge on Community sidebar nav when unshared changes exist

### Deploy button + AI degradation — 2026-03-07
- One-click Deploy to Vercel button in README with Supabase integration (oac_jUduyjQgOyzev1fjrW83NYOv)
- README rewritten as concise landing page
- AI suggest/narrate return friendly messages when ANTHROPIC_API_KEY missing
- UI indicators on review page, narrative page, and Settings for AI status
- SETUP.md updated with one-click deploy, optional API keys

### Demo → Deploy experience — 2026-03-07
- Public landing page at / with hero, feature cards, how-it-works, deploy buttons
- Restructured app into (app) route group so landing page renders without sidebar
- Demo banner (amber) with "Deploy Your Own" and "View on GitHub" buttons
- Sidebar "Like what you see?" CTA card for demo users only
- "← Back to Ledger Starter" link at top of sidebar for demo users
- Updated demo data to 2026 dates, status "posted" for YTD metrics
- Re-seeded live Supabase DB with 22 transactions (Jan-May 2026)
- Demo user detection moved server-side (layout passes isDemo prop)
- Middleware updated to allow public access to landing page
- Vercel env vars verified: NEXT_PUBLIC_DEMO_EMAIL, DEMO_EMAIL, DEMO_PASSWORD, NEXT_PUBLIC_SITE_URL

### Demo AI samples + Plaid fix — 2026-03-07
- Pre-generated narrative and period comparison for demo user (no Anthropic API needed)
- Pattern-based categorization suggestions in demo-suggestions.ts
- isCurrentUserDemo() helper in demo-check.ts
- Connections page: 3-state handling (demo/not-configured/normal)
- NOTE: Connections page may not be receiving isDemo prop — needs verification next session
- Community feature tracking: Manual Share with Gentle Nudges (C3b+)
  - "My Instance" comparison page, manual share button, change-based nudges
  - Phased: now=manual share, 10-20 forks=nudges+changelog, 50+=hybrid auto-sync
  - Formal decision artifact saved as project file (community-feature-tracking-decision.jsx)
- Install experience: One-click Vercel deploy with Supabase Marketplace integration
- AI strategy: graceful degradation now, multi-provider abstraction later, proxy trial eventually

### Skills created — 2026-03-07
- /pc (pros-cons): Progressive comparison — table → go deeper → formalize (/pc!)
- /cc (context-check): Monitor and update project context across sessions
- Both saved at C:\Users\brian\projects\skills\

## Roadmap

### Near-term
- [x] Demo → Deploy experience (landing page, demo banner CTA, sidebar CTA, 2026 demo data) ✅
- [ ] Final demo polish: rename back link, move Community under Settings, fix narrative date defaults
- [ ] Auth user creation flow (signup page or public setup wizard for first-run)
- [ ] UPSTREAM.md tracking file in gstreet-ledger for porting features
- [ ] Supabase project renamed to "GST Books" in dashboard (display only)

### Medium-term
- [ ] AI proxy trial — limited free AI calls via hosted endpoint, transition to own key
- [ ] Multi-provider AI abstraction (Anthropic / OpenAI / Google) via user_settings
- [ ] Community changelog page showing features built by community
- [ ] Upgrade to Hybrid community tracking (opt-in auto-sync) at 20+ forks

### Long-term
- [ ] Module/plugin system — UI-based feature activation without code editing
  - Feature modules (invoicing, recurring transactions, mileage, 1099 tracking)
  - Pre-built code in repo, activated by feature flags in user_settings
  - /settings/modules page to browse and toggle modules
  - Auto-run migrations when modules are activated
  - Similar pattern to Hallaron/trivia platform admin interfaces
- [ ] CLI setup script (npx ledger-starter init)
- [ ] Custom domain support
