"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
import { snoozeNudge } from "@/app/community/actions";

type Props = {
  reason: string;
};

export function CommunityNudge({ reason }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function handleSnooze() {
    setDismissed(true);
    await snoozeNudge();
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
      <CardContent className="flex items-center gap-4 py-3">
        <Users className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{reason}</p>
          <p className="text-xs text-muted-foreground">
            Share your structural fingerprint to help the community.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" variant="default">
            <Link href="/community">Share</Link>
          </Button>
          <button
            onClick={handleSnooze}
            className="text-muted-foreground hover:text-foreground p-1"
            aria-label="Dismiss for 7 days"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
