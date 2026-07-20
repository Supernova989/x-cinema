import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '@app/common/database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AppWorkers } from '@app/common/types/app-workers';
import { users } from '@app/common/database/schema';
import { hash, verify } from '@node-rs/argon2';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly database: DatabaseService,
    @InjectQueue(AppWorkers.EMAILS)
    private readonly emailQueue: Queue,
  ) {}

  async onModuleInit() {
    // for (let i = 0; i < 10; i++) {
    //   this.emailQueue.add(
    //     'test1',
    //     { usr: 'abc' + i },
    //     {
    //       attempts: 5,
    //
    //       backoff: {
    //         type: 'exponential',
    //
    //         delay: 5000,
    //       },
    //     },
    //   );
    // }
    // try {
    //   const res = await this.database.db.insert(cache).values({
    //     email: 'john@example.com',
    //     firstName: 'John',
    //     lastName: 'Doe',
    //     passwordHash: await hash('test1234'),
    //   });
    //
    //   console.log('Result: ', res);
    // } catch (error) {
    //   console.log('Error: ', error);
    // }
  }
}
