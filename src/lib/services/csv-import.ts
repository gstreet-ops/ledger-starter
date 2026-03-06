import { db } from "../db/drizzle";
import { syncBatches, importRows, plaidAccounts } from "../db/schema";
import { eq } from "drizzle-orm";
import { parseMoney } from "@/lib/utils/money";

type CsvRow = {
  date: string; // YYYY-MM-DD or MM/DD/YYYY
  amount: string; // numeric string, negative = expense
  description: string;
};

function parseDate(dateStr: string): Date {
  // Handle MM/DD/YYYY
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    return new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00Z`);
  }
  // Assume YYYY-MM-DD
  return new Date(`${dateStr}T00:00:00Z`);
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const cols = parseCsvLine(lines[0]).map((c) => c.toLowerCase());

  const dateIdx = cols.findIndex((c) => c === "date");
  const amountIdx = cols.findIndex((c) => c === "amount");
  const descIdx = cols.findIndex(
    (c) => c === "description" || c === "name" || c === "memo"
  );

  if (dateIdx === -1 || amountIdx === -1 || descIdx === -1) {
    throw new Error(
      "CSV must have columns: date, amount, description (or name/memo)"
    );
  }

  return lines.slice(1).map((line) => {
    const parts = parseCsvLine(line);
    return {
      date: parts[dateIdx],
      amount: parts[amountIdx],
      description: parts[descIdx],
    };
  });
}

export async function importCsv(
  csvText: string,
  plaidItemId: string
): Promise<{ imported: number }> {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return { imported: 0 };

  // Create a sync batch for this CSV import
  const [batch] = await db
    .insert(syncBatches)
    .values({ plaidItemId })
    .returning();

  // We need a plaid account to associate rows with.
  // For CSV imports, use the first account under the item.
  const [account] = await db
    .select()
    .from(plaidAccounts)
    .where(eq(plaidAccounts.plaidItemId, plaidItemId))
    .limit(1);

  if (!account) {
    throw new Error("No Plaid account found for this item. Create one first.");
  }

  let imported = 0;
  for (const row of rows) {
    const date = parseDate(row.date);
    const amount = parseMoney(row.amount);
    if (isNaN(amount) || isNaN(date.getTime())) continue;

    // Generate a unique pseudo-ID for CSV rows
    const csvId = `csv-${batch.id}-${imported}`;

    await db.insert(importRows).values({
      syncBatchId: batch.id,
      plaidTransactionId: csvId,
      plaidAccountId: account.id,
      rawData: row,
      amount: String(amount),
      date,
      name: row.description,
      merchantName: null,
      category: null,
    });
    imported++;
  }

  await db
    .update(syncBatches)
    .set({
      completedAt: new Date(),
      addedCount: imported,
    })
    .where(eq(syncBatches.id, batch.id));

  return { imported };
}
