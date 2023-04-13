import { getDb } from '@/app/db/connection';
import { actualFinishTimes, loops, runners, teams } from '@/app/db/schema';
import { FinishTimeZod } from '@/server-utils/FinishTimeZod';
import { eq, inArray } from 'drizzle-orm/expressions';
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

  return new Response(
    JSON.stringify(
      finishTimes.map(({ actual_finish_times }) => actual_finish_times)
    )
  );
}

export async function POST(request: Request, { params }: { params: unknown }) {
  const { name } = z.object({ name: z.string() }).parse(params);
  const newFinishTimes = z.array(FinishTimeZod).parse(await request.json());
  const db = getDb();

  await db.transaction(async (tx) => {
    const teamRunners = await tx
      .select()
      .from(runners)
      .innerJoin(teams, eq(teams.id, runners.teamId))
      .where(eq(teams.name, name));
    const teamLoops = await tx
      .select()
      .from(loops)
      .innerJoin(teams, eq(teams.id, loops.teamId))
      .where(eq(teams.name, name));
    const runnerIds = new Set(teamRunners.map((t) => t.runners.id));
    const loopIds = new Set(teamLoops.map((t) => t.loops.id));
    const oldTimes = await tx
      .select()
      .from(actualFinishTimes)
      .innerJoin(runners, eq(actualFinishTimes.runnerId, runners.id))
      .innerJoin(teams, eq(runners.teamId, teams.id))
      .innerJoin(loops, eq(loops.id, actualFinishTimes.loopId))
      .where(eq(teams.name, name));
    if (oldTimes.length) {
      await tx.delete(actualFinishTimes).where(
        inArray(
          actualFinishTimes.id,
          oldTimes.map((t) => t.actual_finish_times.id)
        )
      );
    }
    if (
      newFinishTimes.some(
        (t) => !runnerIds.has(t.runnerId) || !loopIds.has(t.loopId)
      )
    ) {
      throw new Error('illegal id');
    }
    if (newFinishTimes.length) {
      await tx.insert(actualFinishTimes).values(newFinishTimes);
    }
  });

  return new Response();
}
