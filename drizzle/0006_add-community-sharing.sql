ALTER TABLE user_settings ADD COLUMN community_sharing_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE user_settings ADD COLUMN last_shared_fingerprint jsonb;
ALTER TABLE user_settings ADD COLUMN last_shared_at timestamp with time zone;
ALTER TABLE user_settings ADD COLUMN nudge_snoozed_until timestamp with time zone;
