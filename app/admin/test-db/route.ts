import { getDb } from '@/app/db/connection';
import { teams, users } from '@/app/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request) {
  const db = getDb();
  const allUsers = await db.select().from(users);
  const allTeams = await db.select().from(teams);
  return new Response(JSON.stringify({ allUsers, allTeams }));
}
