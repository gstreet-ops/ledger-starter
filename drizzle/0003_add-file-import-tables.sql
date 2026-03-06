CREATE TYPE "public"."import_batch_status" AS ENUM('pending', 'processing', 'complete', 'error');--> statement-breakpoint
CREATE TYPE "public"."import_source" AS ENUM('amex', 'citi', 'truist');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('unmatched', 'auto_matched', 'manual_matched', 'skipped');--> statement-breakpoint
CREATE TABLE "file_import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "import_source" NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_type" varchar(10) NOT NULL,
	"account_last4" varchar(4),
	"statement_period_start" timestamp with time zone,
	"statement_period_end" timestamp with time zone,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "import_batch_status" DEFAULT 'pending' NOT NULL,
	"row_count" integer DEFAULT 0 NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "file_import_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"raw_data" jsonb NOT NULL,
	"parsed_date" timestamp with time zone NOT NULL,
	"parsed_description" varchar(1000) NOT NULL,
	"parsed_amount" numeric(12, 2) NOT NULL,
	"parsed_category" varchar(255),
	"external_id" varchar(500) NOT NULL,
	"source" "import_source" NOT NULL,
	"section" varchar(100),
	"matched_transaction_id" uuid,
	"match_status" "match_status" DEFAULT 'unmatched' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file_import_rows" ADD CONSTRAINT "file_import_rows_batch_id_file_import_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."file_import_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_import_rows" ADD CONSTRAINT "file_import_rows_matched_transaction_id_transactions_id_fk" FOREIGN KEY ("matched_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_file_import_rows_source_external_id" ON "file_import_rows" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "idx_file_import_rows_batch_id" ON "file_import_rows" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "idx_file_import_rows_match_status" ON "file_import_rows" USING btree ("match_status");