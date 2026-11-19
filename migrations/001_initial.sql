CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  data_mode TEXT NOT NULL CHECK (data_mode IN ('sample', 'production')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  case_no TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  business_type_code TEXT,
  business_type TEXT,
  jurisdiction_type TEXT CHECK (jurisdiction_type IN ('domestic', 'overseas')),
  country TEXT,
  status_code TEXT,
  status TEXT,
  application_number TEXT,
  registration_number TEXT,
  official_deadline DATE,
  responsible_user_id TEXT,
  responsible_user TEXT,
  law_firm_name TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, case_no)
);

CREATE INDEX IF NOT EXISTS cases_workspace_deadline_idx
  ON cases (workspace_id, official_deadline)
  WHERE official_deadline IS NOT NULL;

CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  source_id TEXT,
  source_hash TEXT NOT NULL,
  total_count INTEGER NOT NULL,
  success_count INTEGER NOT NULL,
  duplicate_count INTEGER NOT NULL,
  conflict_count INTEGER NOT NULL,
  rejected_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, source_hash)
);

CREATE TABLE IF NOT EXISTS import_rows (
  id UUID PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  case_id UUID REFERENCES cases(id),
  case_no TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'duplicate', 'conflict', 'rejected')),
  message TEXT NOT NULL,
  source_payload JSONB NOT NULL,
  UNIQUE (batch_id, row_number)
);
