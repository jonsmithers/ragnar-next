export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await import('../run-migrations');
    // await migrate(getDb(), { migrationsFolder: './migrations' });
    return new Response('migration successful');
  } catch (e) {
    console.error(e);
    return new Response(String(e));
  }
}
