import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from '@app/common/config/redis';
import dbConfig from '@app/common/config/db';
import jwtConfig from '@app/common/config/jwt';
import { DatabaseModule } from '@app/common/database/database.module';
import { RedisModule } from '@app/common/redis/redis.module';
import { BullMqModule } from '@app/common/bullmq/bull-mq.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './api/api.module';
import { RepositoriesModule } from '@app/common/repositories/repositories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig, dbConfig, jwtConfig],
    }),
    DatabaseModule,
    RedisModule,
    BullMqModule,
    RepositoriesModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [
    //
    AppService,
  ],
})
export class AppModule {}
