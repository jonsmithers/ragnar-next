import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getDb = () => drizzle(new Pool({
  connectionString: process.env.DATABASE_URL,
}))
