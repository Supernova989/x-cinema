import { Provider } from '@nestjs/common';
import { createClient } from 'redis';

import redisConfig from '@app/common/config/redis';
import { ConfigType } from '@nestjs/config';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const redisClientProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [redisConfig.KEY],
  useFactory: async (config: ConfigType<typeof redisConfig>) => {
    const client = createClient({
      socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
      },
      username: config.REDIS_USERNAME,
      password: config.REDIS_PASSWORD,
    });

    await client.connect();

    return client;
  },
};
