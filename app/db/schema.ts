import {
  bigint,
  datetime,
  double,
  mysqlTable,
  varchar,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';

const idField = (name: string) => bigint(name, { mode: 'number' }).notNull();

export const teams = mysqlTable('teams', {
  id: idField('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  startTime: datetime('start_time').notNull(),
  trailRunMultiplierLow: double('trail_run_multiplier_low').notNull(),
  trailRunMultiplierHigh: double('trail_run_multiplier_high').notNull(),
});

export const runners = mysqlTable('runners', {
  id: idField('id').autoincrement().primaryKey(),
  teamId: idField('team_id'), //.references(() => teams.id),
  order: bigint('order', { mode: 'number' }).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  /** mm:ss per mile */
  pace10k: varchar('pace_10k', { length: 50 }).notNull(),
});

export const loops = mysqlTable('loops', {
  id: idField('id').autoincrement().primaryKey(),
  teamId: idField('team_id'), //.references(() => teams.id),
  order: bigint('order', { mode: 'number' }).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  color: mysqlEnum('color', ['red', 'green', 'yellow']).notNull(),
  lengthMiles: double('length_miles').notNull(),
});

export const actualFinishTimes = mysqlTable('actual_finish_times', {
  id: idField('id').autoincrement().primaryKey(),
  runnerId: idField('runner_id'), //.references(() => runners.id),
  loopId: idField('loop_id'), //.references(() => loops.id),
  finishTime: datetime('finish_time_hhmm').notNull(),
});
