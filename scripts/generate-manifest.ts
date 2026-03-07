/**
 * generate-manifest.ts
 *
 * Maintainer script to regenerate public/base-manifest.json.
 * Run with: npx tsx scripts/generate-manifest.ts
 *
 * Queries the database for table names, walks src/app/ for routes,
 * and checks for known integration env vars.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import postgres from "postgres";

const KNOWN_INTEGRATIONS: Record<string, string> = {
  plaid: "PLAID_CLIENT_ID",
  anthropic: "ANTHROPIC_API_KEY",
  stripe: "STRIPE_SECRET_KEY",
  quickbooks: "QUICKBOOKS_CLIENT_ID",
  xero: "XERO_CLIENT_ID",
};

function getRoutes(appDir: string, prefix = ""): string[] {
  const routes: string[] = [];
  if (!fs.existsSync(appDir)) return routes;

  const entries = fs.readdirSync(appDir, { withFileTypes: true });

  // Check if this directory has a page file (route segment)
  const hasPage = entries.some(
    (e) => e.isFile() && /^page\.(tsx?|jsx?)$/.test(e.name)
  );
  const hasRoute = entries.some(
    (e) => e.isFile() && /^route\.(tsx?|jsx?)$/.test(e.name)
  );

  if (hasPage || hasRoute) {
    routes.push(prefix || "/");
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    // Skip dynamic route groups and internal dirs
    if (entry.name.startsWith("(")) {
      // Layout groups — recurse without adding to prefix
      routes.push(...getRoutes(path.join(appDir, entry.name), prefix));
    } else if (entry.name.startsWith("_")) {
      continue;
    } else {
      const segment = entry.name.startsWith("[")
        ? entry.name
        : entry.name;
      routes.push(
        ...getRoutes(path.join(appDir, entry.name), `${prefix}/${segment}`)
      );
    }
  }

  return routes;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const sql = postgres(connectionString);

  // 1. Get table names
  const tables = await sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;
  const tableNames = tables.map((r) => r.tablename as string);

  await sql.end();

  // 2. Walk src/app/ for routes
  const appDir = path.resolve(__dirname, "../src/app");
  const routes = getRoutes(appDir).sort();

  // 3. Check integrations
  const integrations: Record<string, string> = {};
  for (const [name, envVar] of Object.entries(KNOWN_INTEGRATIONS)) {
    if (process.env[envVar]) {
      integrations[name] = envVar;
    }
  }

  const manifest = {
    version: "0.1.0",
    generatedAt: new Date().toISOString(),
    tables: tableNames,
    routes,
    integrations,
  };

  const outPath = path.resolve(__dirname, "../public/base-manifest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${outPath}`);
  console.log(`  Tables: ${tableNames.length}`);
  console.log(`  Routes: ${routes.length}`);
  console.log(`  Integrations: ${Object.keys(integrations).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
