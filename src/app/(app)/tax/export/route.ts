import { NextRequest, NextResponse } from "next/server";
import { scheduleCReport, selfEmploymentTax, federalIncomeTax, stateTax, getUserSettings } from "@/lib/services/tax";
import { parseMoney } from "@/lib/utils/money";

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (isNaN(year) || year < 2020 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const report = await scheduleCReport(year);
  const netProfit = parseMoney(report.netProfit);
  const settings = await getUserSettings();
  const userState = settings?.state ?? "XX";
  const se = selfEmploymentTax(netProfit);
  const federal = federalIncomeTax(netProfit);
  const st = stateTax(netProfit, userState);

  const lines: string[] = [];
  lines.push("Schedule C Line,Description,YTD Total");

  for (const item of report.lineItems) {
    if (parseMoney(item.total) !== 0) {
      lines.push(`"${item.line}","${item.description}","${item.total}"`);
    }
  }

  lines.push("");
  lines.push("Summary,,");
  lines.push(`"Gross Income","",${report.grossIncome}`);
  lines.push(`"Total Expenses","",${report.totalExpenses}`);
  lines.push(`"Net Profit (Line 31)","",${report.netProfit}`);
  lines.push("");
  lines.push("Tax Estimates,,");
  lines.push(`"Federal Income Tax","",${federal.tax}`);
  lines.push(`"Self-Employment Tax","",${se.totalSeTax}`);
  lines.push(`"${st.stateLabel} Income Tax","",${st.tax}`);

  const totalTax = parseMoney(federal.tax) + parseMoney(se.totalSeTax) + parseMoney(st.tax);
  lines.push(`"Total Estimated Tax","",${totalTax.toFixed(2)}`);

  const csv = lines.join("\n");
  const filename = `schedule-c-export-${year}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
