import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import type { ConfigType } from '@nestjs/config';
import { AppWorkers } from '@app/common/types/app-workers';
import { EmailService } from '../email.service';
import redisConfig, { REDIS_DB_INDEXES } from '@app/common/config/redis';
import workersConfig from '@app/common/config/workers';

const APP_WORKER = AppWorkers.EMAILS;

/**
 * Intentionally does not use @Processor().
 *
 * Workers are created programmatically during application startup, so they can
 * be enabled or disabled via configuration. The @nestjs/bullmq @Processor()
 * decorator always registers a worker during bootstrap, which prevents
 * conditional activation.
 */
@Injectable()
export class EmailWorkerService implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker;

  constructor(
    private readonly emailService: EmailService,
    @Inject(redisConfig.KEY) private readonly redisCfg: ConfigType<typeof redisConfig>,
    @Inject(workersConfig.KEY) private readonly workersCfg: ConfigType<typeof workersConfig>,
  ) {}

  onModuleInit(): void {
    if (!this.workersCfg.ENABLED_WORKERS.includes(APP_WORKER)) {
      return;
    }
    this.worker = new Worker(
      APP_WORKER,
      async (job: Job) => {
        await this.emailService.process(job);
      },
      {
        connection: {
          host: this.redisCfg.REDIS_HOST,
          port: this.redisCfg.REDIS_PORT,
          username: this.redisCfg.REDIS_USERNAME,
          password: this.redisCfg.REDIS_PASSWORD,
          // db: REDIS_DB_INDEXES.BULL_MQ,
        },
        concurrency: 5,
      },
    );
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
