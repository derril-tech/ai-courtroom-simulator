# Project Plan — COURTROOM SIMULATOR (Judge AI)

> Scope: Ship an MVP that runs **case intake → pre‑trial motions → openings → witness loops (direct/cross/redirect/recross) with objections & rulings → jury instructions & verdict form → deliberation → verdict (± sentencing) → export bundle**, with auditable reasoning and element/burden tracking.

## Product Goal
Deliver a serious, jurisdiction‑agnostic mock‑trial engine for education and training. Every ruling, instruction, and verdict ties back to explicit elements, burdens, and an evidentiary record. Outputs are exportable and traceable.

## Safety & Policy Stance
- **Not legal advice; simulation only.** Jurisdictions differ; templates are generic.
- **No personal legal guidance.** Redact/blur PII in exhibits by default.
- **Audit first.** Rulings, objections, instructions, and verdicts log reasons and anchors.

## 80/20 Build Strategy
- **80% deterministic/code:** intake normalization, element coverage, objection catalog, instruction generator, deliberation vote model, transcript & exhibit indexer, exports.
- **20% generative/agents:** openings/closings prose, witness Q/A drafting, concise ruling rationales, deliberation narration—bounded by strict JSON tool contracts.

## Immediate Next 3 Tasks
1) **Infra:** monorepo scaffold, `docker-compose.dev` (Postgres + Redis + NATS + MinIO), `.env.example`, GitHub Actions (lint/test/build; SBOM + signing).
2) **Contracts/Gateway:** NestJS API (RBAC, Idempotency‑Key, Problem+JSON, OpenAPI 3.1), signed upload URLs, WS channels.
3) **Core engines:** intake normalizer, objection/ruling catalog + evaluator, instruction generator, transcript pipeline.

## Phases
- **P0** Infra/CI & typed contracts  
- **P1** DB schema + migrations + RLS  
- **P2** Case intake + exhibit ingestion  
- **P3** Pre‑trial motions + Judge rulings  
- **P4** Trial director + transcript + objections flow  
- **P5** Instructions + verdict form generator  
- **P6** Jury model + deliberation + verdict writer  
- **P7** (Optional) sentencing recommender  
- **P8** Exports bundle + observability/tests/hardening

## Definition of Done (MVP)
- Intake wizard → normalized **counts/elements/defenses**, parties, witnesses, exhibits.
- Pre‑trial motions with Judge rulings + reasons.
- Trial loop: **openings**, witness blocks (direct/cross/redirect/recross), **objection raise → ruling (<800 ms P95)**, admitted exhibit index.
- **Element coverage** matrix updated from record anchors.
- Instruction set + verdict form generated from elements/defenses + burden.
- Deliberation engine: configurable **unanimity/majority**, juror priors, vote trajectory, final verdict with rationale.
- (Optional) Sentencing recommendation text from generic factors.
- **Exports**: transcript (Markdown/PDF), rulings digest, instructions + verdict form, deliberation summary, (± sentencing), ZIP bundle.
- **SLOs:** transcript append < **300 ms P95**; instruction set < **5 s P95**; deliberation verdict < **8 s P95**; export < **10 s P95**.

## Non‑Goals (MVP)
- Jurisdiction‑specific pattern jury instructions; case law retrieval.
- Real‑party litigation, e‑filing, or motion practice in live courts.
- Audio/video real‑time STT; we stick to generated/typed lines.

## Key Risks & Mitigations
- **Jurisdiction mismatch:** keep language generic; label as simulation; allow “terminology pack” later.
- **Over‑automation of rulings:** always emit concise rationale; expose objection grounds & exceptions; permit facilitator overrides.
- **PII leakage in exhibits:** default redaction pass; ban raw EXIF; signed URLs + short TTL.

## KPIs (first 90 days)
- **Cohort usefulness:** ≥ **90%** of law‑school users rate simulations “useful”.
- **Completion time:** median simulated trial < **25 min**.
- **Export reliability:** ≥ **99%** artifact delivery.
- **Engagement:** ≥ **80%** of trials use element coverage dashboard.
