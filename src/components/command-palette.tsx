"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { faqEntries } from "@/lib/help/faq-data";

function fuzzyMatch(query: string, entry: { question: string; keywords: string[] }): boolean {
  const q = query.toLowerCase();
  const haystack = [entry.question, ...entry.keywords].join(" ").toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return faqEntries.slice(0, 5);
    return faqEntries.filter((e) => fuzzyMatch(query, e)).slice(0, 8);
  }, [query]);

  function goToHelp() {
    setOpen(false);
    router.push(query ? `/help?q=${encodeURIComponent(query)}` : "/help");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 max-w-lg [&>button]:hidden">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search help..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goToHelp();
            }}
            className="border-0 focus-visible:ring-0 shadow-none"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results
            </p>
          ) : (
            <ul className="py-1">
              {results.map((entry) => (
                <li key={entry.id}>
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setOpen(false);
                      router.push(`/help?q=${encodeURIComponent(entry.question)}`);
                    }}
                  >
                    <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">
                      {entry.category}
                    </span>
                    <span className="flex-1 truncate">{entry.question}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>{" "}
            to open help page
          </span>
          <button
            onClick={goToHelp}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
