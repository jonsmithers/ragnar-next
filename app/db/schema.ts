import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

console.log('hi');

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name'),
});

export const teams = pgTable('teams', {
  name: varchar('name')
});

