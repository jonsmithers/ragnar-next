import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

export const getDb = () =>
  drizzle(mysql.createPool(process.env.DATABASE_URL as string), {
    logger: true,
  });
