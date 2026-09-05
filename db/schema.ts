import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const siteContent = sqliteTable('site_content', {
  id: text('id').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
});
export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  city: text('city').notNull(),
  event: text('event').notNull(),
  date: text('date').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: text('created_at').notNull(),
});
export const rateLimits = sqliteTable('rate_limits', {
  id: text('id').primaryKey(),
  count: integer('count').notNull(),
  window: integer('window').notNull(),
});
export const studioAccounts = sqliteTable('studio_accounts', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at').notNull(),
});
export const studioSessions = sqliteTable(
  'studio_sessions',
  {
    tokenHash: text('token_hash').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => studioAccounts.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at').notNull(),
  },
  (t) => [index('idx_studio_sessions_expires_at').on(t.expiresAt)],
);
export const studioBootstrap = sqliteTable('studio_bootstrap', {
  id: text('id').primaryKey(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: integer('expires_at').notNull(),
});
