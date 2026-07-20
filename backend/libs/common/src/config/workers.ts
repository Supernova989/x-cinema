import * as z from 'zod';
import { AppWorkers } from '@app/common/types/app-workers';
import { registerAs } from '@nestjs/config';
import { redisSchema } from '@app/common/config/redis';

const appWorkerValues = Object.values(AppWorkers);

export const workersSchema = z.object({
  ENABLED_WORKERS: z
    .string()
    .optional()
    .default([...appWorkerValues].join(','))
    .transform((value) =>
      value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v)
        .filter(Boolean),
    )
    .pipe(z.array(z.enum(AppWorkers))),
});

export type WorkersEnv = z.infer<typeof workersSchema>;
export default registerAs('workers', () => workersSchema.parse(process.env));
