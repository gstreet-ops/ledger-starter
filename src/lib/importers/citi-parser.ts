import { parseMoney } from "@/lib/utils/money";
import { extractPdfText } from "./pdf-reader";
import type { ParseResult, ParsedRow } from "./types";

/**
 * Parse Citi ThankYou Preferred monthly PDF statements.
 * - Billing period header: "Billing Period: MM/DD/YY-MM/DD/YY"
 * - Transaction dates: MM/DD (no year — inferred from billing period)
 * - Sections: Payments/Credits, Standard Purchases, Fees, Interest
 * - Amount: Negative = payments/credits, Positive = purchases
 * - Multi-line flight descriptions, foreign currency lines
 * - Account ending: 4219 (personal card)
 */
export async function parseCiti(buffer: Buffer, fileName: string): Promise<ParseResult> {
  // Use maxX=25 to filter out the right sidebar (rewards points, ThankYou info)
  // Transaction table occupies x < 25, sidebar starts at x ~25.9
  const text = await extractPdfText(buffer, { maxX: 25 });

  // Extract billing period for year inference
  const billingMatch = text.match(/Billing Period:\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*[-–]\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i);
  let billingYear = new Date().getFullYear();
  let periodStart: Date | null = null;
  let periodEnd: Date | null = null;

  if (billingMatch) {
    const startYear = normalizeYear(billingMatch[3]);
    const endYear = normalizeYear(billingMatch[6]);
    billingYear = endYear;
    periodStart = new Date(`${startYear}-${billingMatch[1].padStart(2, "0")}-${billingMatch[2].padStart(2, "0")}T00:00:00Z`);
    periodEnd = new Date(`${endYear}-${billingMatch[4].padStart(2, "0")}-${billingMatch[5].padStart(2, "0")}T00:00:00Z`);
  }

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const rows: ParsedRow[] = [];
  let currentSection: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section headers
    if (/payments,?\s*credits/i.test(line)) {
      currentSection = "payments";
      continue;
    }
    if (/standard\s*purchases/i.test(line)) {
      currentSection = "purchases";
      continue;
    }
    if (/fees\s*charged/i.test(line)) {
      currentSection = "fees";
      continue;
    }
    if (/interest\s*charged/i.test(line)) {
      currentSection = "interest";
      continue;
    }
    // Reset section on summary/total lines
    if (/total\s*(payments|purchases|fees|interest|new\s*balance)/i.test(line)) {
      continue;
    }

    if (!currentSection) continue;

    // Parse: MM/DD [MM/DD] Description [-][$]Amount
    const txnMatch = line.match(
      /^(\d{1,2})\/(\d{1,2})\s+(?:(\d{1,2})\/(\d{1,2})\s+)?(.+?)\s+(-?\s?\$?[\d,]+\.\d{2})$/
    );

    if (!txnMatch) continue;

    const month = txnMatch[1].padStart(2, "0");
    const day = txnMatch[2].padStart(2, "0");
    const description = txnMatch[5].trim();
    let amountStr = txnMatch[6].replace(/[$,\s]/g, "");

    // Infer year: if transaction month > billing end month, it's previous year
    const txnMonth = parseInt(month);
    const endMonth = periodEnd ? periodEnd.getUTCMonth() + 1 : 12;
    let txnYear = billingYear;
    if (txnMonth > endMonth + 1) {
      txnYear = billingYear - 1;
    }

    const date = new Date(`${txnYear}-${month}-${day}T00:00:00Z`);
    if (isNaN(date.getTime())) continue;

    // Look ahead for multi-line descriptions (flight details, foreign currency)
    let fullDescription = description;
    while (i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      // Stop if next line is another transaction or section header
      if (/^\d{1,2}\/\d{1,2}/.test(nextLine)) break;
      if (/^(payments|standard|fees|interest|total)/i.test(nextLine)) break;
      // Check for foreign currency conversion line
      if (/subject to foreign/i.test(nextLine)) {
        i++;
        continue; // Skip the "Subject to Foreign Fee" line
      }
      if (/^\d[\d,.]+\s+[A-Z]+\s*(PESO|DOLLAR|EURO|POUND)/i.test(nextLine)) {
        i++;
        continue; // Skip foreign currency amount line
      }
      // If it looks like a continuation line (doesn't start with a number/date), append
      if (!/^\d{1,2}\//.test(nextLine) && nextLine.length > 2) {
        fullDescription += " " + nextLine;
        i++;
      } else {
        break;
      }
    }

    // In payments section, amounts are negative (credits)
    if (currentSection === "payments") {
      const num = parseMoney(amountStr);
      if (num > 0) amountStr = (-num).toFixed(2);
    }

    const externalId = `citi-${txnYear}${month}${day}-${amountStr}-${hashStr(fullDescription)}`;

    rows.push({
      rawData: { date: `${month}/${day}`, description: fullDescription, amount: amountStr, section: currentSection },
      parsedDate: date,
      parsedDescription: fullDescription,
      parsedAmount: amountStr,
      parsedCategory: null,
      externalId,
      section: currentSection,
    });
  }

  return {
    batch: {
      source: "citi",
      fileName,
      fileType: "pdf",
      accountLast4: "4219",
      statementPeriodStart: periodStart,
      statementPeriodEnd: periodEnd,
    },
    rows,
  };
}

function normalizeYear(y: string): number {
  const num = parseInt(y);
  return num < 100 ? 2000 + num : num;
}

function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}
