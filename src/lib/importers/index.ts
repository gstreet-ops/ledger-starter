import { parseAmex } from "./amex-parser";
import { parseCiti } from "./citi-parser";
import { parseTruist } from "./truist-parser";
import type { ParseResult } from "./types";

/**
 * Detect institution from filename and route to the appropriate parser.
 */
export async function parseFile(buffer: Buffer, fileName: string): Promise<ParseResult> {
  const lower = fileName.toLowerCase();

  if (lower.includes("amex") || lower.includes("delta")) {
    return parseAmex(buffer, fileName);
  }

  if (lower.includes("citi")) {
    return await parseCiti(buffer, fileName);
  }

  if (lower.includes("truist")) {
    return await parseTruist(buffer, fileName);
  }

  throw new Error(
    `Could not detect institution from filename "${fileName}". ` +
    `Expected filename containing "amex", "citi", or "truist".`
  );
}

export type { ParseResult, ParsedRow, BatchMeta } from "./types";
