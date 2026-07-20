import * as z from 'zod';
import { registerAs } from '@nestjs/config';

export const databaseSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
});

export type DatabaseEnv = z.infer<typeof databaseSchema>;
export default registerAs('db', () => databaseSchema.parse(process.env));
