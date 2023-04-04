import {
  decimal,
  int,
  mysqlTable,
  serial,
  time,
  varchar,
} from 'drizzle-orm/mysql-core';

export const teams = mysqlTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }),
  startTime: time('start_time'),
  trailRunMultiplierLow: decimal('trail_run_multiplier_low'),
  trailRunMultiplierHigh: decimal('trail_run_multiplier_high'),
});

export const runners = mysqlTable('runners', {
  id: serial('id').primaryKey(),
  order: int('order'),
  name: varchar('name', { length: 256 }),
  pace10k: time('pace_10k'),
});

export const loops = mysqlTable('loops', {
  id: serial('id').primaryKey(),
  order: int('order'),
  name: varchar('name', { length: 256 }),
  lengthMiles: decimal('length_miles'),
});

export const actualFinishTimes = mysqlTable('actual_finish_times', {
  id: serial('id').primaryKey(),
  runnerId: serial('id'),
  loopId: serial('id'),
});
