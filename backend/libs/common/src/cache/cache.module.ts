import { Module } from '@nestjs/common';
import { UserCacheService } from '@app/common/cache/user-cache.service';

@Module({
  imports: [],
  providers: [UserCacheService],
  exports: [UserCacheService],
})
export class CacheModule {}
