import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

export const getDb = () => 
{
  if (!process.env.DATABASE_URL) {
    throw new Error('missing DATABASE_URL');
  }
  return drizzle(mysql.createPool(process.env.DATABASE_URL as string), {
    logger: true,
  });
}
