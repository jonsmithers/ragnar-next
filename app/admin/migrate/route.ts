import { getDb } from "@/app/db/connection";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export async function GET(_request: Request) {
  await migrate(getDb(), { migrationsFolder: './migrations' });
  return new Response('migrated')
}
