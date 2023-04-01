import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { pool } from './connection';
import { drizzle } from 'drizzle-orm/node-postgres';

console.log('migrating');
migrate(drizzle(pool), { migrationsFolder: './drizzle' });
