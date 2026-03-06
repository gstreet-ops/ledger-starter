import * as XLSX from "xlsx";
import type { ParseResult, ParsedRow } from "./types";

/**
 * Parse AmEx Delta Platinum Business XLSX/CSV exports.
 * XLSX format: 6 metadata header rows, data starts row 7.
 * Columns: Date | Receipt | Description | Amount | Extended Details |
 *   Appears On Your Statement As | Address | City/State | Zip Code |
 *   Country | Reference | Category
 *
 * Amount: POSITIVE = charges/fees, NEGATIVE = payments/credits.
 * External ID: 'Reference' column.
 */
export function parseAmex(buffer: Buffer, fileName: string): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // Read all rows including headers — skip first 6 metadata rows
  const allRows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });

  // If headers are in row 7, sheet_to_json with default settings uses row 1 as headers.
  // For XLSX with 6 header rows, we need to skip them:
  const rawRows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  // Find the header row (contains "Date" and "Amount")
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i];
    if (row.some((c) => c === "Date") && row.some((c) => c === "Amount")) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    throw new Error("Could not find AmEx header row with Date and Amount columns");
  }

  const headers = rawRows[headerIdx].map((h) => String(h).trim());
  const dataRows = rawRows.slice(headerIdx + 1).filter((r) => r.some((c) => c !== ""));

  const colIdx = (name: string) => {
    const idx = headers.indexOf(name);
    return idx;
  };

  const dateCol = colIdx("Date");
  const descCol = colIdx("Description");
  const amountCol = colIdx("Amount");
  const refCol = colIdx("Reference");
  const categoryCol = colIdx("Category");
  const extDetailsCol = colIdx("Extended Details");
  const appearsAsCol = colIdx("Appears On Your Statement As");

  if (dateCol === -1 || amountCol === -1) {
    throw new Error("AmEx file missing required Date or Amount columns");
  }

  let earliest: Date | null = null;
  let latest: Date | null = null;

  const rows: ParsedRow[] = [];

  for (const row of dataRows) {
    const dateStr = String(row[dateCol] ?? "").trim();
    if (!dateStr) continue;

    const date = parseAmexDate(dateStr);
    if (!date || isNaN(date.getTime())) continue;

    if (!earliest || date < earliest) earliest = date;
    if (!latest || date > latest) latest = date;

    const amount = String(row[amountCol] ?? "0").replace(/[$,]/g, "").trim();
    const ref = String(row[refCol] ?? "").trim();
    const description = String(row[descCol] ?? "").trim();
    const category = String(row[categoryCol] ?? "").trim() || null;

    // Build external ID from reference, or fallback to hash
    const externalId = ref || `amex-${dateStr}-${amount}-${hashStr(description)}`;

    const rawData: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      if (row[i] !== undefined && row[i] !== "") rawData[h] = row[i];
    });

    rows.push({
      rawData,
      parsedDate: date,
      parsedDescription: description,
      parsedAmount: amount,
      parsedCategory: category,
      externalId,
      section: null,
    });
  }

  return {
    batch: {
      source: "amex",
      fileName,
      fileType: fileName.endsWith(".csv") ? "csv" : "xlsx",
      accountLast4: "5000",
      statementPeriodStart: earliest,
      statementPeriodEnd: latest,
    },
    rows,
  };
}

function parseAmexDate(s: string): Date | null {
  // MM/DD/YYYY
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(`${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}T00:00:00Z`);
}

function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}
