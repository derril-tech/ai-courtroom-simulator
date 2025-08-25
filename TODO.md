# TODO — COURTROOM SIMULATOR (Judge AI)
> Phase‑gated backlog. [Code] deterministic; [Crew] agent prompts/policies.

## Phase 0 — Repo, Infra, CI/CD
- [x] Monorepo: `apps/{frontend,gateway,orchestrator,workers}`; `packages/{sdk}`.
- [x] `docker-compose.dev.yml`: Postgres, Redis, NATS, MinIO; healthchecks; seed command.
- [x] `env.example` (DB/REDIS/NATS/S3/JWT/OAuth); local TLS certs.
- [x] GitHub Actions: lint/typecheck/test; Docker build; SBOM + cosign; migration gate.

## Phase 1 — DB & Contracts
- [x] SQL migrations for tables in ARCH; RLS policies; vector indexes (facts/exhibits).
- [x] OpenAPI 3.1 + Zod parity; Problem+JSON wrapper; Idempotency middleware.
- [x] Auth.js + RBAC guards (Owner/Admin/Facilitator/Participant/Observer).

## Phase 2 — Intake & Exhibits
- [x] `intake-normalizer`: counts/elements/defenses from summary; witness/exhibit schemas.
- [x] `evidence-ingest`: uploads, MIME sniffing, checksum, PII redaction pass; embeddings for fact snippets.
- [x] [UI] **CaseWizard**, **CountEditor**, **WitnessList**, **ExhibitManager**; element matrix baseline.

## Phase 3 — Pre‑trial Motions
- [x] Motion lifecycle + Judge ruling rationale; audit entries.
- [x] [UI] **MotionEditor** + **RulingCard** with timestamps; WS channel `pretrial`.

## Phase 4 — Trial Director & Transcript
- [x] [Code] `trial-director` state machine; `Transcript.append` with anchors to exhibits/elements.
- [x] [Code] `objection-engine` (suggest grounds) + `Objection.rule` (Judge) path; hotkeys.
- [x] [UI] **TrialTimeline**, **TranscriptStream**, **ObjectionPanel**, **WitnessWorkbench**; admitted exhibit badges.

## Phase 5 — Instructions & Verdict Form
- [x] [Code] `instruction-engine` (generic templates): burden, elements, credibility, experts, limited purpose.
- [x] [UI] **InstructionViewer**; publish → gate deliberation.

## Phase 6 — Deliberation & Verdict
- [x] [Code] `deliberation-engine`: juror priors, unanimity/majority, convergence; vote trajectory.
- [x] [UI] **VoteTrajectory**, **VerdictForm**; rationale writer; hung handling.

## Phase 7 — (Optional) Sentencing
- [Code] `sentencing-engine` using generic aggravating/mitigating factors; recommendation string.
- [UI] **SentencingPanel**.

## Phase 8 — Exports & Observability
- [x] [Code] `exporter` bundle (transcript/rulings/instructions/verdict/(sentencing)) → MD/PDF/HTML/ZIP; signed URLs; previews.
- [x] [Code] OTel traces & Grafana dashboards; Sentry; retention sweeps; cost/concurrency guards.
- [x] [Code] Audit every ruling/instruction/verdict/export.

## Testing Matrix
- [x] **Unit**: intake normalization; objection suggestion & ruling rules; instruction generator; deliberation convergence; transcript anchors.
- [x] **Contract**: OpenAPI + Zod; Problem+JSON renderer.
- [ ] **E2E (Playwright)**: intake → pretrial → trial (witness block) → instructions → deliberation → verdict → export.
- [ ] **Load (k6)**: concurrent trials; WS throughput; objection spike bursts.
- [ ] **Chaos**: long PDFs/images; rapid objections; missing foundation paths.
- [x] **Security**: ZAP; dependency & secret scans; object‑store scope tests.

## Seeds & Fixtures
- [x] [Code] **3 sample cases**:
  - Criminal: simple theft with 2 witnesses, 3 exhibits (photo, receipt, statement).
  - Civil: breach of contract with emails (hearsay/exception exercise).
  - Torts: negligence with causation/foundation focus.
- [x] [Code] Objection grounds catalog with examples & rationale snippets.
- [x] [Code] Instruction templates (generic) with placeholders for elements/defenses.
- [x] [Code] Export themes (court‑style PDF) and sample bundles.

## Operational Runbooks
- [x] SLO dashboards & alerts (objection latency, transcript lag, export success).
- [x] PII redaction checklist; exhibit retention defaults (e.g., 90d temp, 365d exports).
- [x] Incident playbooks (WS degradation; NATS backlog; Redis eviction).

## Out of Scope (MVP)
- Jurisdiction‑specific jury instructions or citing case law.
- Live audio/STT or real witness media capture.
- Real e‑discovery ingestion pipelines.
