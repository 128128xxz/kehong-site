CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('customer_submitted', 'company_visitor_lead')),
  source TEXT NOT NULL,
  source_label TEXT NOT NULL,
  status TEXT NOT NULL,
  customer_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_message TEXT,
  company_name TEXT,
  company_domain TEXT,
  company_website TEXT,
  country_code TEXT,
  country_name TEXT,
  region TEXT,
  city TEXT,
  industry TEXT,
  employee_range TEXT,
  revenue_range TEXT,
  headquarters TEXT,
  linkedin_url TEXT,
  network_type TEXT,
  provider_name TEXT,
  provider_confidence NUMERIC,
  lead_score INTEGER,
  score_reasons JSONB,
  first_seen_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_events INTEGER NOT NULL DEFAULT 0,
  first_referrer TEXT,
  latest_referrer TEXT,
  first_utm_source TEXT,
  latest_utm_source TEXT,
  linked_inquiry_id UUID REFERENCES inquiries(id),
  company_identity TEXT,
  requires_manual_link BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inquiries_type_status_idx ON inquiries (inquiry_type, status);
CREATE INDEX IF NOT EXISTS inquiries_company_identity_idx ON inquiries (company_identity, updated_at);
CREATE INDEX IF NOT EXISTS inquiries_company_domain_idx ON inquiries (company_domain, updated_at);

CREATE TABLE IF NOT EXISTS inquiry_company_profiles (
  inquiry_id UUID PRIMARY KEY REFERENCES inquiries(id) ON DELETE CASCADE,
  company_identity TEXT NOT NULL,
  provider_name TEXT,
  provider_confidence NUMERIC,
  network_type TEXT,
  company_domain TEXT,
  company_name TEXT,
  country_code TEXT,
  industry TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inquiry_visit_events (
  id UUID PRIMARY KEY,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,
  ip_hash TEXT,
  event_id TEXT NOT NULL UNIQUE,
  company_identity TEXT,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  duration_seconds INTEGER,
  country_code TEXT,
  network_type TEXT,
  bot_category TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS inquiry_visit_events_identity_idx ON inquiry_visit_events (company_identity, occurred_at);
CREATE INDEX IF NOT EXISTS inquiry_visit_events_expiry_idx ON inquiry_visit_events (expires_at);

CREATE TABLE IF NOT EXISTS inquiry_activity_logs (
  id UUID PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  notification_key TEXT,
  status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (inquiry_id, activity_type, notification_key)
);

CREATE TABLE IF NOT EXISTS provider_cache (
  cache_key TEXT PRIMARY KEY,
  provider_name TEXT NOT NULL,
  result JSONB,
  is_negative BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS provider_cache_expiry_idx ON provider_cache (expires_at);
