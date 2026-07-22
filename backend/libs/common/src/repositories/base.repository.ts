import {
  asc,
  count,
  desc,
  eq,
  type InferInsertModel,
  type InferSelectModel,
  type SQL,
} from 'drizzle-orm';
import type { AnyPgColumn, AnyPgTable, PgDatabase } from 'drizzle-orm/pg-core';

type TableColumn<TTable extends AnyPgTable> = Extract<
  TTable['_']['columns'][keyof TTable['_']['columns']],
  AnyPgColumn
>;

export type SortDirection = 'asc' | 'desc';

export interface PaginateOptions<TColumn extends AnyPgColumn> {
  page?: number;
  pageSize?: number;
  orderBy?: TColumn;
  orderDirection?: SortDirection;
  /** Build this with Drizzle, e.g. `eq(users.active, true)`. */
  where?: SQL;
}

export interface Page<TEntity> {
  data: TEntity[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Generic Drizzle/PostgreSQL repository.
 *
 * @example
 * ```ts
 * export class UserRepository extends BaseRepository<typeof users, string> {
 *   protected readonly table = users;
 *   protected readonly idColumn = users.id;
 * }
 * ```
 */
export abstract class BaseRepository<
  TTable extends AnyPgTable,
  TId,
  TDatabase extends PgDatabase<any, any, any> = PgDatabase<any, any, any>,
> {
  protected abstract readonly table: TTable;
  protected abstract readonly idColumn: TableColumn<TTable>;

  /**
   * Works with Drizzle's node-postgres, postgres.js, and Neon PostgreSQL drivers.
   * */
  constructor(protected readonly db: TDatabase) {}

  async create(values: InferInsertModel<TTable>) {
    const [entity] = await this.db.insert(this.table).values(values).returning();

    if (!entity) {
      throw new Error(`Could not create row in ${this.table['_'].name}`);
    }

    return entity as InferSelectModel<TTable>;
  }

  async get(id: TId): Promise<InferSelectModel<TTable> | null> {
    const [entity] = await this.db
      .select()
      .from(this.queryTable)
      .where(eq(this.idColumn, id))
      .limit(1);

    return (entity as InferSelectModel<TTable> | undefined) ?? null;
  }

  async paginate(
    options: PaginateOptions<TableColumn<TTable>> = {},
  ): Promise<Page<InferSelectModel<TTable>>> {
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Math.floor(options.pageSize ?? 20)));
    const orderBy = options.orderBy ?? this.idColumn;
    const order = options.orderDirection === 'asc' ? asc(orderBy) : desc(orderBy);
    const offset = (page - 1) * pageSize;

    const [data, totalResult] = await Promise.all([
      this.db
        .select()
        .from(this.queryTable)
        .where(options.where)
        .orderBy(order)
        .limit(pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(this.queryTable).where(options.where),
    ]);
    const total = Number(totalResult[0]?.total ?? 0);

    return {
      data: data as InferSelectModel<TTable>[],
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Drizzle's `from()` conditional type cannot be evaluated for a generic
   * table parameter. Widening only here keeps repository method types exact.
   */
  private get queryTable(): AnyPgTable {
    return this.table;
  }
}
