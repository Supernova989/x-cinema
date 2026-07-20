import { Module } from '@nestjs/common';
import { EmailWorkerService } from './email-worker.service';
import { EmailModule } from '../email.module';

@Module({
  imports: [EmailModule],
  providers: [EmailWorkerService],
})
export class EmailWorkerModule {}
