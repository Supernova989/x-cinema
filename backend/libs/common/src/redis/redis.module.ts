import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from '@app/common/config/redis';
import { RedisService } from './redis.service';
import { redisClientProvider } from '@app/common/redis/client-provider';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [redisClientProvider, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
