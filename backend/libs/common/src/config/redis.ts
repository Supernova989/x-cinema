import * as z from 'zod';
import { registerAs } from '@nestjs/config';

export const redisSchema = z.object({
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().positive(),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().nonnegative().default(0),
});

export const REDIS_DB_INDEXES = {
  BULL_MQ: 0,
  SESSIONS: 1,
  CACHE: 2,
} as const;

export type RedisEnv = z.infer<typeof redisSchema>;
export default registerAs('redis', () => redisSchema.parse(process.env));
