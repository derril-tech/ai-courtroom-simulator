import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { CasesModule } from '../../cases/cases.module';

@Module({
    imports: [
        RouterModule.register([
            {
                path: 'api/v1',
                children: [
                    {
                        path: 'cases',
                        module: CasesModule,
                    },
                ],
            },
        ]),
    ],
})
export class ApiV1Module { }
