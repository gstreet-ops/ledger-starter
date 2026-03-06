import { parseMoney } from "@/lib/utils/money";
import { extractPdfText } from "./pdf-reader";
import type { ParseResult, ParsedRow } from "./types";

/**
 * Parse Truist Simple Business Checking monthly PDF statements.
 * pdf2json garbles section headers with spaced-out chars and unicode symbols,
 * so we normalize text before matching sections.
 */
export async function parseTruist(buffer: Buffer, fileName: string): Promise<ParseResult> {
  const text = await extractPdfText(buffer);

  // Extract statement year from balance line: "as of MM/DD/YYYY"
  const yearMatch = text.match(
    /as\s*of\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/i
  );
  const statementYear = yearMatch ? parseInt(yearMatch[3]) : new Date().getFullYear();

  // Extract period dates from "as of" lines (previous balance = start, new balance = end)
  let periodStart: Date | null = null;
  let periodEnd: Date | null = null;
  const periodMatches = [...text.matchAll(/as\s*of\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/gi)];
  if (periodMatches.length >= 2) {
    const s = periodMatches[0];
    const e = periodMatches[1];
    periodStart = new Date(`${s[3]}-${s[1].padStart(2, "0")}-${s[2].padStart(2, "0")}T00:00:00Z`);
    periodEnd = new Date(`${e[3]}-${e[1].padStart(2, "0")}-${e[2].padStart(2, "0")}T00:00:00Z`);
  }

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const rows: ParsedRow[] = [];
  let currentSection: "withdrawals" | "deposits" | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Normalize: strip unicode symbols and collapse spaced-out text for section matching
    const normalized = line
      .replace(/[■□●○←→↑↓▼▲►◄§¶•†‡]/g, "")
      .replace(/(\w)\s+(?=\w)/g, (_, c) => {
        // Only collapse single chars separated by spaces (spaced-out text)
        return c;
      })
      .trim();

    // Detect sections — match both clean text and garbled pdf2json output
    if (/other\s*withdrawals|ithdra.*debits.*service|withdrawals.*debits/i.test(normalized) &&
        !/total/i.test(normalized)) {
      currentSection = "withdrawals";
      continue;
    }
    if (/deposits.*credits.*interest|eposits.*credits/i.test(normalized) &&
        !/total/i.test(normalized)) {
      currentSection = "deposits";
      continue;
    }
    // Skip column header lines
    if (/DATE\s+DESCRIPTION\s+AMOUNT/i.test(normalized)) {
      continue;
    }
    // End of sections
    if (/daily\s*balance|PAGE\s+\d/i.test(line)) {
      currentSection = null;
      continue;
    }
    // Skip total lines
    if (/^T.*=\s*\$[\d,]+\.\d{2}/.test(line) || /total/i.test(normalized)) {
      continue;
    }

    if (!currentSection) continue;

    // Parse: MM/DD DESCRIPTION AMOUNT
    const txnMatch = line.match(
      /^(\d{1,2})\/(\d{1,2})\s+(.+?)\s+([\d,]+\.\d{2})$/
    );

    if (!txnMatch) continue;

    const month = txnMatch[1].padStart(2, "0");
    const day = txnMatch[2].padStart(2, "0");
    let description = txnMatch[3].trim();
    const rawAmount = txnMatch[4].replace(/,/g, "");

    // Look ahead for continuation lines (multi-line descriptions)
    while (i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      if (/^\d{1,2}\/\d{1,2}/.test(nextLine)) break;
      if (/total|PAGE|daily|DATE\s+DESC/i.test(nextLine)) break;
      if (/^\d[\d,]*\.\d{2}$/.test(nextLine)) break;
      if (/[■□●○←→↑↓▼▲]/.test(nextLine)) break; // garbled header
      if (nextLine.length > 2) {
        description += " " + nextLine;
        i++;
      } else {
        break;
      }
    }

    const date = new Date(`${statementYear}-${month}-${day}T00:00:00Z`);
    if (isNaN(date.getTime())) continue;

    // Withdrawals are outflows (negative in our ledger)
    // Deposits are inflows (positive in our ledger)
    const amount = currentSection === "withdrawals"
      ? (-parseMoney(rawAmount)).toFixed(2)
      : rawAmount;

    // Extract external IDs from description
    const paymentIdMatch = description.match(/PAYMENT\s*ID\s*(\S+)/i);
    const customerIdMatch = description.match(/CUSTOMER\s*ID\s*(\S+)/i);
    const externalId = paymentIdMatch
      ? `truist-${paymentIdMatch[1]}`
      : customerIdMatch
      ? `truist-${customerIdMatch[1]}-${month}${day}`
      : `truist-${statementYear}${month}${day}-${rawAmount}-${hashStr(description)}`;

    rows.push({
      rawData: {
        date: `${month}/${day}`,
        description,
        amount: rawAmount,
        section: currentSection,
      },
      parsedDate: date,
      parsedDescription: description,
      parsedAmount: amount,
      parsedCategory: null,
      externalId,
      section: currentSection,
    });
  }

  return {
    batch: {
      source: "truist",
      fileName,
      fileType: "pdf",
      accountLast4: "8783",
      statementPeriodStart: periodStart,
      statementPeriodEnd: periodEnd,
    },
    rows,
  };
}

function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}
