import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import dbConfig from '@app/common/config/db';
import postgres, { Sql } from 'postgres';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly client: Sql;
  readonly db: PostgresJsDatabase<typeof schema>;

  constructor(@Inject(dbConfig.KEY) private readonly config: ConfigType<typeof dbConfig>) {
    this.client = postgres({
      host: this.config.DB_HOST,
      database: this.config.DB_NAME,
      user: this.config.DB_USER,
      password: this.config.DB_PASSWORD,
    });

    this.db = drizzle(this.client, { schema });
  }

  /**
   * Performs necessary cleanup tasks when the module is destroyed.
   * Terminates the client connection to free up resources.
   */
  async onModuleDestroy() {
    await this.client.end();
  }
}
