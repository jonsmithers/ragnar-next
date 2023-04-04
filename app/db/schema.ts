import {
  decimal,
  int,
  mysqlTable,
  serial,
  time,
  varchar,
} from 'drizzle-orm/mysql-core';

export const teams = mysqlTable('teams', {
  id: serial('id').primaryKey().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  startTime: time('start_time').notNull(),
  trailRunMultiplierLow: decimal('trail_run_multiplier_low').notNull(),
  trailRunMultiplierHigh: decimal('trail_run_multiplier_high').notNull(),
});

export const runners = mysqlTable('runners', {
  id: serial('id').primaryKey().notNull(),
  order: int('order').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  pace10k: time('pace_10k').notNull(),
});

export const loops = mysqlTable('loops', {
  id: serial('id').primaryKey().notNull(),
  order: int('order').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  lengthMiles: decimal('length_miles').notNull(),
});

export const actualFinishTimes = mysqlTable('actual_finish_times', {
  id: serial('id').primaryKey().notNull(),
  runnerId: serial('id').notNull(),
  loopId: serial('id').notNull(),
});
