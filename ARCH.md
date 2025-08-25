# Architecture — COURTROOM SIMULATOR (Judge AI)

## Topology
- **Frontend**: Next.js 14 (App Router, TS). UI: shadcn/Tailwind. Data: TanStack Query + Zustand (trial state). Realtime: WS + SSE fallback. Editors: TipTap (facts/motions), Monaco (advanced JSON). Tables: virtualized transcript/exhibits. Charts: Recharts (votes, coverage).
- **API Gateway**: NestJS (REST; OpenAPI 3.1; Zod/AJV validation; RBAC; rate limits; Idempotency‑Key; Problem+JSON). Signed S3/R2 URLs.
- **Auth**: Auth.js (OAuth/passwordless) + short‑lived JWT; SAML/OIDC; SCIM optional.
- **Orchestrator**: FastAPI + CrewAI; agents: **Judge, Prosecutor/Plaintiff, Defense, Jury Foreman**; support: **Evidence Clerk, Court Reporter, Bailiff/Timer**.
- **Workers (Python)**: `intake-normalizer`, `evidence-ingest`, `trial-director`, `objection-engine`, `instruction-engine`, `deliberation-engine`, `sentencing-engine` (optional), `exporter`.
- **Infra**: Postgres (+ pgvector), Redis (Upstash), NATS, Celery queues, S3/R2, OTel + Prometheus/Grafana + Sentry, Secrets via Vault/KMS.

## Data Model (high‑level)
- **Tenancy**: `orgs`, `users`, `memberships` (Owner/Admin/Facilitator/Participant/Observer).
- **Case Core**: `cases`, `parties`, `counts` (elements/defenses JSON), `witnesses`, `exhibits`, `facts`.
- **Pre‑trial**: `motions` (status, ruling, reasoning).
- **Trial Record**: `turns` (speaker/phase/timestamp), `objections` (ground, ruling, reason), `instructions`, `verdicts`, `sentencing`.
- **Collab/Exports**: `comments`, `exports`, `audit_log`.
- **Vectorized**: `exhibits.embedding`, `facts.embedding` for retrieval/anchor.

## API Surface (v1 highlights)
- **Auth/Org**: `POST /auth/login`, `POST /auth/refresh`, `GET /me`.
- **Cases**: `POST /cases`, `POST /cases/:id/intake`, `GET /cases/:id`, `POST /cases/:id/exhibits`, `POST /cases/:id/motions`, `POST /motions/:id/rule`.
- **Trial**: `POST /cases/:id/openings`, `POST /cases/:id/examination`, `POST /cases/:id/objection`, `POST /cases/:id/closings`.
- **Instructions/Deliberation**: `POST /cases/:id/instructions`, `POST /cases/:id/deliberate`, `POST /cases/:id/sentence`.
- **Transcript/Comments**: `GET /cases/:id/transcript`, `POST /comments`.
- **Exports**: `POST /cases/:id/export`, `GET /exports/:id`.
**Conventions:** Idempotency‑Key on generate/mutate/export; Problem+JSON; cursor pagination; strict RLS.

## Agent Tool Contracts (strict JSON)
- `Case.parse(summary, charges, defenses)` → `{counts[], elements[], defenses[], parties[], timeline[], witnesses[], exhibits[]}`
- `Exhibit.register(file|url, meta)` → `{exhibit_id, foundation_requirements[]}`
- `Objection.suggest(context)` → `{ground, score, rationale}`  
  **Ground set (baseline):** relevance, unfair_prejudice, hearsay, hearsay_exception?, lack_of_foundation, speculation, argumentative, asked_and_answered, cumulative, leading_on_direct, beyond_scope, improper_character, authentication.
- `Objection.rule(ground, context)` (Judge) → `{ruling:'sustain'|'overrule', reason, limited_purpose?}`
- `Instruction.generate(counts, defenses, burden)` → `{instructions[], verdict_form}`
- `Deliberation.run(params, record)` → `{votes_over_time[], final_verdict, rationale, hung?}`
- `Sentencing.recommend(record, factors)` → `{range_text, aggravating[], mitigating[], recommendation}`
- `Transcript.append(turn)` → `{ok:true, anchor:{turn_id}}`
- `Export.bundle(caseId, targets[])` → `{links[]}`

## Deterministic Heuristics
- **Element coverage:** a count/element is **covered** when ≥1 admitted line/exhibit anchor supports it; **contested** when coverage exists but contradicted; else **unmet**.
- **Burden reminders:** criminal = *beyond a reasonable doubt*; civil = *preponderance of evidence*. Always restate before deliberation.
- **Objection adjudication:** if ground = **leading_on_direct** and speaker on **direct** with yes/no question pattern → default **sustain** unless foundation established; if **hearsay** and exception flagged (e.g., party admission), default **overrule** with limited‑purpose note.
- **Jury model defaults:** panel size 12 (criminal) / 8 (civil) with **unanimity** on criminal, **majority** (≥5/6) option on civil; priors sliders: evidence‑centric↔story‑centric, pro‑pros↔pro‑def bias.
- **Deliberation stop:** converge if votes stable for N rounds or threshold met; else flag **hung**.

## Realtime Channels
- `case:{id}:pretrial` — motion rulings  
- `case:{id}:trial` — line‑by‑line transcript  
- `case:{id}:objection` — raise→ruling ticks  
- `case:{id}:instructions` — instruction set ready  
- `case:{id}:deliberation` — vote updates, final  
- `case:{id}:export` — artifact completion  
Presence + edit locks during live trial.

## Security & Compliance
RBAC; Postgres RLS; S3 signed URLs; PII redaction on exhibits; KMS‑wrapped secrets; immutable audit of rulings/exports; retention windows configurable. Disclaimer banners throughout.

## Deployment & SLOs
FE: Vercel; APIs/Workers: Render/Fly → GKE at scale (pools for orchestration, transcript/indexing, exports).  
DB: Neon/Cloud SQL Postgres + pgvector; Redis cache; NATS bus; S3/R2 objects.  
**SLOs:** objection ruling < **800 ms P95**; transcript line < **300 ms P95**; instruction set < **5 s P95**; deliberation < **8 s P95**; export < **10 s P95**; 5xx < **0.5%/1k**.
