-- Migration 0004: user_settings table
-- Stores configuration set during the /setup wizard.
-- Drives entity type, state tax logic, and feature flags at runtime.

CREATE TABLE IF NOT EXISTS "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL DEFAULT 'sole_prop',
	"state" text NOT NULL DEFAULT 'XX',
	"filing_method" text NOT NULL DEFAULT 'self',
	"tax_year_start" text NOT NULL DEFAULT '01-01',
	"fiscal_year_end" text NOT NULL DEFAULT '12-31',
	"plaid_enabled" boolean NOT NULL DEFAULT true,
	"business_name" text,
	"owner_name" text,
	"timezone" text NOT NULL DEFAULT 'America/New_York',
	"setup_complete" boolean NOT NULL DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
