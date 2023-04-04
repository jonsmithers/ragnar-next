import { getDb } from '@/app/db/connection';
import { teams } from '@/app/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request) {
  const db = getDb();
  const allTeams = await db.select().from(teams);
  return new Response(JSON.stringify({ allTeams }));
}
