import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Pool } from 'pg';

export async function migrate(pool: Pool, migrationsDirectory = resolve(process.cwd(), 'migrations')): Promise<string[]> {
  const applied: string[] = [];
  const client = await pool.connect();
  try {
    const migrationTable = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'schema_migrations'`,
    );
    if (!migrationTable.rowCount) {
      await client.query(`CREATE TABLE schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    }
    const files = (await readdir(migrationsDirectory)).filter((file) => /^\d+_.*\.sql$/.test(file)).sort();
    for (const file of files) {
      const existing = await client.query('SELECT version FROM schema_migrations WHERE version = $1', [file]);
      if (existing.rowCount) continue;
      const sql = await readFile(resolve(migrationsDirectory, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        applied.push(file);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    return applied;
  } finally {
    client.release();
  }
}
