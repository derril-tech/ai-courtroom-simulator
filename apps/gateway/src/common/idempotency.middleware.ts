import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
    private redis: Redis;

    constructor() {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    async use(req: Request, res: Response, next: NextFunction) {
        const idempotencyKey = req.headers['idempotency-key'] as string;

        // Only apply to non-GET requests
        if (req.method === 'GET' || !idempotencyKey) {
            return next();
        }

        // Validate idempotency key format
        if (!/^[a-zA-Z0-9-_]{1,255}$/.test(idempotencyKey)) {
            throw new HttpException(
                'Invalid Idempotency-Key format',
                HttpStatus.BAD_REQUEST
            );
        }

        const cacheKey = `idempotency:${idempotencyKey}`;

        try {
            // Check if we've seen this key before
            const cachedResponse = await this.redis.get(cacheKey);

            if (cachedResponse) {
                const parsed = JSON.parse(cachedResponse);

                // Return cached response
                res.status(parsed.status).json(parsed.data);
                return;
            }

            // Store the request for idempotency
            await this.redis.setex(cacheKey, 86400, JSON.stringify({ pending: true })); // 24 hours TTL

            // Continue with the request
            next();
        } catch (error) {
            // If Redis is unavailable, continue without idempotency
            console.warn('Redis unavailable, skipping idempotency check:', error);
            next();
        }
    }

    async storeResponse(idempotencyKey: string, status: number, data: any) {
        const cacheKey = `idempotency:${idempotencyKey}`;
        await this.redis.setex(
            cacheKey,
            86400,
            JSON.stringify({ status, data })
        );
    }
}
