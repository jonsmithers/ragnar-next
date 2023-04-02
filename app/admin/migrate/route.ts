import { getDb } from '@/app/db/connection';
import { migrate } from 'drizzle-orm/mysql2/migrator';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request) {
  try {
    await migrate(getDb(), { migrationsFolder: './migrations' });
    return new Response('migrated');
  } catch (e) {
    console.error(e);
    return new Response(String(e));
  }
}
