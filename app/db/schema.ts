import { mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }),
});

export const teams = mysqlTable('teams', {
  name: varchar('name', { length: 256 }),
});
