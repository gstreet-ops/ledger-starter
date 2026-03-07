import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { accounts, transactions, transactionLines, userSettings } from "@/lib/db/schema";
import { parseMoney } from "@/lib/utils/money";

// ---------------------------------------------------------------------------
// State income tax rates
// Add your state here if it isn't listed. All rates are approximate 2025 values.
// Format: { rate: flat_rate, standardDeduction: single_filer_deduction }
// For states with brackets, we use the top marginal rate as a conservative estimate.
// ---------------------------------------------------------------------------
export const STATE_TAX_RATES: Record<
  string,
  { rate: number; standardDeduction: number; label: string; noIncomeTax?: boolean }
> = {
  AL: { rate: 0.05,   standardDeduction: 2500,  label: "Alabama" },
  AK: { rate: 0,      standardDeduction: 0,     label: "Alaska",     noIncomeTax: true },
  AZ: { rate: 0.025,  standardDeduction: 13850, label: "Arizona" },
  AR: { rate: 0.039,  standardDeduction: 2200,  label: "Arkansas" },
  CA: { rate: 0.093,  standardDeduction: 5202,  label: "California" },
  CO: { rate: 0.044,  standardDeduction: 14600, label: "Colorado" },
  CT: { rate: 0.069,  standardDeduction: 0,     label: "Connecticut" },
  DE: { rate: 0.066,  standardDeduction: 3250,  label: "Delaware" },
  FL: { rate: 0,      standardDeduction: 0,     label: "Florida",    noIncomeTax: true },
  GA: { rate: 0.0519, standardDeduction: 12000, label: "Georgia" },
  HI: { rate: 0.11,   standardDeduction: 2200,  label: "Hawaii" },
  ID: { rate: 0.058,  standardDeduction: 14600, label: "Idaho" },
  IL: { rate: 0.0495, standardDeduction: 0,     label: "Illinois" },
  IN: { rate: 0.0305, standardDeduction: 0,     label: "Indiana" },
  IA: { rate: 0.057,  standardDeduction: 2210,  label: "Iowa" },
  KS: { rate: 0.057,  standardDeduction: 3500,  label: "Kansas" },
  KY: { rate: 0.045,  standardDeduction: 3160,  label: "Kentucky" },
  LA: { rate: 0.03,   standardDeduction: 4500,  label: "Louisiana" },
  ME: { rate: 0.0715, standardDeduction: 14600, label: "Maine" },
  MD: { rate: 0.0575, standardDeduction: 2400,  label: "Maryland" },
  MA: { rate: 0.05,   standardDeduction: 0,     label: "Massachusetts" },
  MI: { rate: 0.0425, standardDeduction: 5400,  label: "Michigan" },
  MN: { rate: 0.0985, standardDeduction: 14575, label: "Minnesota" },
  MS: { rate: 0.05,   standardDeduction: 2300,  label: "Mississippi" },
  MO: { rate: 0.048,  standardDeduction: 21900, label: "Missouri" },
  MT: { rate: 0.059,  standardDeduction: 5540,  label: "Montana" },
  NE: { rate: 0.0584, standardDeduction: 7900,  label: "Nebraska" },
  NV: { rate: 0,      standardDeduction: 0,     label: "Nevada",     noIncomeTax: true },
  NH: { rate: 0,      standardDeduction: 0,     label: "New Hampshire", noIncomeTax: true },
  NJ: { rate: 0.1075, standardDeduction: 0,     label: "New Jersey" },
  NM: { rate: 0.059,  standardDeduction: 12950, label: "New Mexico" },
  NY: { rate: 0.0685, standardDeduction: 8000,  label: "New York" },
  NC: { rate: 0.045,  standardDeduction: 12750, label: "North Carolina" },
  ND: { rate: 0.025,  standardDeduction: 14600, label: "North Dakota" },
  OH: { rate: 0.035,  standardDeduction: 2400,  label: "Ohio" },
  OK: { rate: 0.0475, standardDeduction: 6350,  label: "Oklahoma" },
  OR: { rate: 0.099,  standardDeduction: 2420,  label: "Oregon" },
  PA: { rate: 0.0307, standardDeduction: 0,     label: "Pennsylvania" },
  RI: { rate: 0.0599, standardDeduction: 10550, label: "Rhode Island" },
  SC: { rate: 0.064,  standardDeduction: 14600, label: "South Carolina" },
  SD: { rate: 0,      standardDeduction: 0,     label: "South Dakota", noIncomeTax: true },
  TN: { rate: 0,      standardDeduction: 0,     label: "Tennessee",  noIncomeTax: true },
  TX: { rate: 0,      standardDeduction: 0,     label: "Texas",      noIncomeTax: true },
  UT: { rate: 0.0465, standardDeduction: 887,   label: "Utah" },
  VT: { rate: 0.0875, standardDeduction: 7000,  label: "Vermont" },
  VA: { rate: 0.0575, standardDeduction: 8000,  label: "Virginia" },
  WA: { rate: 0,      standardDeduction: 0,     label: "Washington",  noIncomeTax: true },
  WV: { rate: 0.065,  standardDeduction: 2000,  label: "West Virginia" },
  WI: { rate: 0.0765, standardDeduction: 12380, label: "Wisconsin" },
  WY: { rate: 0,      standardDeduction: 0,     label: "Wyoming",    noIncomeTax: true },
  DC: { rate: 0.1075, standardDeduction: 13050, label: "Washington D.C." },
};

/** Fetch current user settings (returns null if setup not complete) */
export async function getUserSettings() {
  const [settings] = await db.select().from(userSettings).limit(1);
  return settings ?? null;
}

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

/**
 * Generic state income tax calculator.
 * Uses STATE_TAX_RATES to look up the user's state rate and standard deduction.
 *
 * @param netProfit - Schedule C net profit
 * @param state     - 2-letter state code from user_settings (e.g. "TX", "CA")
 */
export function stateTax(
  netProfit: number,
  state: string
): {
  taxableIncome: string;
  tax: string;
  effectiveRate: string;
  stateLabel: string;
  noIncomeTax: boolean;
} {
  const stateInfo = STATE_TAX_RATES[state.toUpperCase()];
  if (!stateInfo) {
    return {
      taxableIncome: "0.00",
      tax: "0.00",
      effectiveRate: "0.00",
      stateLabel: "Not configured",
      noIncomeTax: false,
    };
  }

  if (netProfit <= 0 || stateInfo.noIncomeTax) {
    return {
      taxableIncome: "0.00",
      tax: "0.00",
      effectiveRate: "0.00",
      stateLabel: stateInfo.label,
      noIncomeTax: stateInfo.noIncomeTax ?? false,
    };
  }

  // AGI: net profit minus 50% of SE tax deduction
  const seTax = parseMoney(selfEmploymentTax(netProfit).totalSeTax);
  const agi = netProfit - seTax / 2;
  const taxableIncome = Math.max(0, agi - stateInfo.standardDeduction);
  const tax = taxableIncome * stateInfo.rate;
  const effectiveRate = netProfit > 0 ? (tax / netProfit) * 100 : 0;

  return {
    taxableIncome: taxableIncome.toFixed(2),
    tax: tax.toFixed(2),
    effectiveRate: effectiveRate.toFixed(2),
    stateLabel: stateInfo.label,
    noIncomeTax: false,
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
  stateTaxAmount: string;
  stateLabel: string;
  totalAnnualTax: string;
  quarterlyPayment: string;
  dueDates: { quarter: number; label: string; dueDate: string; amount: string }[];
}> {
  const report = await scheduleCReport(year);
  const netProfit = parseMoney(report.netProfit);

  const settings = await getUserSettings();
  const state = settings?.state ?? "XX";

  const federal = federalIncomeTax(netProfit);
  const se = selfEmploymentTax(netProfit);
  const stateResult = stateTax(netProfit, state);

  const totalAnnualTax =
    parseMoney(federal.tax) + parseMoney(se.totalSeTax) + parseMoney(stateResult.tax);
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
    stateTaxAmount: stateResult.tax,
    stateLabel: stateResult.stateLabel,
    totalAnnualTax: totalAnnualTax.toFixed(2),
    quarterlyPayment: quarterlyPayment.toFixed(2),
    dueDates,
  };
}
