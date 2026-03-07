# Add Roadmap Page with Competitive Analysis

## Prerequisites

Before running this prompt, copy the competitive analysis component into the repo:

1. Open https://claude.ai and go to the ledger-starter project
2. Download `competitive-analysis.jsx` from the project files
3. Save it as `src/app/(app)/roadmap/competitive-analysis.tsx` in the ledger-starter repo
4. Add `"use client";` as the first line if not already present

OR: The file content is pasted at the bottom of this prompt.

## Task 1: Create the roadmap page

Create `src/app/(app)/roadmap/page.tsx`:
```tsx
import CompetitiveAnalysis from "./competitive-analysis";

export default function RoadmapPage() {
  return <CompetitiveAnalysis />;
}
```

Verify `competitive-analysis.tsx` exists in the same directory.
If it doesn't, inform the user they need to copy it first.

Add "use client" at the very top if missing. Convert the default export name
from `CompetitiveAnalysis` to match what page.tsx imports.

## Task 2: Add to sidebar navigation

In `src/components/app-sidebar.tsx`, add a "Roadmap" nav item near the bottom,
before Settings:

```typescript
{ title: "Roadmap", href: "/roadmap", icon: Map },
```

Import `Map` from lucide-react.

## Task 3: Add to landing page

In the landing page at `src/app/page.tsx`, add a link to the roadmap.
Below the feature cards or in the footer area, add a text link:
"See our competitive analysis and roadmap →" linking to "/roadmap".

## Task 4: Convert inline styles to Tailwind

The competitive-analysis component uses inline `style={}` objects.
Convert to Tailwind CSS classes for consistency with the rest of the app.
Key mappings:
- fontSize 10-11 → text-xs, fontSize 13 → text-sm, fontSize 14 → text-sm
- fontWeight 600 → font-semibold, 700 → font-bold, 800 → font-extrabold
- color "#0ea5e9" → text-sky-500, "#71717a" → text-zinc-500
- background "#f0f9ff" → bg-sky-50, "#fafafa" → bg-zinc-50
- border "1px solid #e4e4e7" → border border-zinc-200
- borderRadius 8-12 → rounded-lg or rounded-xl
- padding → p-3, p-4, px-4, py-2, etc.

Use shadcn Card, Badge, and Button components where natural.
Keep the tab system, sorting, hover tooltips, and all interactive behavior.
Don't lose any functionality during the conversion.

## Task 5: Verify and push

- Verify the page loads at /roadmap
- All 4 tabs work (Feature Matrix, Gap Analysis, Where We Win, Roadmap Input)
- Hover tooltips show on the feature matrix cells
- Sorting works (Default, Feature Count, Price)
- "Show only our gaps" toggle works
- Commit and push to GitHub
