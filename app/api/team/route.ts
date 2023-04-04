import { getDb } from '@/app/db/connection';
import { teams } from '@/app/db/schema';
import { eq } from 'drizzle-orm/expressions';
import z from 'zod';

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
  const matches = await db.select().from(teams).where(eq(teams.name, name)).limit(1);
  if (!matches.length) {
    await db.insert(teams).values({ name });
    return new Response('created new team');
  }

  return new Response(`this team already exists (${JSON.stringify(matches[0])})`);
}
