import {
  getTransactionsWithLines,
  getTransactionCount,
  getLedgerAccounts,
} from "@/lib/db/queries";
import { JournalTable } from "./journal-table";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = 50;

  const opts = {
    status: params.status as "pending" | "posted" | "voided" | undefined,
    accountId: params.accountId || undefined,
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: params.endDate ? new Date(params.endDate + "T23:59:59") : undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    sortDir: "desc" as const,
  };

  const [transactions, totalCount, accounts] = await Promise.all([
    getTransactionsWithLines(opts),
    getTransactionCount(opts),
    getLedgerAccounts(),
  ]);

  return (
    <JournalTable
      transactions={transactions as any}
      accounts={accounts}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
    />
  );
}
