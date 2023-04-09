import { getDb } from '@/app/db/connection';
import { loops, runners, teams } from '@/app/db/schema';
import { TeamData, TeamDataZod } from '@/server-utils/TeamDataZod';
import { eq } from 'drizzle-orm/expressions';
import { omit } from 'lodash';
import z from 'zod';

/** get or create team */
export async function GET(_request: Request, { params }: { params: unknown }) {
  const { name } = z.object({ name: z.string() }).parse(params);
  const db = getDb();
  const [team] = await db.select().from(teams).where(eq(teams.name, name));
  const [teamRunners, teamLoops] = await Promise.all([
    db.select().from(runners).where(eq(runners.teamId, team.id)),
    db.select().from(loops).where(eq(loops.teamId, team.id)),
  ]);

  const teamData: TeamData = {
    ...team,
    runners: teamRunners,
    loops: teamLoops,
  };

  return new Response(JSON.stringify(teamData));
}

export async function POST(request: Request, { params }: { params: unknown }) {
  const { name } = z.object({ name: z.string() }).parse(params);
  const db = getDb();
  const {
    runners: runnerList,
    loops: loopList,
    ...team
  } = TeamDataZod.parse(await request.json());
  if (team.name !== name) {
    return new Response('this should not happen', { status: 400 });
  }
  try {
    await Promise.all([
      db
        .update(teams)
        .set(omit(team, ['id', 'name']))
        .where(eq(teams.id, team.id)),
      ...runnerList.map((runner) =>
        db
          .update(runners)
          .set(omit(runner, ['id']))
          .where(eq(runners.id, runner.id))
      ),
      ...loopList.map((loop) =>
        db
          .update(loops)
          .set(omit(loop, ['id']))
          .where(eq(loops.id, loop.id))
      ),
    ]);
  } catch (e) {
    console.error(e);
    return new Response('crap', { status: 500, statusText: String(e) });
  }
  return new Response('success');
}
