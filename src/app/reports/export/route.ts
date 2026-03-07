import { NextResponse } from "next/server";
import { profitAndLoss } from "@/lib/services/reports";
import {
  selfEmploymentTax,
  federalIncomeTax,
  stateTax,
  getUserSettings,
} from "@/lib/services/tax";
import { narratePnL } from "@/lib/ai/narrate";
import { parseMoney } from "@/lib/utils/money";

function fmt(amount: string | number) {
  const num = typeof amount === "string" ? parseMoney(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const pnl = await profitAndLoss(start, end);
  const netProfit = parseMoney(pnl.netProfit);
  const settings = await getUserSettings();
  const userState = settings?.state ?? "XX";
  const federal = federalIncomeTax(netProfit);
  const se = selfEmploymentTax(netProfit);
  const st = stateTax(netProfit, userState);

  const monthName = start.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Try to get AI narrative
  const narrative = await narratePnL(pnl, monthName);

  // Build markdown
  const lines: string[] = [
    `# Month-End Report: ${monthName}`,
    "",
    "## Profit & Loss Summary",
    "",
    "### Income",
    ...(pnl.income.length > 0
      ? pnl.income.map((a) => `- ${a.name}: ${fmt(a.balance)}`)
      : ["- (none)"]),
    "",
    `**Total Income: ${fmt(pnl.totalIncome)}**`,
    "",
    "### Expenses",
    ...(pnl.expenses.length > 0
      ? pnl.expenses.map((a) => `- ${a.name}: ${fmt(a.balance)}`)
      : ["- (none)"]),
    "",
    `**Total Expenses: ${fmt(pnl.totalExpenses)}**`,
    "",
    `### Net Profit: ${fmt(pnl.netProfit)}`,
    "",
    "## Top Expenses",
    ...pnl.expenses
      .sort((a, b) => parseMoney(b.balance) - parseMoney(a.balance))
      .slice(0, 5)
      .map((a, i) => `${i + 1}. ${a.name}: ${fmt(a.balance)}`),
    "",
    "## Tax Snapshot (if annualized)",
    `- Federal Income Tax: ${fmt(federal.tax)}`,
    `- Self-Employment Tax: ${fmt(se.totalSeTax)}`,
    `- ${st.stateLabel} Income Tax: ${fmt(st.tax)}`,
    `- **Total Estimated Tax: ${fmt(parseMoney(federal.tax) + parseMoney(se.totalSeTax) + parseMoney(st.tax))}**`,
    "",
  ];

  if (narrative) {
    lines.push("## AI Narrative", "", narrative, "");
  }

  lines.push(
    "---",
    `Generated: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}`,
    ""
  );

  const filename = `month-end-${year}-${String(month).padStart(2, "0")}.md`;
  const content = lines.join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
