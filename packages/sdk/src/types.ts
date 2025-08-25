// Created automatically by Cursor AI (2024-01-01)

export interface Case {
    id: string;
    title: string;
    jurisdiction?: string;
    caseType: 'criminal' | 'civil';
    status: 'created' | 'pretrial' | 'trial' | 'deliberating' | 'verdict' | 'exported' | 'archived';
    createdBy: string;
    createdAt: string;
}

export interface Count {
    id: string;
    caseId: string;
    label: string;
    description: string;
    burden: 'BRD' | 'preponderance';
    elements: Record<string, any>;
    defenses: Record<string, any>;
}

export interface Witness {
    id: string;
    caseId: string;
    name: string;
    role: string;
    credibilityNotes?: string;
}

export interface Exhibit {
    id: string;
    caseId: string;
    code: string;
    title: string;
    s3Key: string;
    mime: string;
    foundation: Record<string, any>;
    admitted: boolean;
    objections: Record<string, any>;
}

export interface Turn {
    id: string;
    caseId: string;
    phase: 'opening' | 'direct' | 'cross' | 'redirect' | 'recross' | 'closing' | 'sidebar';
    speaker: 'judge' | 'prosecutor' | 'defense' | 'witness' | 'jury';
    witnessId?: string;
    countId?: string;
    text: string;
    timestampMs: number;
    meta: Record<string, any>;
}

export interface Objection {
    id: string;
    caseId: string;
    turnId: string;
    ground: string;
    bySide: string;
    ruling: 'sustain' | 'overrule';
    reason: string;
    createdAt: string;
}

export interface Verdict {
    id: string;
    caseId: string;
    result: Record<string, 'guilty' | 'not_guilty' | 'liable' | 'not_liable'>;
    rationale: string;
    poll: Record<string, any>;
    createdAt: string;
}
