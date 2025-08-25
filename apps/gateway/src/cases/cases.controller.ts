import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ZodValidationPipe } from 'zod-validation-pipe';
import { z } from 'zod';
import { CasesService } from './cases.service';
import { RbacGuard, Roles, WorkspaceRole } from '../common/rbac.guard';
import { ProblemJsonInterceptor } from '../common/problem-json.interceptor';
import {
    CaseSchema,
    CreateCaseSchema,
    UpdateCaseSchema,
    PaginationQuerySchema,
    PaginatedResponseSchema,
    SuccessResponseSchema,
} from '../schemas';

@ApiTags('Cases')
@Controller('cases')
@UseGuards(RbacGuard)
@UseInterceptors(ProblemJsonInterceptor)
export class CasesController {
    constructor(private readonly casesService: CasesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new case' })
    @ApiResponse({ status: 201, description: 'Case created successfully', schema: CaseSchema })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiBearerAuth()
    @Roles(WorkspaceRole.FACILITATOR, WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
    @HttpCode(HttpStatus.CREATED)
    async createCase(
        @Body(new ZodValidationPipe(CreateCaseSchema)) createCaseDto: z.infer<typeof CreateCaseSchema>,
    ) {
        return this.casesService.create(createCaseDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all cases' })
    @ApiResponse({
        status: 200,
        description: 'Cases retrieved successfully',
        schema: PaginatedResponseSchema(CaseSchema)
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth()
    @Roles(WorkspaceRole.OBSERVER, WorkspaceRole.PARTICIPANT, WorkspaceRole.FACILITATOR, WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
    async getCases(
        @Query(new ZodValidationPipe(PaginationQuerySchema)) query: z.infer<typeof PaginationQuerySchema>,
    ) {
        return this.casesService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a case by ID' })
    @ApiResponse({ status: 200, description: 'Case retrieved successfully', schema: CaseSchema })
    @ApiResponse({ status: 404, description: 'Case not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth()
    @Roles(WorkspaceRole.OBSERVER, WorkspaceRole.PARTICIPANT, WorkspaceRole.FACILITATOR, WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
    async getCase(
        @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    ) {
        return this.casesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a case' })
    @ApiResponse({ status: 200, description: 'Case updated successfully', schema: CaseSchema })
    @ApiResponse({ status: 404, description: 'Case not found' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiBearerAuth()
    @Roles(WorkspaceRole.FACILITATOR, WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
    async updateCase(
        @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
        @Body(new ZodValidationPipe(UpdateCaseSchema)) updateCaseDto: z.infer<typeof UpdateCaseSchema>,
    ) {
        return this.casesService.update(id, updateCaseDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a case' })
    @ApiResponse({ status: 200, description: 'Case deleted successfully', schema: SuccessResponseSchema })
    @ApiResponse({ status: 404, description: 'Case not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiBearerAuth()
    @Roles(WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
    async deleteCase(
        @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    ) {
        await this.casesService.remove(id);
        return { success: true, message: 'Case deleted successfully' };
    }

    @Post(':id/start-trial')
    @ApiOperation({ summary: 'Start a trial for a case' })
    @ApiResponse({ status: 200, description: 'Trial started successfully', schema: CaseSchema })
    @ApiResponse({ status: 404, description: 'Case not found' })
    @ApiResponse({ status: 400, description: 'Cannot start trial' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiBearerAuth()
    @Roles(WorkspaceRole.FACILITATOR, WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
    async startTrial(
        @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    ) {
        return this.casesService.startTrial(id);
    }

    @Post(':id/complete-intake')
    @ApiOperation({ summary: 'Complete case intake and move to pretrial' })
    @ApiResponse({ status: 200, description: 'Intake completed successfully', schema: CaseSchema })
    @ApiResponse({ status: 404, description: 'Case not found' })
    @ApiResponse({ status: 400, description: 'Cannot complete intake' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiBearerAuth()
    @Roles(WorkspaceRole.FACILITATOR, WorkspaceRole.ADMIN, WorkspaceRole.OWNER)
    async completeIntake(
        @Param('id', new ZodValidationPipe(z.string().uuid())) id: string,
    ) {
        return this.casesService.completeIntake(id);
    }
}
