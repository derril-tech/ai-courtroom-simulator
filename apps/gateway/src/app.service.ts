import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Courtroom Simulator Gateway is running!';
    }
}
