import { getDb } from "../db/connection";
import { users } from "../db/schema";

export default async function AllTeams() {
  const allUsers = await getDb().select().from(users);
  return <>{allUsers.map(({name, id}) => <div key={id}>id: {id}, name: {name}</div>)}</>;
}
