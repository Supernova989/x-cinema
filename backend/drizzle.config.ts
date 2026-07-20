import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

import { databaseSchema } from '@app/common/config/db';

const db = databaseSchema.parse(process.env);

export default defineConfig({
  dialect: 'postgresql',
  schema: './libs/common/src/database/schema/*.schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: db.DB_HOST,
    port: db.DB_PORT,
    user: db.DB_USER,
    password: db.DB_PASSWORD,
    database: db.DB_NAME,
  },
});
