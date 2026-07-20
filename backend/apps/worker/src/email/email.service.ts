import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

@Injectable()
export class EmailService {
  async process(job: Job): Promise<void> {
    console.log('EMAIL - Processing Job: ', job.id, ' with data: ', job.data, job.asJSON());
    // await new Promise((res) => res(10));
    // return { success: true };
  }
}
