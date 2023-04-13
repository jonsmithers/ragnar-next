import { migrate } from 'drizzle-orm/mysql2/migrator';
import { getDb } from './connection';

(async () => {
  await migrate(getDb(), { migrationsFolder: './migrations' });
  console.log('migrations complete');
  process.exit(0);
})();
