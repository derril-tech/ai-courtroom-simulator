COURTROOM SIMULATOR (JUDGE AI) —
END‑TO‑END PRODUCT BLUEPRINT
(React 18 + Next.js 14 App Router; CrewAI multi‑agent orchestration; TypeScript‑first
contracts.)

1) Product Description & Presentation
One‑liner
A multi‑agent mock‑trial engine where Judge, Prosecutor, Defense, and Jury Foreman
role‑play a case from pre‑trial to verdict: motions, openings, direct/cross, objections &
rulings, jury instructions, deliberation, and a reasoned verdict—optionally with sentencing
recommendation and appeal issues.
Positioning
•
•

A serious lawtech training/demo tool for law schools, bar prep, L&D at legal teams,
compliance workshops—also fun for “Judge Judy”‑style consumer demos.
Outputs: trial transcript, key exhibits list, rulings & reasoning, jury instructions,
verdict form, deliberation summary, sentencing memo (optional), and appealable
issues; exportable to Markdown/PDF/HTML.

Safety & Scope
•
•

Not legal advice. Jurisdictions differ; outputs are simulations.
No personal legal guidance or real‑case outcomes; redact sensitive PII by policy.

2) Target User
•

Law students & faculty (trial advocacy, evidence, criminal & civil procedure).

•

Corporate counsel / compliance L&D running tabletop exercises.

•
•

Paralegals / litigation support practicing storylines.
Creators/educators producing courtroom content responsibly.

3) Features & Functionalities (Extensive)
Case Intake & Pre‑Trial
•

•
•

Case intake wizard: jurisdiction (for terminology only), case type (criminal/civil),
charges/claims, elements, defenses/affirmatives, burden of proof, parties, fact
pattern, timeline, witness list, exhibits, stipulations.
Motions in limine & pre‑trial motions (suppress/strike/sever/summary judgment for
civil), with Judge rulings + rationale.
Jury selection (lite): optional panel prompts that shape juror priors for deliberation
realism.

Trial Orchestration
•
•

•
•
•

Opening statements (Prosecution/Plaintiff then Defense).
Witness flows: direct → cross → redirect → recross; objections (relevance, hearsay,
foundation, speculation, leading on direct, etc.) logged and ruled by Judge with brief
legal reasoning.
Exhibit handling: marking, laying foundation, admit/deny; automatic index.
Bench conferences (sidebars) for delicate evidentiary issues.
Court reporter transcript generated in real time with speaker tags.

Law‑Aware Reasoning (Simulation Layer)
•

Element tracking: real‑time “met/not met/contested” across charges/claims.

•

Burden of proof tracking: criminal (beyond a reasonable doubt), civil
(preponderance), special standards where set.
Jury instructions: generated from elements & defenses (generic templates,
jurisdiction‑agnostic phrasing).
Verdict forms: per count/claim; special interrogatories (civil) if enabled.

•
•

Deliberation & Verdict
•
•
•

Jury simulation: foreman moderates; panel explores evidence conflicts, credibility,
and standards of proof; majority/unanimity parameter.
Verdict with structured rationale; sentencing recommendation (if criminal) from
Judge after a brief allocution simulation.
Appeal issue spotter: flags preserved errors (e.g., objection preserved, relevance of
exclusion).

Modes & Presets
•
•
•

Academic mode (didactic comments enabled).
TV court mode (faster, punchy style, less formal).
Serious training mode (strict evidence discipline, minimal humor).

Collaboration & Governance
•
•
•

Roles: Facilitator, Participant, Observer.
Live presence, comments, suggested edits to case facts/exhibits.
Versioning with diffs of the record; immutable rulings log.

Exports
•
•

Complete transcript; rulings digest; jury instructions & verdict form; sentencing
memo; appeal issue list.
Formats: Markdown/HTML/PDF/ZIP bundle (with JSON of the structured record).

4) Backend Architecture (Extremely Detailed &
Deployment‑Ready)
4.1 High‑Level Topology
•
•

Frontend/BFF: Next.js 14 (Vercel), server actions for small writes, signed upload URLs,
SSR for read views.
API Gateway: Node/NestJS

REST (/v1), OpenAPI 3.1, Zod/AJV validation, RBAC, rate limits,
Idempotency‑Key, Problem+JSON errors.
Auth: Auth.js (OAuth/passwordless) + short‑lived JWT (rotating refresh); SAML/OIDC
for orgs; SCIM provisioning optional.
Orchestration: CrewAI Orchestrator (Python FastAPI) coordinating agents:
o Judge (procedure, rulings, instructions, verdict reasoning)
o Prosecutor/Plaintiff (case‑in‑chief, cross, closing)
o Defense Lawyer (defense theory, objections, cross, closing)
o Jury Foreman (deliberation moderation, verdict synthesis)
o Support agents: Evidence Clerk, Court Reporter, Bailiff/Timer
Workers (Python):
o intake-normalizer (case → structured elements, parties, counts)
o evidence-ingest (doc parse, metadata; image/video store pointers)
o trial-director (state machine: phases & turn‑taking)
o objection-engine (detect/score objections; pass to Judge)
o instruction-engine (jury instruction templates from elements/defenses)
o deliberation-engine (jury simulation parameters, vote model)
o sentencing-engine (if enabled; generic guidelines, non‑jurisdictional)
o exporter (transcript/rulings/instructions/verdict bundles)
Event Bus: NATS (case.*, evidence.*, trial.*, objection.*, instruction.*,
jury.*, export.*).
Task Queue: Celery (NATS/Redis backend) with lanes: interactive (trial turns),
batch (exports), ingest.
DB: Postgres (Neon/Cloud SQL) + pgvector (embeddings: fact passages, exhibits
summaries, objection exemplars, instruction templates).
Object Storage: S3/R2 (exhibits, uploads, exports).
Cache: Upstash Redis (hot trial state, live transcript buffer, presence).
Realtime: WebSocket gateway (NestJS Gateway) + SSE fallback (turns, rulings,
transcript).
Observability: OpenTelemetry traces; Prometheus/Grafana; Sentry; structured logs.
Secrets: Cloud Secrets Manager/Vault; KMS envelopes; zero plaintext secrets.
o

•
•

•

•
•
•
•
•
•
•
•

4.2 CrewAI Agents & Tools
Agents

•

•
•
•
•
•
•

Judge — enforces procedure, rules on objections (concise legal reasoning), manages
admissibility, crafts jury instructions, prepares verdict reasoning and (if enabled)
sentencing memo.
Prosecutor/Plaintiff — opening/closing; calls witnesses; foundations for exhibits;
meets elements; responds to objections.
Defense Lawyer — theory of defense; challenges foundation/credibility; motions;
closing.
Jury Foreman — simulates panel with configurable priors; moderates deliberation;
outputs verdict & deliberation summary.
Evidence Clerk — exhibit indexing, chain‑of‑custody metadata, redaction notes.
Court Reporter — formats transcript; timestamps; speaker turns.
Bailiff/Timer — manages clocks per phase (optional) & sidebar flags.

Agent Tools (strict interfaces)
•
•
•
•
•
•
•
•
•

Case.parse(summary, charges, defenses) → {counts[], elements[],
parties[], timeline[], witnesses[], exhibits[]}
Exhibit.register(file|url, meta) → {exhibit_id,
foundation_requirements[]}
Objection.suggest(context) → {ground, score, rationale}
Objection.rule(ground, context) (Judge) → {sustain|overrule, reason}
Instruction.generate(counts, defenses, burden) → {instructions[],
verdict_form}
Deliberation.run(params, record) → {votes_over_time[],
final_verdict, rationale}
Sentencing.recommend(record, factors) → {range_text, aggravating,
mitigating, recommendation}
Transcript.append(turn) → persisted lines
Export.bundle(caseId, targets[]) → signed URLs

4.3 Data Model (Postgres + pgvector)
-- Tenancy & Identity
CREATE TABLE orgs (
id UUID PRIMARY KEY, name TEXT NOT NULL, plan TEXT, created_at
TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE users (

id UUID PRIMARY KEY, org_id UUID REFERENCES orgs(id),
email CITEXT UNIQUE, name TEXT, role TEXT, tz TEXT,
created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE memberships (
user_id UUID REFERENCES users(id), org_id UUID REFERENCES orgs(id),
workspace_role TEXT CHECK (workspace_role IN
('owner','admin','facilitator','participant','observer')),
PRIMARY KEY (user_id, org_id)
);
-- Cases
CREATE TABLE cases (
id UUID PRIMARY KEY, org_id UUID, title TEXT, jurisdiction TEXT,
case_type TEXT CHECK (case_type IN ('criminal','civil')),
status TEXT CHECK (status IN
('created','pretrial','trial','deliberating','verdict','exported','arc
hived')) DEFAULT 'created',
created_by UUID, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE parties (
id UUID PRIMARY KEY, case_id UUID REFERENCES cases(id), side TEXT
CHECK (side IN ('prosecution','defense','plaintiff','defendant')),
name TEXT, counsel TEXT
);
CREATE TABLE counts (
id UUID PRIMARY KEY, case_id UUID REFERENCES cases(id), label TEXT,
description TEXT,
burden TEXT, -- 'BRD','preponderance'
elements JSONB, defenses JSONB
);
CREATE TABLE witnesses (
id UUID PRIMARY KEY, case_id UUID REFERENCES cases(id), name TEXT,
role TEXT, credibility_notes TEXT
);
CREATE TABLE exhibits (
id UUID PRIMARY KEY, case_id UUID REFERENCES cases(id), code TEXT,
title TEXT, s3_key TEXT, mime TEXT,
foundation JSONB, admitted BOOLEAN DEFAULT FALSE, objections JSONB,

embedding VECTOR(1536)
);
CREATE TABLE facts (
id UUID PRIMARY KEY, case_id UUID REFERENCES cases(id), text TEXT,
time_hint TEXT, source TEXT, embedding VECTOR(1536)
);
-- Pretrial Motions & Rulings
CREATE TABLE motions (
id UUID PRIMARY KEY, case_id UUID, kind TEXT, -'limine','suppress','summary_judgment','sever'
filed_by TEXT, arguments TEXT, status TEXT CHECK (status IN
('pending','granted','denied','granted_in_part')) DEFAULT 'pending',
ruling TEXT, reasoning TEXT, created_at TIMESTAMPTZ DEFAULT now()
);
-- Trial Record
CREATE TABLE turns (
id UUID PRIMARY KEY, case_id UUID, phase TEXT, -'opening','direct','cross','redirect','recross','closing','sidebar'
speaker TEXT, -- 'judge','prosecutor','defense','witness','jury'
witness_id UUID, count_id UUID, text TEXT, timestamp_ms BIGINT, meta
JSONB
);
CREATE TABLE objections (
id UUID PRIMARY KEY, case_id UUID, turn_id UUID, ground TEXT,
by_side TEXT, ruling TEXT, reason TEXT, created_at TIMESTAMPTZ DEFAULT
now()
);
CREATE TABLE instructions (
id UUID PRIMARY KEY, case_id UUID, text TEXT, section TEXT,
order_idx INT
);
CREATE TABLE verdicts (
id UUID PRIMARY KEY, case_id UUID, result JSONB, -- {count_id:
'guilty'|'not_guilty'|'liable'|'not_liable', ...}
rationale TEXT, poll JSONB, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE sentencing (

id UUID PRIMARY KEY, case_id UUID, recommendation TEXT, factors
JSONB, created_at TIMESTAMPTZ DEFAULT now()
);
-- Collaboration & Exports
CREATE TABLE comments (
id UUID PRIMARY KEY, case_id UUID, turn_id UUID, author_id UUID,
body TEXT, anchor JSONB, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE exports (
id UUID PRIMARY KEY, case_id UUID, kind TEXT, -'transcript','rulings','instructions','bundle'
s3_key TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE audit_log (
id BIGSERIAL PRIMARY KEY, org_id UUID, user_id UUID, case_id UUID,
action TEXT, target TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT
now()
);

Indexes & Constraints (high‑value)
•
•
•
•

Vector indexes on exhibits.embedding, facts.embedding.
CREATE INDEX ON turns (case_id, phase, timestamp_ms);
CREATE INDEX ON objections (case_id, turn_id);
Invariant: every objections.turn_id references a turns.id with phase in
{direct,cross,redirect,recross,closing,opening,sidebar}.

4.4 API Surface (REST /v1, OpenAPI)
Auth & Orgs
•
•

POST /v1/auth/login / POST /v1/auth/refresh
GET /v1/me / GET /v1/orgs/:id

Cases & Pre‑trial
•
•

POST /v1/cases {title,jurisdiction?,case_type}
GET /v1/cases/:id / list

•

POST /v1/cases/:id/intake {summary, charges, defenses, witnesses,
exhibits_meta[]} → normalized case

•
•
•

POST /v1/cases/:id/exhibits (multipart) → register
POST /v1/cases/:id/motions {kind, filed_by, arguments}
POST /v1/motions/:id/rule {status, ruling, reasoning} (Judge)

Trial Orchestration
•
•
•
•
•
•
•

POST /v1/cases/:id/openings → generate openings; stream via WS
POST /v1/cases/:id/examination {witness_id,
mode:'direct'|'cross'|'redirect'|'recross'}
POST /v1/cases/:id/objection {turn_id, ground} → Judge ruling
POST /v1/cases/:id/instructions → generate jury instructions + verdict form
POST /v1/cases/:id/closings → generate closings
POST /v1/cases/:id/deliberate {params} → verdict draft
POST /v1/cases/:id/sentence {factors} (optional)

Transcript & Collaboration
•
•

GET /v1/cases/:id/transcript (cursor paginated)
POST /v1/comments {case_id, turn_id?, body, anchor}

Exports
•
•

POST /v1/cases/:id/export
{targets:['transcript','rulings','instructions','bundle']}
GET /v1/exports/:id → signed URL

Conventions
•

All generate/mutate endpoints require Idempotency‑Key.

•
•

Errors: Problem+JSON with remediation hints.
Strict RLS by org/case.

4.5 Orchestration Logic (CrewAI)
State machine (per case)

created → pretrial → trial (openings → witness_loops → closings) →
instructions → deliberating → verdict → (optional) sentencing →
exported → archived
Witness loop
for witness in ordered_witnesses:
Prosecutor/Defense: DIRECT (foundation→exhibit→element coverage)
Defense/Prosecutor: CROSS (impeach, credibility)
Judge: rules on objections (sustain/overrule with reason)
(optional) REDIRECT / RECROSS

Objections
•

objection-engine scans the immediately prior Q/A and proposed exhibit admission;
suggests grounds (leading, hearsay, lack of foundation, speculation, argumentative,
cumulative).

•

Judge evaluates context (purpose, exception) → saves ruling + concise reason to
objections.

Deliberation
•

deliberation-engine seeds juror priors (sliders: evidence‑centric ↔ story‑centric,
pro‑prosecution bias, etc.), enforces unanimity or majority, and iterates until
convergence or hung flag; logs vote trajectories.

Instructions
•

instruction-engine composes generic, jurisdiction‑neutral instructions: burden,
elements, credibility, direct/circumstantial evidence, expert witnesses, limited
purposes, verdict directions.

4.6 Background Jobs
•
•
•
•
•

NormalizeIntake(caseId) → elements/defenses from summary.
IngestExhibits(caseId) → store & index.
GenerateOpenings(caseId) / GenerateClosings(caseId).
RunWitnessBlock(caseId, witnessId, mode).
RunInstructionSet(caseId) → instructions + verdict form.

•
•

RunDeliberation(caseId, params) → verdict + rationale.
BuildExportBundle(caseId, targets[]).

•

Housekeeping: RetentionSweep, CostRollup, AlertOnFailure.

4.7 Realtime
•

•

WS channels:
o case:{id}:pretrial (motion rulings)
o case:{id}:trial (turn stream)
o case:{id}:objection (instant ruling)
o case:{id}:instructions (ready)
o case:{id}:deliberation (vote updates)
o case:{id}:export (artifact status)
Presence: who is viewing/editing; lock sensitive edits during active trial.

4.8 Caching & Performance
•
•
•

Redis caches: current phase state, active witness context, last N transcript lines,
admitted exhibit set.
Concurrency caps: at most one active witness block per case; guard against
double‑posting objections.
SLOs:
o Objection ruling latency < 800 ms P95 after raise.
o New transcript line visible < 300 ms P95.
o Instruction set generation < 5 s P95.
o Deliberation verdict < 8 s P95 (standard case).

4.9 Observability
•
•
•

OTel traces across gateway → orchestrator → workers; span tags: case_id, phase,
witness_id, turn_id.
Metrics: objection sustain rate by ground; element coverage %; time per phase; hung
jury rate; export success.
Logs: structured JSON; redact PII; audit_log for rulings, edits, exports.

5) Frontend Architecture (React 18 + Next.js 14)
5.1 Tech Choices
•
•
•
•
•
•

Next.js 14 App Router, TypeScript.
UI: shadcn/ui + Tailwind (clean, courtroom‑like).
Data/state: TanStack Query (server cache) + Zustand for ephemeral trial state (active
witness, timers, selected lines).
Realtime: WebSocket client w/ auto‑reconnect/backoff; SSE fallback.
Editors: TipTap for case facts & motions; Monaco for JSON (advanced config).
Tables: virtualized transcript & exhibits list.

•

Charts: Recharts (vote trajectories, element coverage bars).

5.2 App Structure
/app
/(marketing)/page.tsx
/(app)
dashboard/page.tsx
cases/
new/page.tsx
[caseId]/
page.tsx
intake/page.tsx
witnesses, exhibits
pretrial/page.tsx
trial/
page.tsx
openings/page.tsx
witnesses/page.tsx
[witnessId]/page.tsx
closings/page.tsx
instructions/page.tsx
deliberation/page.tsx
verdict/page.tsx
exports/page.tsx
admin/audit/page.tsx
/components

// Case Overview & phase tracker
// Facts, charges, defenses,
// Motions & rulings
// Trial Director (timeline)

// Examination workspace

CaseWizard/*
PartiesEditor/*
CountEditor/*
WitnessList/*
ExhibitManager/*
MotionEditor/*
RulingCard/*
TrialTimeline/*
TranscriptStream/*
ObjectionPanel/*
WitnessWorkbench/*
ElementCoverage/*
InstructionViewer/*
VerdictForm/*
VoteTrajectory/*
SentencingPanel/*
ExportHub/*
CommentThread/*
/lib
api-client.ts
ws-client.ts
zod-schemas.ts
rbac.ts
/store
useCaseStore.ts
useTrialStore.ts
useTranscriptStore.ts
useRealtimeStore.ts

5.3 Key Pages & UX Flows
Dashboard
•
•

Tiles: “Start Case”, “Active Trials”, “Awaiting Deliberation”, “Recent Verdicts”.
Quick filters by case type (criminal/civil).

Intake

•
•

CaseWizard captures case summary → PartiesEditor, CountEditor
(elements/defenses), WitnessList, ExhibitManager.
Autosaves; shows ElementCoverage baseline (all unmet initially).

Pre‑trial
•

MotionEditor: add motions with arguments; RulingCard shows Judge ruling + reasons;
sidebars for in limine notes.

Trial
•
•

TrialTimeline: phase tracker (Openings → Witnesses → Closings).
Openings: start generation; live TranscriptStream.

•
•

Witnesses: list with status (not called, on stand, excused).
WitnessWorkbench (for a witness):
o Left: ExhibitManager (foundation checklist).
o Center: Q&A flow with ObjectionPanel (quick grounds, hotkeys).
o Right: ElementCoverage heat map (elements → evidence cites).
Closings: generate closings; toggle emphasis areas.

•

Instructions
•

InstructionViewer: preview jury instructions & verdict form; editable notes; publish to
record.

Deliberation
•

VoteTrajectory: votes over time; juror model toggles (unanimity, priors).

•

Foreman remarks stream; “Force hung” (facilitator) for pedagogy.

Verdict & Sentencing
•
•

VerdictForm: results per count/claim; rationale viewer.
SentencingPanel (optional): factors (aggravating/mitigating), recommendation text.

Exports
•

ExportHub: choose transcript/rulings/instructions/bundle; progress list; signed URLs.

5.4 Component Breakdown (Selected)
•

ObjectionPanel/GroundButton.tsx

Props: { ground, hotkey, onRaise }; shows tooltips (e.g., Hearsay exceptions
cheat); emits WS event; disabled during Judge ruling.
•

WitnessWorkbench/QAConsole.tsx

Props: { witness, mode }; renders alternating Q/A bubbles; integrates objection
buttons; highlights leading questions on direct.
•

ElementCoverage/Matrix.tsx

Props: { counts, evidenceLinks }; grid: counts × elements; state:
unmet/contested/covered; clicking opens transcript lines/exhibits.
•

TranscriptStream/Line.tsx

Props: { line }; speaker badge, timestamp, anchor to exhibit or element; copy anchor.
•

VoteTrajectory/Chart.tsx

Props: { votes }; line chart of guilty/liable counts; shows convergences; tooltip reveals
juror comments.

5.5 Data Fetching & Caching
•
•
•
•

Server Components for case metadata, counts, witnesses, exhibits.
TanStack Query for live trial artifacts (turns, objections, rulings, instructions, votes).
WS pushes for new turns/rulings/votes; update cached queries via
queryClient.setQueryData.
Route prefetch: intake → pretrial → trial → instructions → deliberation.

5.6 Validation & Error Handling
•
•

Shared Zod schemas: case intake, counts/elements, motions, objections,
instructions, verdict.
Problem+JSON renderer with remediation tips (e.g., “foundation missing:
authentication for Exhibit A”).

•

Guardrails: cannot move to deliberation until instructions published; cannot publish
verdict without completed verdict form.

5.7 Accessibility & i18n
•
•
•

Keyboard shortcuts for objections; ARIA roles for transcript; focus‑visible rings.
High‑contrast color palette; color‑blind safe element matrix.
next-intl scaffolding; localized terminology labels; RTL support.

6) Integrations
•
•
•
•

Storage: Google Drive/SharePoint (optional) for exhibits and export delivery.
Comms: Slack/Email for “Rulings ready”, “Instructions published”, “Verdict
rendered”.
Identity/SSO: Auth.js; SAML/OIDC; SCIM for orgs.
(No legal databases required) — generic, jurisdiction‑neutral templates only.

7) DevOps & Deployment
•
•
•
•
•
•
•
•
•

FE: Vercel (Next.js 14).
APIs/Workers: Render/Fly.io (simple) or GKE (scale; node pools: CPU for
orchestration, memory for transcript/exhibit indexing, burst for exports).
DB: Neon/Cloud SQL Postgres + pgvector; PITR; gated migrations.
Cache: Upstash Redis.
Object Store: S3/R2 with lifecycle (retain exports; purge temp uploads).
Event Bus: NATS (managed/self‑hosted).
CI/CD: GitHub Actions — lint/typecheck/unit/integration; Docker build; SBOM +
cosign; blue/green deploy; migration approvals.
IaC: Terraform modules (DB, Redis, NATS, buckets, secrets, DNS/CDN).
Testing
o Unit: intake normalization, objection grounds & rulings, instruction generator,
deliberation convergence.
o Contract: OpenAPI.

E2E (Playwright): intake → pretrial → trial (witness block) → instructions →
deliberation → verdict → export.
o Load: k6 (concurrent trials, transcript throughput).
o Chaos: long exhibits, rapid‑fire objections.
o Security: ZAP; container/dependency scans; secret scanning.
SLOs
o Objection ruling < 800 ms P95; instruction set < 5 s P95; deliberation < 8 s P95; 5xx
< 0.5%/1k.
o

•

8) Success Criteria
Product KPIs
•
•
•
•

Law school cohorts: ≥ 90% rate simulations “useful” for evidence/procedure practice.
Training mode: element coverage dashboards used in ≥ 80% of trials.
Export reliability: ≥ 99% artifact delivery.
Engagement: median simulated trial completion < 25 min.

Engineering SLOs
•

WS reconnect < 2 s P95; transcript append latency < 300 ms P95; export success ≥
99%.

9) Security & Compliance
•
•

•

RBAC: Owner/Admin/Facilitator/Participant/Observer; edit locks during live trial.
Encryption: TLS 1.2+; AES‑256 at rest; KMS envelopes for secrets; signed URLs for
exhibits/exports.
Privacy: PII redaction for uploaded exhibits; configurable retention & deletion; DSR
endpoints (export/delete).
Tenant isolation: Postgres RLS; S3 prefix isolation per org.

•
•

Audit: immutable audit_log of rulings, edits, exports.
Supply chain: SLSA provenance; image signing; dependency pinning.

•

•

Disclaimer: All outputs are simulations, not legal advice; no jurisdiction‑specific
authority.

10) Visual/Logical Flows
A) Intake → Pre‑trial
User enters summary & artifacts → intake-normalizer structures counts/elements →
motions filed → Judge rules → status pretrial.
B) Openings & Witness Blocks
Generate openings → begin witness loop (direct/cross…) → ObjectionPanel raises grounds
→ Judge rules → ElementCoverage updates.
C) Instructions & Verdict Form
instruction-engine composes instructions & verdict form → facilitator publishes.
D) Deliberation
deliberation-engine simulates jury with params → Jury Foreman narrates discussion
→ votes converge or hung → save verdict & rationale.
E) (Optional) Sentencing
Judge runs sentencing-engine with factors → recommendation text saved.
F) Export
exporter bundles transcript, rulings digest, instructions, verdict, (sentencing) →
signed URLs returned.

