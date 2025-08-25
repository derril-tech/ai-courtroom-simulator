import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Response } from 'express';
import { ZodError } from 'zod';

export interface ProblemDetail {
    type: string;
    title: string;
    status: number;
    detail?: string;
    instance?: string;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

@Injectable()
export class ProblemJsonInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => data),
            catchError(error => {
                const response = context.switchToHttp().getResponse<Response>();
                const request = context.switchToHttp().getRequest();

                let problemDetail: ProblemDetail;

                if (error instanceof ZodError) {
                    problemDetail = {
                        type: 'https://courtroom-simulator.com/errors/validation',
                        title: 'Validation Error',
                        status: HttpStatus.BAD_REQUEST,
                        detail: 'The request data failed validation',
                        instance: request.url,
                        errors: error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    };
                } else if (error instanceof HttpException) {
                    problemDetail = {
                        type: 'https://courtroom-simulator.com/errors/http',
                        title: error.message || 'HTTP Error',
                        status: error.getStatus(),
                        detail: error.getResponse() as string,
                        instance: request.url,
                    };
                } else {
                    problemDetail = {
                        type: 'https://courtroom-simulator.com/errors/internal',
                        title: 'Internal Server Error',
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        detail: process.env.NODE_ENV === 'production'
                            ? 'An unexpected error occurred'
                            : error.message,
                        instance: request.url,
                    };
                }

                response.setHeader('Content-Type', 'application/problem+json');
                response.status(problemDetail.status);

                return throwError(() => new HttpException(problemDetail, problemDetail.status));
            }),
        );
    }
}
