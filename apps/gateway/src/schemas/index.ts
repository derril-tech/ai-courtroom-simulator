import { z } from 'zod';

// Base schemas
export const UUIDSchema = z.string().uuid();
export const EmailSchema = z.string().email();
export const TimestampSchema = z.string().datetime();

// User schemas
export const UserSchema = z.object({
    id: UUIDSchema,
    org_id: UUIDSchema,
    email: EmailSchema,
    name: z.string().optional(),
    role: z.string().default('user'),
    tz: z.string().default('UTC'),
    created_at: TimestampSchema,
});

export const CreateUserSchema = z.object({
    email: EmailSchema,
    name: z.string().optional(),
    role: z.string().optional(),
    tz: z.string().optional(),
});

// Case schemas
export const CaseTypeSchema = z.enum(['criminal', 'civil']);
export const CaseStatusSchema = z.enum(['created', 'pretrial', 'trial', 'deliberating', 'verdict', 'exported', 'archived']);

export const CaseSchema = z.object({
    id: UUIDSchema,
    org_id: UUIDSchema,
    title: z.string().min(1),
    jurisdiction: z.string().optional(),
    case_type: CaseTypeSchema,
    status: CaseStatusSchema.default('created'),
    created_by: UUIDSchema.optional(),
    created_at: TimestampSchema,
});

export const CreateCaseSchema = z.object({
    title: z.string().min(1),
    jurisdiction: z.string().optional(),
    case_type: CaseTypeSchema,
});

export const UpdateCaseSchema = z.object({
    title: z.string().min(1).optional(),
    jurisdiction: z.string().optional(),
    status: CaseStatusSchema.optional(),
});

// Count schemas
export const BurdenSchema = z.enum(['BRD', 'preponderance']);

export const CountSchema = z.object({
    id: UUIDSchema,
    case_id: UUIDSchema,
    label: z.string().min(1),
    description: z.string().optional(),
    burden: BurdenSchema,
    elements: z.record(z.any()).default({}),
    defenses: z.record(z.any()).default({}),
});

export const CreateCountSchema = z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    burden: BurdenSchema,
    elements: z.record(z.any()).optional(),
    defenses: z.record(z.any()).optional(),
});

// Witness schemas
export const WitnessSchema = z.object({
    id: UUIDSchema,
    case_id: UUIDSchema,
    name: z.string().min(1),
    role: z.string().optional(),
    credibility_notes: z.string().optional(),
});

export const CreateWitnessSchema = z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    credibility_notes: z.string().optional(),
});

// Exhibit schemas
export const ExhibitSchema = z.object({
    id: UUIDSchema,
    case_id: UUIDSchema,
    code: z.string().min(1),
    title: z.string().min(1),
    s3_key: z.string(),
    mime: z.string(),
    foundation: z.record(z.any()).default({}),
    admitted: z.boolean().default(false),
    objections: z.record(z.any()).default({}),
});

export const CreateExhibitSchema = z.object({
    code: z.string().min(1),
    title: z.string().min(1),
    mime: z.string(),
});

// Turn schemas
export const TurnPhaseSchema = z.enum(['opening', 'direct', 'cross', 'redirect', 'recross', 'closing', 'sidebar']);
export const SpeakerSchema = z.enum(['judge', 'prosecutor', 'defense', 'witness', 'jury']);

export const TurnSchema = z.object({
    id: UUIDSchema,
    case_id: UUIDSchema,
    phase: TurnPhaseSchema,
    speaker: SpeakerSchema,
    witness_id: UUIDSchema.optional(),
    count_id: UUIDSchema.optional(),
    text: z.string().min(1),
    timestamp_ms: z.number(),
    meta: z.record(z.any()).default({}),
});

export const CreateTurnSchema = z.object({
    phase: TurnPhaseSchema,
    speaker: SpeakerSchema,
    witness_id: UUIDSchema.optional(),
    count_id: UUIDSchema.optional(),
    text: z.string().min(1),
    meta: z.record(z.any()).optional(),
});

// Objection schemas
export const ObjectionRulingSchema = z.enum(['sustain', 'overrule']);

export const ObjectionSchema = z.object({
    id: UUIDSchema,
    case_id: UUIDSchema,
    turn_id: UUIDSchema,
    ground: z.string().min(1),
    by_side: z.string().min(1),
    ruling: ObjectionRulingSchema.optional(),
    reason: z.string().optional(),
    created_at: TimestampSchema,
});

export const CreateObjectionSchema = z.object({
    turn_id: UUIDSchema,
    ground: z.string().min(1),
    by_side: z.string().min(1),
});

export const UpdateObjectionSchema = z.object({
    ruling: ObjectionRulingSchema,
    reason: z.string().min(1),
});

// Motion schemas
export const MotionKindSchema = z.enum(['limine', 'suppress', 'summary_judgment', 'sever']);
export const MotionStatusSchema = z.enum(['pending', 'granted', 'denied', 'granted_in_part']);

export const MotionSchema = z.object({
    id: UUIDSchema,
    case_id: UUIDSchema,
    kind: MotionKindSchema,
    filed_by: z.string().min(1),
    arguments: z.string().min(1),
    status: MotionStatusSchema.default('pending'),
    ruling: z.string().optional(),
    reasoning: z.string().optional(),
    created_at: TimestampSchema,
});

export const CreateMotionSchema = z.object({
    kind: MotionKindSchema,
    filed_by: z.string().min(1),
    arguments: z.string().min(1),
});

export const UpdateMotionSchema = z.object({
    status: MotionStatusSchema,
    ruling: z.string().optional(),
    reasoning: z.string().min(1),
});

// Verdict schemas
export const VerdictResultSchema = z.enum(['guilty', 'not_guilty', 'liable', 'not_liable']);

export const VerdictSchema = z.object({
    id: UUIDSchema,
    case_id: UUIDSchema,
    result: z.record(VerdictResultSchema),
    rationale: z.string().optional(),
    poll: z.record(z.any()).default({}),
    created_at: TimestampSchema,
});

export const CreateVerdictSchema = z.object({
    result: z.record(VerdictResultSchema),
    rationale: z.string().optional(),
    poll: z.record(z.any()).optional(),
});

// Pagination schemas
export const PaginationQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    cursor: z.string().optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
    z.object({
        data: z.array(schema),
        pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            has_more: z.boolean(),
            next_cursor: z.string().optional(),
        }),
    });

// Error schemas
export const ProblemDetailSchema = z.object({
    type: z.string().url(),
    title: z.string(),
    status: z.number(),
    detail: z.string().optional(),
    instance: z.string().optional(),
    errors: z.array(z.object({
        field: z.string(),
        message: z.string(),
    })).optional(),
});

// Response schemas
export const HealthResponseSchema = z.object({
    status: z.literal('healthy'),
    service: z.string(),
    timestamp: z.string(),
});

export const SuccessResponseSchema = z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data: z.any().optional(),
});
