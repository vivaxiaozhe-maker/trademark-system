import pg from 'pg';
import { buildApp } from './app.js';
import { PostgresStore } from './postgres-store.js';

const { Pool } = pg;
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '127.0.0.1';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = buildApp({
  store: new PostgresStore(pool),
  timeZone: process.env.ORGANIZATION_TIME_ZONE ?? 'Asia/Shanghai',
  logger: true,
});

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  await pool.end();
  process.exit(1);
}

async function shutdown() {
  await app.close();
  await pool.end();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
