import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import {
    CaseSchema,
    CreateCaseSchema,
    UpdateCaseSchema,
    PaginationQuerySchema,
} from '../schemas';

@Injectable()
export class CasesService {
    // TODO: Replace with actual database repository
    private cases: z.infer<typeof CaseSchema>[] = [];

    async create(createCaseDto: z.infer<typeof CreateCaseSchema>): Promise<z.infer<typeof CaseSchema>> {
        const newCase: z.infer<typeof CaseSchema> = {
            id: crypto.randomUUID(),
            org_id: 'demo-org-id', // TODO: Get from auth context
            title: createCaseDto.title,
            jurisdiction: createCaseDto.jurisdiction,
            case_type: createCaseDto.case_type,
            status: 'created',
            created_by: 'demo-user-id', // TODO: Get from auth context
            created_at: new Date().toISOString(),
        };

        this.cases.push(newCase);
        return newCase;
    }

    async findAll(query: z.infer<typeof PaginationQuerySchema>) {
        const { page, limit } = query;
        const start = (page - 1) * limit;
        const end = start + limit;
        const data = this.cases.slice(start, end);
        const total = this.cases.length;

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                has_more: end < total,
                next_cursor: end < total ? end.toString() : undefined,
            },
        };
    }

    async findOne(id: string): Promise<z.infer<typeof CaseSchema>> {
        const foundCase = this.cases.find(c => c.id === id);
        if (!foundCase) {
            throw new NotFoundException(`Case with ID ${id} not found`);
        }
        return foundCase;
    }

    async update(id: string, updateCaseDto: z.infer<typeof UpdateCaseSchema>): Promise<z.infer<typeof CaseSchema>> {
        const caseIndex = this.cases.findIndex(c => c.id === id);
        if (caseIndex === -1) {
            throw new NotFoundException(`Case with ID ${id} not found`);
        }

        this.cases[caseIndex] = {
            ...this.cases[caseIndex],
            ...updateCaseDto,
        };

        return this.cases[caseIndex];
    }

    async remove(id: string): Promise<void> {
        const caseIndex = this.cases.findIndex(c => c.id === id);
        if (caseIndex === -1) {
            throw new NotFoundException(`Case with ID ${id} not found`);
        }

        this.cases.splice(caseIndex, 1);
    }

    async startTrial(id: string): Promise<z.infer<typeof CaseSchema>> {
        const foundCase = await this.findOne(id);

        if (foundCase.status !== 'pretrial') {
            throw new BadRequestException('Case must be in pretrial status to start trial');
        }

        return this.update(id, { status: 'trial' });
    }

    async completeIntake(id: string): Promise<z.infer<typeof CaseSchema>> {
        const foundCase = await this.findOne(id);

        if (foundCase.status !== 'created') {
            throw new BadRequestException('Case must be in created status to complete intake');
        }

        return this.update(id, { status: 'pretrial' });
    }
}
