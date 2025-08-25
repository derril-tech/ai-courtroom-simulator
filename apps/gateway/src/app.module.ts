import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CasesModule } from './cases/cases.module';
import { ApiV1Module } from './app/api/v1/api';
import { IdempotencyMiddleware } from './common/idempotency.middleware';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),
        CasesModule,
        ApiV1Module,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(IdempotencyMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
