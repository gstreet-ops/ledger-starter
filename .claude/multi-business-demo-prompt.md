# Multi-Business Demo Profiles

## Context

Ledger Starter's demo currently shows one business: "Acme Consulting LLC" (TX, SMLLC).
The seed logic lives in `src/lib/services/demo-seed.ts` with a `seedDemoData()` function
and a `purgeDemoData()` function. The reset API at `/api/demo/reset` calls both.

We want to add 2 more demo business profiles so visitors can see the product with
different types of businesses. The profiles should be selectable from the landing page.

## The Three Business Profiles

### 1. Acme Consulting LLC (existing — keep as-is)
- Entity: Single-member LLC, TX, Schedule C
- Owner: Jane Smith
- Revenue: Consulting retainers, project-based billing
- Expenses: Software, travel, meals, office supplies, marketing

### 2. Sparkling Mobile Car Wash
- Entity: Single-member LLC, FL, Schedule C
- Owner: Marcus Rivera
- Revenue: Residential washes ($35-75), fleet contracts ($500-1500/mo)
- Expenses: Water/supplies, vehicle maintenance, fuel, insurance, marketing
- Story: Mobile service, heavy mileage and supply costs
- ~20 transactions Jan-May 2026
- FL has no state income tax — federal + SE only

### 3. Pixel & Dice — Online Board Game Retailer
- Entity: Single-member LLC, WA, Schedule C
- Owner: Sarah Chen
- Revenue: Shopify sales, Amazon marketplace, local game night events
- Expenses: COGS, shipping, platform fees, warehouse rent, marketing
- Story: Wholesale purchasing, online selling, inventory-adjacent
- ~20 transactions Jan-May 2026
- WA has no income tax but has B&O tax

## Task 1: Refactor demo-seed.ts for multiple profiles

Define a DemoProfile type. Create 3 profile objects. Update seedDemoData() to accept
an optional profileId parameter (defaults to "acme-consulting"). Each profile includes
its own user_settings, extra accounts, transactions, import_rows, rules, quarterly payments.
Update purgeDemoData() to stay profile-agnostic.

## Task 2: Update demo-samples.ts

Export getDemoSamples(profileId) returning { narrative, comparison } per profile.
Write realistic AI narratives for each business focusing on their unique characteristics.

## Task 3: Demo profile via query parameter

Update /demo route.ts to read a `profile` query param: `/demo?profile=car-wash`
Calls purgeDemoData() then seedDemoData(profile) before signing in.
Default to "acme-consulting" if no param.

## Task 4: Update the landing page

Show 3 demo cards on the landing page:
- Consulting (Acme, TX, Services)
- Car Wash (Sparkling, FL, Mobile Service)
- Board Games (Pixel & Dice, WA, E-commerce)
Each links to /demo?profile=X

## Task 5: Update reset API

POST /api/demo/reset accepts optional profile query param.
Resets to specified profile or defaults to acme-consulting.

## Task 6: Update demo banner

Show current business name: "demo of Ledger Starter — Sparkling Mobile Car Wash"

## Conventions
- Cents as integers (500000 = $5,000.00), DEMO_TAG = "DEMO"
- Standard account codes (5xxx expenses, 4xxx income)
- ~20 transactions per profile, dates Jan-May 2026
- Commit and push when done
