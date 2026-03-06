import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { accounts, transactions, transactionLines } from "@/lib/db/schema";
import { parseMoney } from "@/lib/utils/money";

// Schedule C line descriptions for display
const SCHEDULE_C_LINES: Record<string, string> = {
  "1": "Gross receipts or sales",
  "2": "Returns and allowances",
  "6": "Other income",
  "8": "Advertising",
  "9": "Car and truck expenses",
  "10": "Commissions and fees",
  "11": "Contract labor",
  "15": "Insurance (other than health)",
  "16a": "Interest — mortgage",
  "16b": "Interest — other",
  "17": "Legal and professional services",
  "18": "Office expense",
  "20a": "Rent or lease — vehicles/equipment",
  "20b": "Rent or lease — other",
  "21": "Repairs and maintenance",
  "22": "Supplies",
  "23": "Taxes and licenses",
  "24a": "Travel",
  "24b": "Meals (50% deductible)",
  "25": "Utilities",
  "26": "Wages",
  "27a": "Other expenses",
};

export type ScheduleCLineItem = {
  line: string;
  description: string;
  total: string;
};

export type ScheduleCReport = {
  lineItems: ScheduleCLineItem[];
  grossIncome: string;
  totalExpenses: string;
  netProfit: string;
};

export async function scheduleCReport(year: number): Promise<ScheduleCReport> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  const rows = await db
    .select({
      scheduleCLine: accounts.scheduleCLine,
      type: accounts.type,
      totalDebit: sql<string>`coalesce(sum(${transactionLines.debit}), 0)`,
      totalCredit: sql<string>`coalesce(sum(${transactionLines.credit}), 0)`,
    })
    .from(accounts)
    .innerJoin(transactionLines, eq(accounts.id, transactionLines.accountId))
    .innerJoin(transactions, eq(transactionLines.transactionId, transactions.id))
    .where(
      and(
        eq(transactions.status, "posted"),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
        sql`${accounts.scheduleCLine} IS NOT NULL`
      )
    )
    .groupBy(accounts.scheduleCLine, accounts.type);

  // Aggregate by Schedule C line
  const lineMap = new Map<string, number>();

  for (const row of rows) {
    const line = row.scheduleCLine!;
    const debit = parseMoney(row.totalDebit);
    const credit = parseMoney(row.totalCredit);
    // Income: normal credit balance (credit - debit)
    // Expense: normal debit balance (debit - credit)
    const amount = row.type === "income" ? credit - debit : debit - credit;
    lineMap.set(line, (lineMap.get(line) ?? 0) + amount);
  }

  // Build line items in Schedule C order
  const lineItems: ScheduleCLineItem[] = [];
  for (const [line, desc] of Object.entries(SCHEDULE_C_LINES)) {
    const total = lineMap.get(line) ?? 0;
    lineItems.push({ line, description: desc, total: total.toFixed(2) });
  }

  // Calculate totals
  let grossIncome = 0;
  let totalExpenses = 0;
  for (const [line, amount] of lineMap.entries()) {
    // Lines 1, 2, 6 are income lines
    if (["1", "2", "6"].includes(line)) {
      grossIncome += amount;
    } else {
      totalExpenses += amount;
    }
  }

  const netProfit = grossIncome - totalExpenses;

  return {
    lineItems,
    grossIncome: grossIncome.toFixed(2),
    totalExpenses: totalExpenses.toFixed(2),
    netProfit: netProfit.toFixed(2),
  };
}

// 2025 SS wage base cap
const SS_WAGE_BASE_2025 = 176100;
const SE_TAX_RATE = 0.153; // 12.4% SS + 2.9% Medicare
const SS_RATE = 0.124;
const MEDICARE_RATE = 0.029;

export function selfEmploymentTax(netProfit: number): {
  taxableBase: string;
  ssTax: string;
  medicareTax: string;
  totalSeTax: string;
} {
  // SE tax base is 92.35% of net profit
  const taxableBase = netProfit * 0.9235;

  if (taxableBase <= 0) {
    return { taxableBase: "0.00", ssTax: "0.00", medicareTax: "0.00", totalSeTax: "0.00" };
  }

  // SS tax capped at wage base
  const ssBase = Math.min(taxableBase, SS_WAGE_BASE_2025);
  const ssTax = ssBase * SS_RATE;

  // Medicare tax on full base (no cap)
  const medicareTax = taxableBase * MEDICARE_RATE;

  const totalSeTax = ssTax + medicareTax;

  return {
    taxableBase: taxableBase.toFixed(2),
    ssTax: ssTax.toFixed(2),
    medicareTax: medicareTax.toFixed(2),
    totalSeTax: totalSeTax.toFixed(2),
  };
}

// 2025 Georgia income tax brackets (single/married filing separately)
// 2025 Georgia income tax: flat 5.19% (HB 1015 (2024) collapsed brackets
// to a flat rate; HB 111 (2025) reduced the rate from 5.39% to 5.19%).
// Standard deduction for single filers: $12,000 ($24,000 MFJ).
// Personal exemptions were folded into the higher standard deduction.
const GA_FLAT_RATE_2025 = 0.0519;
const GA_STANDARD_DEDUCTION_SINGLE_2025 = 12000;

export function georgiaIncomeTax(netProfit: number): {
  taxableIncome: string;
  tax: string;
  effectiveRate: string;
} {
  if (netProfit <= 0) {
    return { taxableIncome: "0.00", tax: "0.00", effectiveRate: "0.00" };
  }

  // Start from AGI: net profit minus 50% of SE tax deduction
  const seTax = parseMoney(selfEmploymentTax(netProfit).totalSeTax);
  const agi = netProfit - seTax / 2;

  const taxableIncome = Math.max(0, agi - GA_STANDARD_DEDUCTION_SINGLE_2025);

  const tax = taxableIncome * GA_FLAT_RATE_2025;
  const effectiveRate = netProfit > 0 ? ((tax / netProfit) * 100) : 0;

  return {
    taxableIncome: taxableIncome.toFixed(2),
    tax: tax.toFixed(2),
    effectiveRate: effectiveRate.toFixed(2),
  };
}

// 2025 Federal income tax brackets (single filer)
const FEDERAL_BRACKETS_2025 = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

export function federalIncomeTax(netProfit: number): {
  taxableIncome: string;
  tax: string;
  effectiveRate: string;
  marginalRate: string;
} {
  if (netProfit <= 0) {
    return { taxableIncome: "0.00", tax: "0.00", effectiveRate: "0.00", marginalRate: "0.00" };
  }

  // Deduct 50% of SE tax from AGI
  const seTax = parseMoney(selfEmploymentTax(netProfit).totalSeTax);
  const seDeduction = seTax / 2;

  // Standard deduction for single: $15,000 (2025)
  const standardDeduction = 15000;
  const taxableIncome = Math.max(0, netProfit - seDeduction - standardDeduction);

  let tax = 0;
  let marginalRate = 0.10;
  let remaining = taxableIncome;

  for (const bracket of FEDERAL_BRACKETS_2025) {
    const bracketWidth = bracket.max - bracket.min;
    const taxableInBracket = Math.min(remaining, bracketWidth);
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    if (remaining <= 0) {
      marginalRate = bracket.rate;
      break;
    }
  }

  const effectiveRate = netProfit > 0 ? ((tax / netProfit) * 100) : 0;

  return {
    taxableIncome: taxableIncome.toFixed(2),
    tax: tax.toFixed(2),
    effectiveRate: effectiveRate.toFixed(2),
    marginalRate: (marginalRate * 100).toFixed(1),
  };
}

export function quarterlyDueDates(year: number): { quarter: number; label: string; dueDate: string }[] {
  return [
    { quarter: 1, label: "Q1 (Jan–Mar)", dueDate: `${year}-04-15` },
    { quarter: 2, label: "Q2 (Apr–May)", dueDate: `${year}-06-16` },
    { quarter: 3, label: "Q3 (Jun–Aug)", dueDate: `${year}-09-15` },
    { quarter: 4, label: "Q4 (Sep–Dec)", dueDate: `${year + 1}-01-15` },
  ];
}

export async function quarterlyEstimate(year: number): Promise<{
  annualNetProfit: string;
  federalTax: string;
  seTax: string;
  gaTax: string;
  totalAnnualTax: string;
  quarterlyPayment: string;
  dueDates: { quarter: number; label: string; dueDate: string; amount: string }[];
}> {
  const report = await scheduleCReport(year);
  const netProfit = parseMoney(report.netProfit);

  const federal = federalIncomeTax(netProfit);
  const se = selfEmploymentTax(netProfit);
  const ga = georgiaIncomeTax(netProfit);

  const totalAnnualTax = parseMoney(federal.tax) + parseMoney(se.totalSeTax) + parseMoney(ga.tax);
  const quarterlyPayment = totalAnnualTax / 4;

  const dates = quarterlyDueDates(year);
  const dueDates = dates.map((d) => ({
    ...d,
    amount: quarterlyPayment.toFixed(2),
  }));

  return {
    annualNetProfit: report.netProfit,
    federalTax: federal.tax,
    seTax: se.totalSeTax,
    gaTax: ga.tax,
    totalAnnualTax: totalAnnualTax.toFixed(2),
    quarterlyPayment: quarterlyPayment.toFixed(2),
    dueDates,
  };
}
