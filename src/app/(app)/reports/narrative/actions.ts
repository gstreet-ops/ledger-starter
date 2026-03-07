"use server";

import { profitAndLoss } from "@/lib/services/reports";
import { narratePnL, periodComparison } from "@/lib/ai/narrate";

export async function generateNarrative(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const pnl = await profitAndLoss(start, end);

  const periodLabel = `${start.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "America/New_York" })}`;

  const narrative = await narratePnL(pnl, periodLabel);

  return { pnl, narrative };
}

export async function comparePeriods(
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
) {
  const [currentPnl, previousPnl] = await Promise.all([
    profitAndLoss(new Date(currentStart), new Date(currentEnd)),
    profitAndLoss(new Date(previousStart), new Date(previousEnd)),
  ]);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "America/New_York",
    });

  const comparison = await periodComparison(
    { label: fmt(currentStart), data: currentPnl },
    { label: fmt(previousStart), data: previousPnl }
  );

  return { currentPnl, previousPnl, comparison };
}
