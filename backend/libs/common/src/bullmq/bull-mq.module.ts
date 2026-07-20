import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppWorkers } from '@app/common/types/app-workers';
import redisConfig from '@app/common/config/redis';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [redisConfig.KEY],
      useFactory: (config: ConfigType<typeof redisConfig>) => {
        return {
          connection: {
            host: config.REDIS_HOST,
            port: config.REDIS_PORT,
            username: config.REDIS_USERNAME,
            password: config.REDIS_PASSWORD,
            // db: REDIS_DB_INDEXES.BULL_MQ,
          },
        };
      },
    }),
    BullModule.registerQueue(
      {
        name: AppWorkers.EMAILS,
      },
      { name: AppWorkers.PDF },
    ),
  ],
  exports: [BullModule],
})
export class BullMqModule {}
