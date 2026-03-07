# Community Feature Tracking — Phase 2: Share Endpoint + Nudge System

Read CLAUDE.md for system goals and .claude/context.md for project state.

## Context

Phase 1 is complete: we have a fingerprint collector, base manifest, /community page with diff view,
and community sharing columns on user_settings. Phase 2 adds the actual sharing mechanism and the
gentle nudge system that reminds users to share when their instance has changed.

## Task 1: Create the share API endpoint

Create `src/app/api/community/share/route.ts` — a POST endpoint that:

1. Requires authentication (check Supabase session)
2. Accepts the fingerprint payload:
```typescript
{
  fingerprint: InstanceFingerprint;  // from fingerprint.ts
  diff: InstanceDiff;               // from fingerprint.ts
  description?: string;             // optional user description of what they built
  version: string;                  // base manifest version they forked from
}
```
3. For now, posts the data as a GitHub Issue to `gstreet-ops/ledger-starter` using the GitHub API:
   - Title: `[Community Feature Report] {summary}` where summary is auto-generated from the diff
     (e.g., "2 new tables, 1 new integration")
   - Body: formatted markdown with the diff details, description, and version
   - Labels: `community-feature`
   - Use a GitHub token from env var `GITHUB_COMMUNITY_TOKEN` (a fine-grained PAT with Issues write permission)
   - If GITHUB_COMMUNITY_TOKEN is not set, fall back to storing the report in a local
     `community_reports` table (create it if taking this approach)
4. After successful share, updates `user_settings`:
   - `last_shared_fingerprint` = current fingerprint JSON
   - `last_shared_at` = now()
5. Returns success/error JSON response

## Task 2: Create the community_reports fallback table

Create migration `drizzle/0007_add-community-reports.sql`:

```sql
CREATE TABLE IF NOT EXISTS "community_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fingerprint" jsonb NOT NULL,
  "diff" jsonb NOT NULL,
  "description" text,
  "base_version" text NOT NULL,
  "fingerprint_hash" text NOT NULL,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

Add the table to `src/lib/db/schema.ts`.
Update the drizzle journal.

This table stores reports locally when no GitHub token is configured.
It's also useful as a local audit trail of what was shared.

## Task 3: Enable the share button on /community page

Update `src/app/community/community-view.tsx`:

1. Replace the "Coming Soon" disabled button with a working "Share with Community" button
2. When clicked, show a modal/dialog with:
   - A preview of what will be shared (the diff summary)
   - An optional text field for "Describe what you built (optional)"
   - A privacy note: "Only structural data is shared — table names, column names, and active
     integrations. No financial data, transaction details, or personal information."
   - "Share" and "Cancel" buttons
3. On submit, POST to `/api/community/share` with the fingerprint, diff, and description
4. Show success/error feedback
5. After successful share, update the UI to show "Last shared: [date]"

## Task 4: Build the nudge system

### 4a: Nudge detection service

Add to `src/lib/services/fingerprint.ts`:

```typescript
interface NudgeState {
  shouldShow: boolean;
  reason?: string;          // e.g., "2 new tables, 1 new route since your last share"
  changesSinceLastShare: {
    newTables: number;
    modifiedTables: number;
    newIntegrations: number;
  };
}

function checkNudge(
  currentFingerprint: InstanceFingerprint,
  userSettings: UserSettings  // has last_shared_fingerprint, nudge_snoozed_until
): NudgeState
```

Logic:
- If `community_sharing_enabled` is false → don't show
- If `nudge_snoozed_until` is in the future → don't show
- If `last_shared_fingerprint` is null → show if instance has ANY changes from base
- Otherwise, compute diff between current fingerprint and `last_shared_fingerprint`
- Show nudge if: 2+ new tables, OR 3+ new columns across tables, OR 1+ new integrations
- The `reason` string should be human-readable: "Your instance has grown — 2 new tables and
  1 new integration since your last share"

### 4b: Nudge component

Create `src/components/community-nudge.tsx` — a client component that renders a subtle card:

```
🔄 Your instance has grown — {reason}

Share what you've built → helps the community prioritize
See what others built → visit the Ledger Starter changelog

[ Share My Updates ]  [ View Changelog ]  [ Dismiss for 30 days ]
```

- "Share My Updates" links to /community
- "View Changelog" links to https://github.com/gstreet-ops/ledger-starter/releases
- "Dismiss for 30 days" calls a server action that sets `nudge_snoozed_until` to now + 30 days
- Style it as a subtle info card — not a modal, not a toast. Use blue/indigo accent colors
  consistent with the rest of the app. Similar to how a shadcn Alert component looks.

### 4c: Add nudge to dashboard

Update `src/app/dashboard/page.tsx`:

1. Import and call `checkNudge()` with current fingerprint and user settings
2. If `shouldShow` is true, render `<CommunityNudge>` at the top of the dashboard,
   above the existing dashboard content
3. Pass the nudge state (reason, changes) as props

### 4d: Snooze server action

Create a server action in `src/app/community/actions.ts` (or add to existing):

```typescript
"use server"

async function snoozeNudge(): Promise<void> {
  // Update user_settings.nudge_snoozed_until to now + 30 days
}
```

## Task 5: Update sidebar badge (optional enhancement)

In `src/components/app-sidebar.tsx`, add a small dot indicator next to the "Community"
nav item when the nudge would show (i.e., there are unshared changes). This draws
attention to the community page without being intrusive.

Use a small colored dot (indigo/blue, 6px) positioned after the text, similar to
notification badges in other apps.

## Task 6: Verify the build

After all changes, run `npm run build` and fix any TypeScript errors.
The build must pass cleanly.

## Important constraints:
- The share endpoint must NEVER include financial data in the payload
- The GitHub Issue body should be well-formatted markdown, scannable at a glance
- The nudge must be dismissable and respect the snooze period
- The nudge should NEVER appear if community_sharing_enabled is false
- The share modal must clearly show what data will be shared before the user confirms
- All new server actions need "use server" directive
- Follow existing patterns for API routes (check /api/sync/route.ts for reference)
- The community_reports table is a fallback AND a local audit trail
