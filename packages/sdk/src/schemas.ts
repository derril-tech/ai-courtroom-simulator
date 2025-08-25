// Created automatically by Cursor AI (2024-01-01)

import { z } from 'zod';

export const CaseSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    jurisdiction: z.string().optional(),
    caseType: z.enum(['criminal', 'civil']),
    status: z.enum(['created', 'pretrial', 'trial', 'deliberating', 'verdict', 'exported', 'archived']),
    createdBy: z.string().uuid(),
    createdAt: z.string().datetime(),
});

export const CountSchema = z.object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    label: z.string().min(1),
    description: z.string(),
    burden: z.enum(['BRD', 'preponderance']),
    elements: z.record(z.any()),
    defenses: z.record(z.any()),
});

export const WitnessSchema = z.object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    name: z.string().min(1),
    role: z.string(),
    credibilityNotes: z.string().optional(),
});

export const ExhibitSchema = z.object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    code: z.string().min(1),
    title: z.string(),
    s3Key: z.string(),
    mime: z.string(),
    foundation: z.record(z.any()),
    admitted: z.boolean(),
    objections: z.record(z.any()),
});

export const TurnSchema = z.object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    phase: z.enum(['opening', 'direct', 'cross', 'redirect', 'recross', 'closing', 'sidebar']),
    speaker: z.enum(['judge', 'prosecutor', 'defense', 'witness', 'jury']),
    witnessId: z.string().uuid().optional(),
    countId: z.string().uuid().optional(),
    text: z.string(),
    timestampMs: z.number(),
    meta: z.record(z.any()),
});

export const ObjectionSchema = z.object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    turnId: z.string().uuid(),
    ground: z.string(),
    bySide: z.string(),
    ruling: z.enum(['sustain', 'overrule']),
    reason: z.string(),
    createdAt: z.string().datetime(),
});

export const VerdictSchema = z.object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    result: z.record(z.enum(['guilty', 'not_guilty', 'liable', 'not_liable'])),
    rationale: z.string(),
    poll: z.record(z.any()),
    createdAt: z.string().datetime(),
});
