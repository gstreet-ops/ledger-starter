import { trialBalance, profitAndLoss } from "@/lib/services/reports";
import { ReportsView } from "./reports-view";

export default async function ReportsPage() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [tb, pnl] = await Promise.all([
    trialBalance(),
    profitAndLoss(yearStart, now),
  ]);

  return <ReportsView initialTrialBalance={tb} initialPnl={pnl} />;
}
