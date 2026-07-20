import * as z from 'zod';
import { registerAs } from '@nestjs/config';

export const jwtSchema = z.object({
  JWT_SECRET: z.string(),
  JWT_ISSUER: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_EXPIRES_IN_MINUTES: z.coerce.number().int().positive(),
  REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(7),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
});

export default registerAs('jwt', () => jwtSchema.parse(process.env));
