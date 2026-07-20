import { boolean, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['customer', 'admin']);
export type UserRole = (typeof userRoleEnum.enumValues)[number];

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  active: boolean('active').default(false).notNull(),
  role: userRoleEnum('role').default('customer').notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  deletedAt: timestamp('deleted_at', {
    withTimezone: true,
  }),
});

export type User = InferSelectModel<typeof users>;
