import { getDb } from '@/app/db/connection';
import { migrate } from 'drizzle-orm/mysql2/migrator';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    await migrate(getDb(), { migrationsFolder: './migrations' });
    return new Response('migration successful');
  } catch (e) {
    console.error(e);
    return new Response(String(e));
  }
}
