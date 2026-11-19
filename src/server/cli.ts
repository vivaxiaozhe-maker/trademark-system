import { createRequire } from 'node:module';
import pg from 'pg';
import { migrate } from './migrate.js';
import { PostgresStore } from './postgres-store.js';

const { Pool } = pg;
const DEMO_WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const command = process.argv[2];
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const store = new PostgresStore(pool);

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function legacyCases(): Array<Record<string, unknown>> {
  const values = new Map<string, string>();
  Object.assign(globalThis, {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
      clear: () => { values.clear(); },
    },
  });
  const require = createRequire(import.meta.url);
  const dataService = require('../../trademark-system/js/data-service.js');
  if (!dataService.seedData()) throw new Error('无法生成演示数据');
  return dataService.getCases();
}

try {
  if (command === 'migrate') {
    const applied = await migrate(pool);
    console.log(applied.length ? `Applied: ${applied.join(', ')}` : 'Database is already up to date.');
  } else if (command === 'seed:demo' || command === 'reset:demo') {
    await migrate(pool);
    if (command === 'seed:demo') {
      await pool.query(
        `INSERT INTO workspaces (id, name, data_mode) VALUES ($1, '演示工作区', 'sample')
         ON CONFLICT (id) DO NOTHING`,
        [DEMO_WORKSPACE_ID],
      );
    }
    const count = await store.seedSampleWorkspace(DEMO_WORKSPACE_ID, legacyCases(), command === 'reset:demo');
    console.log(`${command === 'reset:demo' ? 'Reset' : 'Loaded'} demo workspace ${DEMO_WORKSPACE_ID}: ${count} cases.`);
  } else if (command === 'workspace:create') {
    const name = argument('name');
    const mode = argument('mode') ?? 'production';
    if (!name || (mode !== 'sample' && mode !== 'production')) {
      throw new Error('Usage: npm run workspace:create -- --name "企业工作区" --mode production');
    }
    await migrate(pool);
    const id = await store.createWorkspace(name, mode);
    console.log(`Created ${mode} workspace: ${id}`);
  } else {
    throw new Error('Commands: migrate, seed:demo, reset:demo, workspace:create');
  }
} finally {
  await pool.end();
}
