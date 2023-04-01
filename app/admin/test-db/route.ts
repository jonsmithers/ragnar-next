import { getDb } from "@/app/db/connection";
import { users } from "@/app/db/schema";

export async function GET(_request: Request) {
  const db = getDb();
  // const i = await db.insert(users).values({ name: 'wut' });
  const allUsers = await db.select().from(users);
  console.log('allUsers', allUsers);
  return new Response('test')
}
