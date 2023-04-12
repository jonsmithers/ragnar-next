import { getDb } from '@/app/db/connection';
import { actualFinishTimes, runners, teams } from '@/app/db/schema';
import { eq } from 'drizzle-orm/expressions';
import z from 'zod';

/** get or create team */
export async function GET(_request: Request, { params }: { params: unknown }) {
  const { name } = z.object({ name: z.string() }).parse(params);
  const db = getDb();
  const finishTimes = await db
    .select()
    .from(actualFinishTimes)
    .innerJoin(runners, eq(actualFinishTimes.runnerId, runners.id))
    .innerJoin(teams, eq(runners.teamId, teams.id))
    .where(eq(teams.name, name));

  return new Response(JSON.stringify(finishTimes));
}
