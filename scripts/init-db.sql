-- Created automatically by Cursor AI (2024-01-01)
-- Initial database schema for Courtroom Simulator

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Tenancy & Identity
CREATE TABLE orgs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    email CITEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    tz TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE memberships (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    workspace_role TEXT CHECK (workspace_role IN ('owner','admin','facilitator','participant','observer')) DEFAULT 'participant',
    PRIMARY KEY (user_id, org_id)
);

-- Cases
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    jurisdiction TEXT,
    case_type TEXT CHECK (case_type IN ('criminal','civil')) NOT NULL,
    status TEXT CHECK (status IN ('created','pretrial','trial','deliberating','verdict','exported','archived')) DEFAULT 'created',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    side TEXT CHECK (side IN ('prosecution','defense','plaintiff','defendant')) NOT NULL,
    name TEXT NOT NULL,
    counsel TEXT
);

CREATE TABLE counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    description TEXT,
    burden TEXT CHECK (burden IN ('BRD','preponderance')) NOT NULL,
    elements JSONB DEFAULT '{}',
    defenses JSONB DEFAULT '{}'
);

CREATE TABLE witnesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    credibility_notes TEXT
);

CREATE TABLE exhibits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    s3_key TEXT NOT NULL,
    mime TEXT NOT NULL,
    foundation JSONB DEFAULT '{}',
    admitted BOOLEAN DEFAULT FALSE,
    objections JSONB DEFAULT '{}',
    embedding VECTOR(1536)
);

CREATE TABLE facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    time_hint TEXT,
    source TEXT,
    embedding VECTOR(1536)
);

-- Pretrial Motions & Rulings
CREATE TABLE motions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    kind TEXT CHECK (kind IN ('limine','suppress','summary_judgment','sever')) NOT NULL,
    filed_by TEXT NOT NULL,
    arguments TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending','granted','denied','granted_in_part')) DEFAULT 'pending',
    ruling TEXT,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Trial Record
CREATE TABLE turns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    phase TEXT CHECK (phase IN ('opening','direct','cross','redirect','recross','closing','sidebar')) NOT NULL,
    speaker TEXT CHECK (speaker IN ('judge','prosecutor','defense','witness','jury')) NOT NULL,
    witness_id UUID REFERENCES witnesses(id),
    count_id UUID REFERENCES counts(id),
    text TEXT NOT NULL,
    timestamp_ms BIGINT NOT NULL,
    meta JSONB DEFAULT '{}'
);

CREATE TABLE objections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    turn_id UUID REFERENCES turns(id) ON DELETE CASCADE,
    ground TEXT NOT NULL,
    by_side TEXT NOT NULL,
    ruling TEXT CHECK (ruling IN ('sustain','overrule')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE instructions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    section TEXT NOT NULL,
    order_idx INT NOT NULL
);

CREATE TABLE verdicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    result JSONB NOT NULL,
    rationale TEXT,
    poll JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sentencing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    recommendation TEXT,
    factors JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Collaboration & Exports
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    turn_id UUID REFERENCES turns(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    body TEXT NOT NULL,
    anchor JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    kind TEXT CHECK (kind IN ('transcript','rulings','instructions','bundle')) NOT NULL,
    s3_key TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    org_id UUID REFERENCES orgs(id),
    user_id UUID REFERENCES users(id),
    case_id UUID REFERENCES cases(id),
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_cases_org_id ON cases(org_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_turns_case_id_phase ON turns(case_id, phase, timestamp_ms);
CREATE INDEX idx_objections_case_id_turn_id ON objections(case_id, turn_id);
CREATE INDEX idx_exhibits_case_id ON exhibits(case_id);
CREATE INDEX idx_witnesses_case_id ON witnesses(case_id);
CREATE INDEX idx_counts_case_id ON counts(case_id);
CREATE INDEX idx_audit_log_org_id ON audit_log(org_id);
CREATE INDEX idx_audit_log_case_id ON audit_log(case_id);

-- Vector indexes for embeddings
CREATE INDEX idx_exhibits_embedding ON exhibits USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_facts_embedding ON facts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security (RLS) policies
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE witnesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibits ENABLE ROW LEVEL SECURITY;
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE motions ENABLE ROW LEVEL SECURITY;
ALTER TABLE turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE objections ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentencing ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Sample data for development
INSERT INTO orgs (id, name, plan) VALUES 
    (uuid_generate_v4(), 'Law School Demo', 'free'),
    (uuid_generate_v4(), 'Corporate Training', 'premium');

-- Create a demo user
INSERT INTO users (id, org_id, email, name, role) 
SELECT 
    uuid_generate_v4(),
    o.id,
    'demo@courtsim.com',
    'Demo User',
    'admin'
FROM orgs o WHERE o.name = 'Law School Demo';
