-- Roll back B2B-specific structures only.
-- The shared inquiries table also stores customer-submitted inquiries and is intentionally retained.
DROP TABLE IF EXISTS inquiry_activity_logs;
DROP TABLE IF EXISTS inquiry_visit_events;
DROP TABLE IF EXISTS inquiry_company_profiles;
DROP TABLE IF EXISTS provider_cache;
