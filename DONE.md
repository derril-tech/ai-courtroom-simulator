# DONE — COURTROOM SIMULATOR (Judge AI)

## Phase 0 — Repo, Infra, CI/CD
[2024-12-19] [Claude] Monorepo: `apps/{frontend,gateway,orchestrator,workers}`; `packages/{sdk}`.
[2024-12-19] [Claude] `docker-compose.dev.yml`: Postgres, Redis, NATS, MinIO; healthchecks; seed command.
[2024-12-19] [Claude] `env.example` (DB/REDIS/NATS/S3/JWT/OAuth); local TLS certs.

## Phase 1 — DB & Contracts
[2024-12-19] [Claude] SQL migrations for tables in ARCH; RLS policies; vector indexes (facts/exhibits).
[2024-12-19] [Claude] OpenAPI 3.1 + Zod parity; Problem+JSON wrapper; Idempotency middleware.
[2024-12-19] [Claude] Auth.js + RBAC guards (Owner/Admin/Facilitator/Participant/Observer).

## Phase 2 — Intake & Exhibits
[2024-12-19] [Claude] `intake-normalizer`: counts/elements/defenses from summary; witness/exhibit schemas.
[2024-12-19] [Claude] `evidence-ingest`: uploads, MIME sniffing, checksum, PII redaction pass; embeddings for fact snippets.
[2024-12-19] [Claude] [UI] **CaseWizard**, **CountEditor**, **WitnessList**, **ExhibitManager**; element matrix baseline.

## Phase 3 — Pre‑trial Motions
[2024-12-19] [Claude] Motion lifecycle + Judge ruling rationale; audit entries.
[2024-12-19] [Claude] [UI] **MotionEditor** + **RulingCard** with timestamps; WS channel `pretrial`.

## Phase 4 — Trial Director & Transcript
[2024-12-19] [Claude] [Code] `trial-director` state machine; `Transcript.append` with anchors to exhibits/elements.
[2024-12-19] [Claude] [Code] `objection-engine` (suggest grounds) + `Objection.rule` (Judge) path; hotkeys.
[2024-12-19] [Claude] [UI] **TrialTimeline**, **TranscriptStream**, **ObjectionPanel**, **WitnessWorkbench**; admitted exhibit badges.

## Phase 5 — Instructions & Verdict Form
[2024-12-19] [Claude] [Code] `instruction-engine` (generic templates): burden, elements, credibility, experts, limited purpose.
[2024-12-19] [Claude] [UI] **InstructionViewer**; publish → gate deliberation.

## Phase 6 — Deliberation & Verdict
[2024-12-19] [Claude] [Code] `deliberation-engine`: juror priors, unanimity/majority, convergence; vote trajectory.
[2024-12-19] [Claude] [UI] **VoteTrajectory**, **VerdictForm**; rationale writer; hung handling.

## Phase 0 — Infrastructure (Additional)
[2024-12-19] [Claude] GitHub Actions CI/CD pipeline with linting, testing, building, and security scanning.
[2024-12-19] [Claude] Fixed missing API router file in NestJS gateway.

## Phase 8 — Exports & Observability
[2024-12-19] [Claude] [Code] `exporter` bundle system with ZIP/PDF/HTML/MD formats and signed URLs.
[2024-12-19] [Claude] [Code] Operational runbooks with SLO dashboards, PII redaction, and incident playbooks.

## Seeds & Fixtures
[2024-12-19] [Claude] [Code] 3 sample cases (criminal theft, civil contract, negligence) with parties, witnesses, exhibits, and counts.
[2024-12-19] [Claude] [Code] Unit tests for intake normalizer with comprehensive test coverage.

## Testing Matrix
[2024-12-19] [Claude] **Unit**: intake normalization tests with mock coverage.
[2024-12-19] [Claude] **Security**: GitHub Actions security scanning with Trivy and dependency audits.
