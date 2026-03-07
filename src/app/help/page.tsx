"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, Search } from "lucide-react";
import { faqEntries, categories } from "@/lib/help/faq-data";

function renderAnswer(answer: string) {
  // Simple markdown-like rendering: **bold**, `code`, bullet lists, newlines
  const lines = answer.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
    } else {
      flushList();
      if (trimmed === "") {
        elements.push(<div key={`br-${elements.length}`} className="h-2" />);
      } else {
        elements.push(
          <p key={`p-${elements.length}`}>{formatInline(trimmed)}</p>
        );
      }
    }
  }
  flushList();

  return <div className="space-y-1.5 text-sm text-muted-foreground">{elements}</div>;
}

function formatInline(text: string): React.ReactNode {
  // Split on **bold** and `code` patterns
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function fuzzyMatch(query: string, entry: { question: string; answer: string; keywords: string[] }): boolean {
  const q = query.toLowerCase();
  const haystack = [entry.question, entry.answer, ...entry.keywords]
    .join(" ")
    .toLowerCase();
  // All query words must appear somewhere
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export default function HelpPage() {
  return (
    <Suspense>
      <HelpContent />
    </Suspense>
  );
}

function HelpContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return faqEntries;
    return faqEntries.filter((e) => fuzzyMatch(search, e));
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof faqEntries>();
    for (const cat of categories) {
      const items = filtered.filter((e) => e.category === cat);
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  }, [filtered]);

  // When searching, auto-expand all results
  useEffect(() => {
    if (search.trim()) {
      setOpenIds(new Set(filtered.map((e) => e.id)));
    } else {
      setOpenIds(new Set());
    }
  }, [search, filtered]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Help & FAQ</h1>

      <div className="sticky top-0 z-10 bg-background pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search help...  (Ctrl+K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {grouped.size === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No results for &ldquo;{search}&rdquo;
        </p>
      )}

      {Array.from(grouped.entries()).map(([category, entries]) => (
        <div key={category}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {category}
          </h2>
          <Card className="divide-y">
            {entries.map((entry) => (
              <Collapsible
                key={entry.id}
                open={openIds.has(entry.id)}
                onOpenChange={() => toggle(entry.id)}
              >
                <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors">
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      openIds.has(entry.id) ? "rotate-90" : ""
                    }`}
                  />
                  {entry.question}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 pl-10">
                  {renderAnswer(entry.answer)}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </Card>
        </div>
      ))}

      <div className="border-t pt-6 text-center text-sm text-muted-foreground">
        Still stuck?{" "}
        <a
          href="https://github.com/gstreet-ops/ledger-starter/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          File an issue on GitHub
        </a>
      </div>
    </div>
  );
}
