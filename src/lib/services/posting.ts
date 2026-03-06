import { db } from "@/lib/db/drizzle";
import { transactions, transactionLines, importRows } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseMoney } from "@/lib/utils/money";

type PostingInput = {
  importRowId: string;
  date: Date;
  description: string;
  amount: string; // numeric string, Plaid convention: positive = money out
  accountId: string; // expense/income account
  bankAccountId: string; // asset/liability account (the bank)
};

export async function createPosting(input: PostingInput) {
  const { importRowId, date, description, amount, accountId, bankAccountId } =
    input;

  const amountNum = parseMoney(amount);
  const absAmount = Math.abs(amountNum).toFixed(2);

  // Plaid: positive amount = money leaving account (expense/debit)
  // Plaid: negative amount = money entering account (income/credit)
  const isExpense = amountNum > 0;

  return await db.transaction(async (tx) => {
    const [txn] = await tx
      .insert(transactions)
      .values({
        date,
        description,
        status: "posted",
      })
      .returning();

    const lines = isExpense
      ? [
          // Debit the expense account, credit the bank account
          {
            transactionId: txn.id,
            accountId: accountId,
            debit: absAmount,
            credit: "0",
          },
          {
            transactionId: txn.id,
            accountId: bankAccountId,
            debit: "0",
            credit: absAmount,
          },
        ]
      : [
          // Debit the bank account, credit the income account
          {
            transactionId: txn.id,
            accountId: bankAccountId,
            debit: absAmount,
            credit: "0",
          },
          {
            transactionId: txn.id,
            accountId: accountId,
            debit: "0",
            credit: absAmount,
          },
        ];

    const createdLines = await tx
      .insert(transactionLines)
      .values(lines)
      .returning();

    // Link import row to transaction and mark as matched
    await tx
      .update(importRows)
      .set({ transactionId: txn.id, status: "matched" })
      .where(eq(importRows.id, importRowId));

    return { transaction: txn, lines: createdLines };
  });
}
