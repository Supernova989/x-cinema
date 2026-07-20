import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from '@app/common/config/redis';
import workersConfig from '@app/common/config/workers';
import { WorkerService } from './worker.service';
import { EmailWorkerModule } from './email/worker/email-worker.module';
import { EmailModule } from './email/email.module';
import { PdfWorkerModule } from './pdf/worker/pdf-worker.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, workersConfig],
    }),
    // workers
    EmailWorkerModule,
    PdfWorkerModule,
  ],
  providers: [WorkerService],
})
export class WorkerModule {}
