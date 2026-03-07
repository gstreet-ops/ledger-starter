import {
  pgTable,
  uuid,
  varchar,
  numeric,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  check,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Enums
export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "income",
  "expense",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "posted",
  "voided",
]);

export const importRowStatusEnum = pgEnum("import_row_status", [
  "pending",
  "matched",
  "ignored",
]);

// Accounts — Chart of Accounts
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: integer("code").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: accountTypeEnum("type").notNull(),
  parentId: uuid("parent_id").references((): any => accounts.id),
  scheduleCLine: varchar("schedule_c_line", { length: 50 }),
  stateFormCategory: varchar("state_form_category", { length: 100 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tax Categories — mapping to IRS / state lines
export const taxCategories = pgTable("tax_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  formLine: varchar("form_line", { length: 100 }).notNull(),
  form: varchar("form", { length: 50 }).notNull(), // "schedule_c", "ga_500"
  description: text("description"),
});

// Plaid Items — one per bank connection
export const plaidItems = pgTable("plaid_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  institutionId: varchar("institution_id", { length: 100 }),
  institutionName: varchar("institution_name", { length: 255 }),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  itemId: varchar("item_id", { length: 255 }).notNull().unique(),
  cursor: varchar("cursor", { length: 500 }),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Plaid Accounts — bank accounts under a Plaid item
export const plaidAccounts = pgTable("plaid_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  plaidItemId: uuid("plaid_item_id")
    .notNull()
    .references(() => plaidItems.id),
  accountId: varchar("account_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  officialName: varchar("official_name", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull(),
  subtype: varchar("subtype", { length: 50 }),
  mask: varchar("mask", { length: 10 }),
  ledgerAccountId: uuid("ledger_account_id").references(() => accounts.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Transactions — journal entries
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    description: varchar("description", { length: 500 }).notNull(),
    status: transactionStatusEnum("status").notNull().default("pending"),
    memo: text("memo"),
    aiSuggestion: jsonb("ai_suggestion"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_transactions_date").on(table.date),
    index("idx_transactions_status").on(table.status),
  ]
);

// Transaction Lines — debit/credit entries (double-entry)
// Invariant: SUM(debit) = SUM(credit) per transaction_id
// Enforced via application logic + database trigger
export const transactionLines = pgTable(
  "transaction_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    debit: numeric("debit", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    credit: numeric("credit", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    memo: text("memo"),
  },
  (table) => [
    check(
      "debit_or_credit_positive",
      sql`(${table.debit} >= 0 AND ${table.credit} >= 0) AND (${table.debit} > 0 OR ${table.credit} > 0)`
    ),
    index("idx_txn_lines_transaction_id").on(table.transactionId),
    index("idx_txn_lines_account_id").on(table.accountId),
  ]
);

// Sync Batches — tracks each Plaid sync run
export const syncBatches = pgTable("sync_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  plaidItemId: uuid("plaid_item_id")
    .notNull()
    .references(() => plaidItems.id),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  addedCount: integer("added_count").notNull().default(0),
  modifiedCount: integer("modified_count").notNull().default(0),
  removedCount: integer("removed_count").notNull().default(0),
  error: text("error"),
});

// Import Rows — raw bank data, never deleted (audit trail)
export const importRows = pgTable(
  "import_rows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    syncBatchId: uuid("sync_batch_id")
      .notNull()
      .references(() => syncBatches.id),
    plaidTransactionId: varchar("plaid_transaction_id", { length: 255 })
      .notNull()
      .unique(),
    plaidAccountId: uuid("plaid_account_id")
      .notNull()
      .references(() => plaidAccounts.id),
    rawData: jsonb("raw_data").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    name: varchar("name", { length: 500 }).notNull(),
    merchantName: varchar("merchant_name", { length: 255 }),
    category: jsonb("category"),
    status: importRowStatusEnum("status").notNull().default("pending"),
    transactionId: uuid("transaction_id").references(() => transactions.id),
    aiSuggestion: jsonb("ai_suggestion"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_import_rows_status").on(table.status),
    index("idx_import_rows_sync_batch_id").on(table.syncBatchId),
  ]
);

// Estimated Tax Payments — quarterly payment tracking
export const estimatedTaxPayments = pgTable("estimated_tax_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  year: integer("year").notNull(),
  quarter: integer("quarter").notNull(), // 1-4
  estimatedAmount: numeric("estimated_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  paidDate: timestamp("paid_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Categorization Rules — user-defined rules for auto-categorization
export const categorizationRules = pgTable(
  "categorization_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    pattern: varchar("pattern", { length: 500 }).notNull(),
    matchField: varchar("match_field", { length: 50 }).notNull().default("name"), // name, merchant_name
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id),
    priority: integer("priority").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_rules_active_priority").on(table.isActive, table.priority),
  ]
);

// --- File Import Pipeline (AmEx, Citi, Truist statement imports) ---

export const importSourceEnum = pgEnum("import_source", [
  "amex",
  "citi",
  "truist",
]);

export const importBatchStatusEnum = pgEnum("import_batch_status", [
  "pending",
  "processing",
  "complete",
  "error",
]);

export const matchStatusEnum = pgEnum("match_status", [
  "unmatched",
  "auto_matched",
  "manual_matched",
  "skipped",
]);

// Import Batches — one per uploaded file
export const fileImportBatches = pgTable("file_import_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: importSourceEnum("source").notNull(),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 10 }).notNull(), // xlsx, pdf, csv
  accountLast4: varchar("account_last4", { length: 4 }),
  statementPeriodStart: timestamp("statement_period_start", { withTimezone: true }),
  statementPeriodEnd: timestamp("statement_period_end", { withTimezone: true }),
  importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
  status: importBatchStatusEnum("status").notNull().default("pending"),
  rowCount: integer("row_count").notNull().default(0),
  errorMessage: text("error_message"),
});

// File Import Rows — parsed rows from bank statements
export const fileImportRows = pgTable(
  "file_import_rows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => fileImportBatches.id),
    rawData: jsonb("raw_data").notNull(),
    parsedDate: timestamp("parsed_date", { withTimezone: true }).notNull(),
    parsedDescription: varchar("parsed_description", { length: 1000 }).notNull(),
    parsedAmount: numeric("parsed_amount", { precision: 12, scale: 2 }).notNull(),
    parsedCategory: varchar("parsed_category", { length: 255 }),
    externalId: varchar("external_id", { length: 500 }).notNull(),
    source: importSourceEnum("source").notNull(),
    section: varchar("section", { length: 100 }),
    matchedTransactionId: uuid("matched_transaction_id").references(() => transactions.id),
    matchStatus: matchStatusEnum("match_status").notNull().default("unmatched"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_file_import_rows_source_external_id").on(table.source, table.externalId),
    index("idx_file_import_rows_batch_id").on(table.batchId),
    index("idx_file_import_rows_match_status").on(table.matchStatus),
  ]
);

// User Settings — set during /setup wizard, drives all entity/state/tax behavior
export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Entity & tax configuration
  entityType: text("entity_type").notNull().default("sole_prop"), // sole_prop | smllc | s_corp | partnership
  state: text("state").notNull().default("XX"),                   // 2-letter state code
  filingMethod: text("filing_method").notNull().default("self"),  // self | cpa
  taxYearStart: text("tax_year_start").notNull().default("01-01"), // MM-DD
  fiscalYearEnd: text("fiscal_year_end").notNull().default("12-31"),
  // Feature flags
  plaidEnabled: boolean("plaid_enabled").notNull().default(true),
  // Display
  businessName: text("business_name"),
  ownerName: text("owner_name"),
  timezone: text("timezone").notNull().default("America/New_York"),
  // Wizard state
  setupComplete: boolean("setup_complete").notNull().default(false),
  // Community sharing
  communitySharingEnabled: boolean("community_sharing_enabled").notNull().default(false),
  lastSharedFingerprint: jsonb("last_shared_fingerprint"),
  lastSharedAt: timestamp("last_shared_at", { withTimezone: true }),
  nudgeSnoozedUntil: timestamp("nudge_snoozed_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Community Reports — local audit trail of shared fingerprints
export const communityReports = pgTable("community_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  fingerprint: jsonb("fingerprint").notNull(),
  diff: jsonb("diff").notNull(),
  description: text("description"),
  baseVersion: text("base_version").notNull(),
  fingerprintHash: text("fingerprint_hash").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});
