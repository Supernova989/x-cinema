import { Injectable } from '@nestjs/common';
import { User, users } from '@app/common/database/schema';
import { RedisService } from '@app/common/redis/redis.service';
import { DatabaseService } from '@app/common/database/database.service';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserCacheService {
  private static readonly TTL = 60;

  constructor(
    private readonly redis: RedisService,
    private readonly database: DatabaseService,
  ) {}

  async getUserById(userId: string): Promise<User | null> {
    const key = this.getUserKey(userId);

    try {
      const cached = await this.redis.client.get(key);
      if (cached) {
        return JSON.parse(cached) as User;
      }
    } catch {
      /* empty */
    }

    const user = await this.database.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return null;
    }

    await this.redis.client.set(key, JSON.stringify(user), {
      expiration: {
        type: 'EX',
        value: UserCacheService.TTL,
      },
    });

    return user;
  }

  async invalidateUserById(userId: string) {
    await this.redis.client.del(this.getUserKey(userId));
  }

  private getUserKey(userId: string) {
    return `user:${userId}`;
  }
}
