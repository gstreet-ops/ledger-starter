import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { estimatedTaxPayments } from "@/lib/db/schema";
import { parseMoney } from "@/lib/utils/money";
import {
  scheduleCReport,
  selfEmploymentTax,
  federalIncomeTax,
  georgiaIncomeTax,
  quarterlyDueDates,
} from "./tax";

export type QuarterStatus = "upcoming" | "due" | "overdue" | "paid";

export type QuarterDetail = {
  quarter: number;
  label: string;
  dueDate: string;
  estimatedAmount: string;
  paidAmount: string;
  paidDate: string | null;
  status: QuarterStatus;
};

export type QuarterlyOverview = {
  year: number;
  quarters: QuarterDetail[];
  ytdProjection: {
    annualizedProfit: string;
    federalTax: string;
    seTax: string;
    gaTax: string;
    totalTax: string;
  };
  totalEstimated: string;
  totalPaid: string;
};

function getQuarterStatus(
  dueDate: string,
  paidAmount: number,
  estimatedAmount: number,
  today: string
): QuarterStatus {
  if (paidAmount > 0 && paidAmount >= estimatedAmount) return "paid";
  if (dueDate < today) return "overdue";
  // Due within 30 days
  const due = new Date(dueDate);
  const now = new Date(today);
  const daysUntil = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntil <= 30) return "due";
  return "upcoming";
}

/**
 * Compute prior year's total tax for safe harbor calculation.
 * Safe harbor: pay at least 100% of prior year tax (110% if AGI > $150k)
 * to avoid underpayment penalties, regardless of current year projection.
 */
async function priorYearTax(
  year: number
): Promise<{ total: number; annualizedProfit: number } | null> {
  const priorYear = year - 1;
  const report = await scheduleCReport(priorYear);
  const netProfit = parseMoney(report.netProfit);

  if (netProfit <= 0) return null;

  const federal = federalIncomeTax(netProfit);
  const se = selfEmploymentTax(netProfit);
  const ga = georgiaIncomeTax(netProfit);

  const total =
    parseMoney(federal.tax) + parseMoney(se.totalSeTax) + parseMoney(ga.tax);

  return total > 0 ? { total, annualizedProfit: netProfit } : null;
}

/**
 * Compute quarterly estimates with YTD annualization.
 * Annualizes YTD profit based on how far into the year we are,
 * then projects full-year tax liability.
 *
 * Safe harbor: if prior year tax data exists, the minimum quarterly
 * payment is max(current_year_projection/4, prior_year_tax/4).
 * Uses 110% of prior year if prior year AGI exceeded $150k.
 */
export async function quarterlyOverview(
  year: number
): Promise<QuarterlyOverview> {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentYear = now.getFullYear();

  // Get YTD Schedule C data
  const report = await scheduleCReport(year);
  const ytdNetProfit = parseMoney(report.netProfit);

  // Annualize: project full-year based on elapsed portion of year
  let annualizedProfit: number;
  if (year < currentYear) {
    // Past year — use actual full-year numbers
    annualizedProfit = ytdNetProfit;
  } else {
    // Current or future year — annualize based on elapsed days
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    const totalDays = Math.ceil(
      (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.max(
      1,
      Math.ceil(
        (Math.min(now.getTime(), yearEnd.getTime()) - yearStart.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    annualizedProfit = (ytdNetProfit / elapsedDays) * totalDays;
  }

  // Compute projected taxes on annualized profit
  const federal = federalIncomeTax(annualizedProfit);
  const se = selfEmploymentTax(annualizedProfit);
  const ga = georgiaIncomeTax(annualizedProfit);

  const totalAnnualTax =
    parseMoney(federal.tax) + parseMoney(se.totalSeTax) + parseMoney(ga.tax);

  // Safe harbor: use max of current projection vs prior year tax
  let safeHarborAnnual = totalAnnualTax;
  const prior = await priorYearTax(year);
  if (prior) {
    // 110% of prior year if AGI > $150k, otherwise 100%
    const multiplier = prior.annualizedProfit > 150000 ? 1.1 : 1.0;
    const priorSafeHarbor = prior.total * multiplier;
    safeHarborAnnual = Math.max(totalAnnualTax, priorSafeHarbor);
  }
  const quarterlyAmount = safeHarborAnnual / 4;

  // Fetch payment records
  const payments = await db
    .select()
    .from(estimatedTaxPayments)
    .where(eq(estimatedTaxPayments.year, year));

  const paymentMap = new Map(payments.map((p) => [p.quarter, p]));
  const dueDates = quarterlyDueDates(year);

  const quarters: QuarterDetail[] = dueDates.map((d) => {
    const payment = paymentMap.get(d.quarter);
    const paidAmount = payment ? parseMoney(payment.paidAmount) : 0;
    const status = getQuarterStatus(d.dueDate, paidAmount, quarterlyAmount, today);

    return {
      quarter: d.quarter,
      label: d.label,
      dueDate: d.dueDate,
      estimatedAmount: quarterlyAmount.toFixed(2),
      paidAmount: paidAmount.toFixed(2),
      paidDate: payment?.paidDate?.toISOString().split("T")[0] ?? null,
      status,
    };
  });

  const totalPaid = quarters.reduce(
    (sum, q) => sum + parseMoney(q.paidAmount),
    0
  );

  return {
    year,
    quarters,
    ytdProjection: {
      annualizedProfit: annualizedProfit.toFixed(2),
      federalTax: federal.tax,
      seTax: se.totalSeTax,
      gaTax: ga.tax,
      totalTax: totalAnnualTax.toFixed(2),
    },
    totalEstimated: (quarterlyAmount * 4).toFixed(2),
    totalPaid: totalPaid.toFixed(2),
  };
}

/**
 * Get next upcoming quarterly payment info for dashboard.
 */
export async function nextQuarterlyPayment(year: number): Promise<{
  quarter: number;
  label: string;
  dueDate: string;
  amount: string;
  daysUntilDue: number;
  status: QuarterStatus;
} | null> {
  const overview = await quarterlyOverview(year);
  const today = new Date();

  // Find next non-paid quarter
  for (const q of overview.quarters) {
    if (q.status !== "paid") {
      const due = new Date(q.dueDate);
      const daysUntilDue = Math.ceil(
        (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        quarter: q.quarter,
        label: q.label,
        dueDate: q.dueDate,
        amount: q.estimatedAmount,
        daysUntilDue,
        status: q.status,
      };
    }
  }
  return null;
}
