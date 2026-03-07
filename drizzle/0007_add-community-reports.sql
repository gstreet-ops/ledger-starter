CREATE TABLE IF NOT EXISTS "community_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fingerprint" jsonb NOT NULL,
  "diff" jsonb NOT NULL,
  "description" text,
  "base_version" text NOT NULL,
  "fingerprint_hash" text NOT NULL,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
