import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

@Injectable()
export class PdfService {
  async process(job: Job): Promise<void> {
    console.log('PDF - Processing Job: ', job.id, ' with data: ', job.data);
    await new Promise(() => {});
    // return { success: true };
  }
}
