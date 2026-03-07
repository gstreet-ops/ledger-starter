import { db } from "@/lib/db/drizzle";
import { sql } from "drizzle-orm";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

// --- Types ---

export interface InstanceFingerprint {
  collectedAt: string;
  schema: { tableName: string; columns: string[] }[];
  integrations: { name: string; active: boolean }[];
}

export interface BaseManifest {
  version: string;
  generatedAt: string;
  tables: string[];
  routes: string[];
  integrations: Record<string, string>;
}

export interface InstanceDiff {
  newTables: string[];
  removedTables: string[];
  modifiedTables: {
    name: string;
    newColumns: string[];
    removedColumns: string[];
  }[];
  newIntegrations: string[];
  summary: {
    totalNewTables: number;
    totalModifiedTables: number;
    totalNewIntegrations: number;
    hasChanges: boolean;
  };
}

// --- Known integrations to check ---

const KNOWN_INTEGRATIONS = [
  { name: "plaid", envVar: "PLAID_CLIENT_ID" },
  { name: "anthropic", envVar: "ANTHROPIC_API_KEY" },
  { name: "stripe", envVar: "STRIPE_SECRET_KEY" },
  { name: "quickbooks", envVar: "QUICKBOOKS_CLIENT_ID" },
  { name: "xero", envVar: "XERO_CLIENT_ID" },
];

// --- Functions ---

export async function getCurrentFingerprint(): Promise<InstanceFingerprint> {
  // 1. Schema shape
  const rows = await db.execute<{ table_name: string; columns: string[] }>(
    sql`
      SELECT table_name, array_agg(column_name ORDER BY ordinal_position) as columns
      FROM information_schema.columns
      WHERE table_schema = 'public'
      GROUP BY table_name
      ORDER BY table_name
    `
  );

  const schema = rows.map((r) => ({
    tableName: r.table_name,
    columns: r.columns,
  }));

  // 2. Integration inventory
  const integrations = KNOWN_INTEGRATIONS.map((i) => ({
    name: i.name,
    active: !!process.env[i.envVar],
  }));

  return {
    collectedAt: new Date().toISOString(),
    schema,
    integrations,
  };
}

export async function getBaseManifest(): Promise<BaseManifest> {
  const manifestPath = path.join(process.cwd(), "public", "base-manifest.json");
  const content = fs.readFileSync(manifestPath, "utf-8");
  return JSON.parse(content) as BaseManifest;
}

export function computeDiff(
  current: InstanceFingerprint,
  base: BaseManifest
): InstanceDiff {
  const currentTableNames = new Set(current.schema.map((t) => t.tableName));
  const baseTableNames = new Set(base.tables);

  // New tables (in current but not in base)
  const newTables = [...currentTableNames].filter((t) => !baseTableNames.has(t));

  // Removed tables (in base but not in current)
  const removedTables = [...baseTableNames].filter((t) => !currentTableNames.has(t));

  // Modified tables — we can only detect column changes for tables that exist
  // in both. The base manifest doesn't include columns, so we compare against
  // the base schema snapshot. For now, we report tables that have extra columns
  // beyond what the base snapshot had at generation time.
  // Since the base manifest only has table names (not columns), we can't detect
  // column-level changes against the base. We'll compare against a known baseline.
  // For Phase 1, modified tables will be empty unless we extend the base manifest.
  const modifiedTables: InstanceDiff["modifiedTables"] = [];

  // New integrations (active in current but not in base manifest)
  const baseIntegrationNames = new Set(Object.keys(base.integrations));
  const newIntegrations = current.integrations
    .filter((i) => i.active && !baseIntegrationNames.has(i.name))
    .map((i) => i.name);

  const totalNewTables = newTables.length;
  const totalModifiedTables = modifiedTables.length;
  const totalNewIntegrations = newIntegrations.length;

  return {
    newTables,
    removedTables,
    modifiedTables,
    newIntegrations,
    summary: {
      totalNewTables,
      totalModifiedTables,
      totalNewIntegrations,
      hasChanges:
        totalNewTables > 0 ||
        totalModifiedTables > 0 ||
        totalNewIntegrations > 0 ||
        removedTables.length > 0,
    },
  };
}

export function hashFingerprint(fingerprint: InstanceFingerprint): string {
  const data = JSON.stringify({
    schema: fingerprint.schema,
    integrations: fingerprint.integrations,
  });
  return createHash("sha256").update(data).digest("hex");
}
