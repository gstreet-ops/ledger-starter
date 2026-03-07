# Community Feature Tracking — Build Prompt (Phase 1)

Read CLAUDE.md for system goals and .claude/context.md for project state.

## Context

Ledger Starter is an open-source, self-hosted accounting template. Users fork it and build custom features.
We're adding a "My Instance" community page that shows users what they've customized vs the base starter,
with the ability to share their feature fingerprint back to the community.

This is Phase 1: the fingerprint collector, base manifest, comparison page, and schema changes.
Phase 2 (share endpoint + nudge system) comes later.

## Task 1: Create the base manifest

Create `public/base-manifest.json` — a snapshot of the base Ledger Starter's structure.

```json
{
  "version": "0.1.0",
  "generatedAt": "<current ISO timestamp>",
  "tables": [
    "accounts", "categorization_rules", "estimated_tax_payments",
    "file_import_batches", "file_import_rows", "import_rows",
    "plaid_accounts", "plaid_items", "sync_batches",
    "tax_categories", "transaction_lines", "transactions", "user_settings"
  ],
  "routes": [
    "/", "/accounts", "/connections", "/dashboard", "/demo", "/help",
    "/imports", "/login", "/reports", "/reports/export", "/reports/narrative",
    "/rules", "/settings", "/setup", "/tax", "/tax/export", "/tax/quarterly",
    "/transactions", "/transactions/journal", "/transactions/new", "/transactions/review"
  ],
  "integrations": {
    "plaid": "PLAID_CLIENT_ID",
    "anthropic": "ANTHROPIC_API_KEY"
  }
}
```

Also create `scripts/generate-manifest.ts` that:- Queries `information_schema.tables` for public schema table names
- Walks `src/app/` directory to extract route segments
- Checks a known list of integration env var names
- Writes the result to `public/base-manifest.json`
- Can be run with `npx tsx scripts/generate-manifest.ts`

This script is for maintainer use (updating the manifest when base features change).
It does NOT run during user builds — the manifest is committed to the repo as a static file.

## Task 2: Create the fingerprint collector service

Create `src/lib/services/fingerprint.ts` with these functions:

### `getCurrentFingerprint(): Promise<InstanceFingerprint>`

Collects the current instance's structural data:

1. **Schema shape**: Query `information_schema.tables` and `information_schema.columns`
   for the `public` schema. Return table names and their column names.
   ```sql
   SELECT table_name, array_agg(column_name ORDER BY ordinal_position) as columns
   FROM information_schema.columns
   WHERE table_schema = 'public'
   GROUP BY table_name
   ORDER BY table_name;
   ```

2. **Integration inventory**: Check which env vars are set (not their values).
   Check for: PLAID_CLIENT_ID, ANTHROPIC_API_KEY, STRIPE_SECRET_KEY,
   QUICKBOOKS_CLIENT_ID, XERO_CLIENT_ID (and any others that make sense).
   Return as `{ name: string, active: boolean }[]`.

Note: We do NOT scan the filesystem for routes at runtime (deployed instances
don't have filesystem access). Instead, the base manifest includes the base routes,
and any route changes would show up as schema/integration changes anyway.

### `getBaseManifest(): Promise<BaseManifest>`

Reads and parses `public/base-manifest.json`.

### `computeDiff(current: InstanceFingerprint, base: BaseManifest): InstanceDiff`

Compares current fingerprint to base manifest and returns:
```typescript
interface InstanceDiff {
  newTables: string[];           // tables not in base
  removedTables: string[];       // base tables that are gone
  modifiedTables: {              // base tables with new columns
    name: string;
    newColumns: string[];
    removedColumns: string[];
  }[];
  newIntegrations: string[];     // integrations active but not in base
  summary: {
    totalNewTables: number;
    totalModifiedTables: number;
    totalNewIntegrations: number;
    hasChanges: boolean;
  };
}
```
### `hashFingerprint(fingerprint: InstanceFingerprint): string`

Returns a SHA-256 hash of the fingerprint for change detection.
Used to check if the instance has changed since the last share.

## Task 3: Add community sharing columns to user_settings

Create a new Drizzle migration `drizzle/0006_add-community-sharing.sql`:

```sql
ALTER TABLE user_settings ADD COLUMN community_sharing_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE user_settings ADD COLUMN last_shared_fingerprint jsonb;
ALTER TABLE user_settings ADD COLUMN last_shared_at timestamp with time zone;
ALTER TABLE user_settings ADD COLUMN nudge_snoozed_until timestamp with time zone;
```

Update `src/lib/db/schema.ts` to add these columns to the `userSettings` table definition.
Update the drizzle journal in `drizzle/meta/_journal.json` to include migration 0006.

## Task 4: Create the /community page

Create `src/app/community/page.tsx` — a server component that:

1. Has `export const dynamic = "force-dynamic"` (queries the DB)
2. Calls `getCurrentFingerprint()` and `getBaseManifest()`
3. Calls `computeDiff()` to get the instance diff
4. Reads `user_settings` for the community sharing columns
5. Passes everything to a client component for rendering

Create `src/app/community/community-view.tsx` — a client component that displays:

### Layout

**Header section:**
- Title: "My Instance"
- Subtitle: "See how your Ledger Starter has evolved from the base template"
- If they have no changes: show a friendly "Your instance matches the base template" message

**Diff summary cards (if changes exist):**
Three cards in a row:
- "New Tables" — count badge + list of table names
- "Modified Tables" — count badge + expandable list showing new columns per table
- "New Integrations" — count badge + list of integration names

**Structural fingerprint section:**
A collapsible "View Full Fingerprint" that shows the raw JSON of their current
fingerprint — this is what would be shared. Make it clear: "This is structural
data only — table names, column names, and active integrations. No financial
data, transaction details, or personal information is included."

**Share section (placeholder for Phase 2):**
A card at the bottom with:
- "Share with the Ledger Starter Community"
- Brief explanation of what sharing does
- A disabled button that says "Coming Soon" (we'll enable this in Phase 2)
- Toggle for `community_sharing_enabled` that saves to user_settings

### Styling
Use the same shadcn/ui components and Tailwind classes as the rest of the app.
Follow the existing page patterns (see /accounts, /reports, /settings for reference).

## Task 5: Add /community to the sidebar navigation

In `src/components/app-sidebar.tsx`, add a "Community" nav item with the
Users icon from lucide-react. Place it after "Rules" and before "Narrative"
in the sidebar menu.

## Task 6: Verify the build

After all changes, run `npm run build` and fix any TypeScript errors.
The build must pass cleanly.

## Important constraints:
- The fingerprint collector must NEVER access financial data — only structural metadata
- The base manifest is a static file committed to the repo, not generated at build time
- The /community page should work even if the user hasn't completed setup
- All new code should follow existing patterns in the codebase
- Use the `db` import from `@/lib/db/drizzle` for database queries
- Use `sql` from `drizzle-orm` for raw SQL queries (like information_schema)
- The migration must be a standalone SQL file, not a Drizzle push