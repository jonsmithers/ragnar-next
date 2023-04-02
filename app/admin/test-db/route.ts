import { getDb } from "@/app/db/connection";
import { users } from "@/app/db/schema";

export const dynamic = 'force-dynamic';

export async function GET(_request: Request) {
  const db = getDb();
  const allUsers = await db.select().from(users);
  return new Response(`test ${allUsers.join(', ')}`)
}
