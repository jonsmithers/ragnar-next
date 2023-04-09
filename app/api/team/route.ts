import { TeamCreateResponses } from '@/app/TeamNameInput';
import { converters, defaultTime } from '@/app/date-utils';
import { getDb } from '@/app/db/connection';
import { loops, runners, teams } from '@/app/db/schema';
import { InferModel } from 'drizzle-orm';
import { eq, inArray } from 'drizzle-orm/expressions';
import { Duration } from 'luxon';
import z from 'zod';

/** get or create team */
export async function PATCH(request: Request) {
  const parseResult = z
    .object({ name: z.string() })
    .safeParse(await request.json());
  if (!parseResult.success) {
    return new Response('fail', {
      status: 500,
      statusText: 'invalid input',
    });
  }
  const { name } = parseResult.data;
  const db = getDb();
  const matches = await db
    .select()
    .from(teams)
    .where(eq(teams.name, name))
    .limit(1);
  if (!matches.length) {
    const [{ insertId }] = await db.insert(teams).values([
      {
        name: name,
        startTime: defaultTime().toJSDate(),
        trailRunMultiplierLow: 1.1,
        trailRunMultiplierHigh: 1.5,
      },
    ]);
    const [team] = await db.select().from(teams).where(eq(teams.id, insertId));
    const runnerInserts = await Promise.all(
      new Array(8)
        .fill(null)
        .map((_, index) => ({
          order: index,
          name: `Runner ${index + 1}`,
          teamId: team.id,
          ...defaultRunner,
        }))
        .map((newRunner) => db.insert(runners).values(newRunner))
    );

    const runnerIds = runnerInserts.map(([{ insertId }]) => insertId);
    const insertedRunners = await db
      .select()
      .from(runners)
      .where(inArray(runners.id, runnerIds));

    type NewLoop = InferModel<typeof loops, 'insert'>;
    const newLoops: NewLoop[] = [
      {
        name: 'Green',
        color: 'green' as const,
        lengthMiles: 4.4,
      },
      {
        name: 'Yellow',
        color: 'yellow' as const,
        lengthMiles: 4.4,
      },
      {
        name: 'Red',
        color: 'red' as const,
        lengthMiles: 7.8,
      },
    ].map((loop, index) => ({ ...loop, teamId: team.id, order: index }));

    const loopInserts = await Promise.all(
      newLoops.map((newLoop) => db.insert(loops).values(newLoop))
    );
    const insertedLoopIds = loopInserts.map(([{ insertId }]) => insertId);
    const insertedLoops = await db
      .select()
      .from(loops)
      .where(inArray(loops.id, insertedLoopIds));
    console.info({ insertedLoops, insertedRunners });

    const responseText: TeamCreateResponses = 'created new team';
    return new Response(responseText);
  }

  const responseText: TeamCreateResponses = 'already exists';
  return new Response(responseText);
}

const defaultRunner = {
  pace10k: converters.duration.toString(
    Duration.fromObject({ minutes: 9, seconds: 30 })
  ),
};
