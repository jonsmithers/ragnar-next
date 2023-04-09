import { getDb } from "../db/connection";
import { teams } from "../db/schema";

export default async function AllTeams() {
  const db = getDb();
  const allTeams = await db.select().from(teams);
  return <>{allTeams.map(({name, id}) => <div key={id}>id: {id}, name: {name}</div>)}</>;
}
