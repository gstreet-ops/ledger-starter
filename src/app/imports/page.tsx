"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileText, Loader2, Trash2 } from "lucide-react";
import { parseMoney } from "@/lib/utils/money";

type Batch = {
  id: string;
  source: string;
  fileName: string;
  fileType: string;
  accountLast4: string | null;
  rowCount: number;
  status: string;
  importedAt: string;
  statementPeriodStart: string | null;
  statementPeriodEnd: string | null;
};

type ImportRow = {
  id: string;
  parsedDate: string;
  parsedDescription: string;
  parsedAmount: string;
  section: string | null;
  externalId: string;
  matchStatus: string;
  parsedCategory: string | null;
};

function formatCurrency(amount: string) {
  const num = parseMoney(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    signDisplay: "auto",
  }).format(num);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

const sourceColors: Record<string, string> = {
  amex: "bg-blue-100 text-blue-800",
  citi: "bg-purple-100 text-purple-800",
  truist: "bg-green-100 text-green-800",
};

export default function ImportsPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadBatches = useCallback(async () => {
    const res = await fetch("/api/import/batches");
    if (res.ok) {
      setBatches(await res.json());
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
      } else {
        await loadBatches();
        setSelectedBatchId(data.batchId);
        await loadRows(data.batchId);
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(batchId: string) {
    if (!confirm("Delete this import batch and all its rows?")) return;
    setDeleting(batchId);
    try {
      const res = await fetch(`/api/import/batches/${batchId}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedBatchId === batchId) {
          setSelectedBatchId(null);
          setRows([]);
        }
        await loadBatches();
      }
    } finally {
      setDeleting(null);
    }
  }

  async function loadRows(batchId: string) {
    setLoadingRows(true);
    setSelectedBatchId(batchId);
    const res = await fetch(`/api/import/batches/${batchId}/rows`);
    if (res.ok) {
      setRows(await res.json());
    }
    setLoadingRows(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Statement Imports</h1>
        <div>
          <input
            type="file"
            accept=".xlsx,.pdf,.csv"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button asChild disabled={uploading}>
              <span>
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload Statement
              </span>
            </Button>
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Upload AmEx (.xlsx/.csv), Citi (.pdf), or Truist (.pdf) bank statements.
        Institution is detected from the filename.
      </p>

      {/* Batch List */}
      {batches.length > 0 && (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Rows</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Imported</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((b) => (
                <TableRow
                  key={b.id}
                  className={`cursor-pointer ${selectedBatchId === b.id ? "bg-muted" : ""}`}
                  onClick={() => loadRows(b.id)}
                >
                  <TableCell>
                    <Badge variant="secondary" className={sourceColors[b.source] ?? ""}>
                      {b.source.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{b.fileName}</span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    •••{b.accountLast4 ?? "????"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {b.statementPeriodStart && b.statementPeriodEnd
                      ? `${formatDate(b.statementPeriodStart)} – ${formatDate(b.statementPeriodEnd)}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono">{b.rowCount}</TableCell>
                  <TableCell>
                    <Badge variant={b.status === "complete" ? "default" : "destructive"}>
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(b.importedAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      disabled={deleting === b.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(b.id);
                      }}
                    >
                      {deleting === b.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Row Detail */}
      {selectedBatchId && (
        <Card className="p-0">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">
              Import Rows
              {rows.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({rows.length} rows)
                </span>
              )}
            </h2>
          </div>
          {loadingRows ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Section</TableHead>
                  <TableHead className="w-28 text-right">Amount</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">
                      {formatDate(r.parsedDate)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{r.parsedDescription}</div>
                      {r.parsedCategory && (
                        <div className="text-xs text-muted-foreground">
                          {r.parsedCategory}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.section && (
                        <Badge variant="outline" className="text-xs">
                          {r.section}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono text-sm ${
                        parseMoney(r.parsedAmount) < 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(r.parsedAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.matchStatus === "unmatched" ? "secondary" : "default"
                        }
                        className="text-xs"
                      >
                        {r.matchStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No rows in this batch
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}
