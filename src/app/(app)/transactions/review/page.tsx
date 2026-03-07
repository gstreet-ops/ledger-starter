export const dynamic = "force-dynamic";

import {
  getImportRows,
  getImportRowCount,
  getSyncBatches,
  getLedgerAccounts,
} from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import Link from "next/link";
import { ReviewTable } from "./review-table";

type SearchParams = Promise<{
  batch?: string;
  status?: string;
  page?: string;
}>;

const PAGE_SIZE = 50;

export default async function TransactionReviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status =
    (params.status as "pending" | "matched" | "ignored") || undefined;
  const syncBatchId = params.batch || undefined;
  const page = parseInt(params.page ?? "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, totalCount, batches, accounts] = await Promise.all([
    getImportRows({ status, syncBatchId, limit: PAGE_SIZE, offset }),
    getImportRowCount({ status, syncBatchId }),
    getSyncBatches(10),
    getLedgerAccounts(),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = {
      status: params.status,
      batch: params.batch,
      page: params.page,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/transactions/review?${p.toString()}`;
  }

  const aiConfigured = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transaction Review</h1>
        <p className="mt-1 text-muted-foreground">
          Review imported bank transactions before posting to the ledger.
        </p>
      </div>

      {!aiConfigured && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="flex items-center gap-3 py-3">
            <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="text-sm">
              AI categorization is not configured. Add your Anthropic API key in{" "}
              <Link href="/settings" className="underline font-medium">Settings</Link>{" "}
              to get intelligent category suggestions. Manual categorization works normally.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium self-center mr-2">Status:</span>
        {[undefined, "pending", "matched", "ignored"].map((s) => (
          <Link
            key={s ?? "all"}
            href={buildUrl({ status: s, page: undefined })}
            className={`text-sm px-3 py-1 rounded-full border ${
              status === s || (!status && !s)
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {s ?? "All"}
          </Link>
        ))}

        {batches.length > 0 && (
          <>
            <span className="text-sm font-medium self-center ml-4 mr-2">
              Batch:
            </span>
            <Link
              href={buildUrl({ batch: undefined, page: undefined })}
              className={`text-sm px-3 py-1 rounded-full border ${
                !syncBatchId
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              All
            </Link>
            {batches.map((b) => (
              <Link
                key={b.id}
                href={buildUrl({ batch: b.id, page: undefined })}
                className={`text-sm px-3 py-1 rounded-full border ${
                  syncBatchId === b.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {new Date(b.startedAt).toLocaleDateString("en-US", {
                  timeZone: "America/New_York",
                  month: "short",
                  day: "numeric",
                })}{" "}
                ({b.addedCount} added)
              </Link>
            ))}
          </>
        )}
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground">
        Showing {rows.length} of {totalCount} transactions
        {status && (
          <>
            {" "}
            with status <Badge variant="outline">{status}</Badge>
          </>
        )}
      </p>

      {/* Table */}
      {rows.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          No transactions found. Sync your bank connections to import
          transactions.
        </p>
      ) : (
        <ReviewTable rows={rows} accounts={accounts} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="px-3 py-1 rounded border text-sm hover:bg-muted"
            >
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="px-3 py-1 rounded border text-sm hover:bg-muted"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
