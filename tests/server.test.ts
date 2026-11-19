import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import pg from 'pg';
import { newDb } from 'pg-mem';
import { buildApp } from '../src/server/app.js';
import { StorageUnavailableError } from '../src/server/errors.js';
import { parseCaseInput } from '../src/server/case-input.js';
import { migrate } from '../src/server/migrate.js';
import { PostgresStore } from '../src/server/postgres-store.js';
import type { CaseStore } from '../src/server/types.js';
import {
  calendarDateInTimeZone,
  classifyDeadline,
  daysBetweenCalendarDates,
} from '../src/shared/calendar-date.js';

const { Pool } = pg;
const WORKSPACE_ID = '10000000-0000-4000-8000-000000000001';
const NOW = new Date('2026-11-18T16:30:00.000Z'); // 2026-11-19 00:30 in Shanghai

function caseRow(caseNo: string, overrides: Record<string, unknown> = {}) {
  return {
    caseNo,
    brandName: `品牌-${caseNo}`,
    businessType: '新申请',
    businessTypeCode: 'new_apply',
    jurisdictionType: 'domestic',
    country: '中国',
    status: '已立案',
    statusCode: 'filed',
    applicationNumber: null,
    registrationNumber: null,
    officialDeadline: '2026-11-25',
    responsibleUser: 'Missy',
    ...overrides,
  };
}

describe('calendar dates', () => {
  it('uses the organization calendar day instead of the UTC day', () => {
    assert.equal(calendarDateInTimeZone(NOW, 'Asia/Shanghai'), '2026-11-19');
    assert.equal(calendarDateInTimeZone(NOW, 'UTC'), '2026-11-18');
    assert.equal(calendarDateInTimeZone(NOW, 'America/Los_Angeles'), '2026-11-18');
  });

  it('separates overdue, today, tomorrow, day seven and day eight', () => {
    assert.equal(daysBetweenCalendarDates('2026-11-19', '2026-11-20'), 1);
    assert.equal(classifyDeadline('2026-11-18', '2026-11-19'), 'overdue');
    assert.equal(classifyDeadline('2026-11-19', '2026-11-19'), 'today');
    assert.equal(classifyDeadline('2026-11-20', '2026-11-19'), 'upcoming');
    assert.equal(classifyDeadline('2026-11-26', '2026-11-19'), 'upcoming');
    assert.equal(classifyDeadline('2026-11-27', '2026-11-19'), 'later');
  });
});

describe('T01 PostgreSQL foundation', () => {
  let pool: pg.Pool;
  let store: PostgresStore;

  beforeEach(async () => {
    const database = newDb();
    const adapter = database.adapters.createPg();
    pool = new adapter.Pool() as unknown as pg.Pool;
    await migrate(pool);
    store = new PostgresStore(pool);
    await store.createWorkspace('合成试点工作区', 'sample', WORKSPACE_ID);
  });

  afterEach(async () => {
    await pool.end();
  });

  it('runs migrations incrementally without deleting inserted cases', async () => {
    const app = buildApp({ store, now: () => NOW });
    const create = await app.inject({
      method: 'POST', url: '/api/cases',
      payload: { workspaceId: WORKSPACE_ID, ...caseRow('TM-2026-1001') },
    });
    assert.equal(create.statusCode, 201);
    assert.deepEqual(await migrate(pool), []);
    const found = await app.inject({
      method: 'GET', url: `/api/cases/TM-2026-1001?workspaceId=${WORKSPACE_ID}`,
    });
    assert.equal(found.statusCode, 200);
    assert.equal(found.json().caseNo, 'TM-2026-1001');
    await app.close();
  });

  it('E01: preserves old links, returns 404 for unknown cases and reconciles repeated imports', async () => {
    const app = buildApp({ store, now: () => NOW });
    for (const caseNo of ['TM-2026-1001', 'TM-2026-1002']) {
      const response = await app.inject({
        method: 'POST', url: '/api/cases', payload: { workspaceId: WORKSPACE_ID, ...caseRow(caseNo) },
      });
      assert.equal(response.statusCode, 201);
    }
    const before = await store.listCases(WORKSPACE_ID, '2026-11-19');
    const missing = await app.inject({
      method: 'GET', url: `/api/cases/NOT-EXIST?workspaceId=${WORKSPACE_ID}`,
    });
    assert.equal(missing.statusCode, 404);
    assert.equal(missing.json().error.code, 'CASE_NOT_FOUND');
    assert.equal((await store.listCases(WORKSPACE_ID, '2026-11-19')).length, before.length);

    const records = [caseRow('TM-2026-2001'), caseRow('TM-2026-2002')];
    const preflight = await app.inject({
      method: 'POST', url: '/api/imports/cases/preflight',
      payload: { workspaceId: WORKSPACE_ID, records },
    });
    assert.equal(preflight.json().successCount, 2);
    assert.equal((await store.listCases(WORKSPACE_ID, '2026-11-19')).length, 2, 'preflight must not write');

    const first = await app.inject({
      method: 'POST', url: '/api/imports/cases/commit',
      payload: { workspaceId: WORKSPACE_ID, sourceId: 'legacy-2026-11', records },
    });
    assert.equal(first.statusCode, 201);
    assert.equal(first.json().successCount, 2);
    assert.equal(first.json().reconciled, true);
    const batchId = first.json().batchId as string;

    const repeated = await app.inject({
      method: 'POST', url: '/api/imports/cases/commit',
      payload: { workspaceId: WORKSPACE_ID, sourceId: 'legacy-2026-11', records },
    });
    assert.equal(repeated.statusCode, 200);
    assert.equal(repeated.json().idempotent, true);
    assert.equal(repeated.json().batchId, batchId);
    assert.equal((await store.listCases(WORKSPACE_ID, '2026-11-19')).length, 4);

    const reconciliation = await app.inject({
      method: 'GET', url: `/api/imports/${batchId}?workspaceId=${WORKSPACE_ID}`,
    });
    assert.equal(reconciliation.json().reconciled, true);
    assert.deepEqual(await migrate(pool), []);
    const oldLink = await app.inject({
      method: 'GET', url: `/api/cases/TM-2026-1001?workspaceId=${WORKSPACE_ID}`,
    });
    assert.equal(oldLink.statusCode, 200);
    await app.close();
  });

  it('F05: upcoming filters exclude overdue, today and day eight at local midnight', async () => {
    const deadlines = ['2026-11-18', '2026-11-19', '2026-11-20', '2026-11-26', '2026-11-27'];
    for (const [index, officialDeadline] of deadlines.entries()) {
      await store.createCase(WORKSPACE_ID, parseInput(caseRow(`TM-DATE-${index}`, { officialDeadline })));
    }
    const app = buildApp({ store, now: () => NOW, timeZone: 'Asia/Shanghai' });
    const response = await app.inject({
      method: 'GET', url: `/api/cases?workspaceId=${WORKSPACE_ID}&deadlineWithin=7`,
    });
    assert.equal(response.json().today, '2026-11-19');
    assert.deepEqual(response.json().items.map((item: any) => item.officialDeadline), ['2026-11-20', '2026-11-26']);
    await app.close();
  });

  it('F08: reports only actually updated rows in a batch', async () => {
    const app = buildApp({ store, now: () => NOW });
    await store.createCase(WORKSPACE_ID, parseInput(caseRow('TM-BATCH-1')));
    await store.createCase(WORKSPACE_ID, parseInput(caseRow('TM-BATCH-2')));
    const response = await app.inject({
      method: 'POST', url: '/api/cases/batch-enabled',
      payload: { workspaceId: WORKSPACE_ID, caseNos: ['TM-BATCH-1', 'TM-BATCH-2', 'MISSING'], enabled: false },
    });
    assert.deepEqual(response.json().successCount, 2);
    assert.deepEqual(response.json().failureCount, 1);
    assert.equal((await store.getCase(WORKSPACE_ID, 'TM-BATCH-1'))?.enabled, false);
    assert.equal((await store.getCase(WORKSPACE_ID, 'TM-BATCH-2'))?.enabled, false);
    await app.close();
  });

  it('classifies duplicate, conflict and rejected import rows', async () => {
    const original = caseRow('TM-IMPORT-1');
    const conflicting = caseRow('TM-IMPORT-CONFLICT');
    await store.commitCases(WORKSPACE_ID, 'first', [original, conflicting]);
    const report = await store.preflightCases(WORKSPACE_ID, [
      original,
      { ...conflicting, brandName: '内容发生冲突' },
      caseRow('TM-IMPORT-2'),
      caseRow('TM-IMPORT-2'),
      { brandName: '缺少案号' },
      caseRow('TM-IMPORT-3', { officialDeadline: '2026-02-30' }),
    ]);
    assert.deepEqual(report.rows.map((row) => row.status), [
      'duplicate', 'conflict', 'success', 'duplicate', 'rejected', 'rejected',
    ]);
  });

  it('E09: returns 503 without advancing state, then persists one retry', async () => {
    let unavailable = true;
    const resilientStore = new Proxy(store, {
      get(target, property, receiver) {
        if (property === 'createCase' && unavailable) {
          return async () => { throw new StorageUnavailableError(new Error('synthetic database outage')); };
        }
        return Reflect.get(target, property, receiver);
      },
    }) as CaseStore;
    const app = buildApp({ store: resilientStore, now: () => NOW });
    const payload = { workspaceId: WORKSPACE_ID, ...caseRow('TM-RETRY-1') };
    const failed = await app.inject({ method: 'POST', url: '/api/cases', payload });
    assert.equal(failed.statusCode, 503);
    assert.equal(failed.json().error.code, 'STORAGE_UNAVAILABLE');
    assert.equal(await store.getCase(WORKSPACE_ID, 'TM-RETRY-1'), null);
    unavailable = false;
    const retry = await app.inject({ method: 'POST', url: '/api/cases', payload });
    assert.equal(retry.statusCode, 201);
    assert.equal((await store.listCases(WORKSPACE_ID, '2026-11-19')).length, 1);
    await app.close();
  });

  it('refuses to seed or reset a production workspace', async () => {
    const productionId = '20000000-0000-4000-8000-000000000001';
    await store.createWorkspace('正式工作区', 'production', productionId);
    await assert.rejects(
      store.seedSampleWorkspace(productionId, [caseRow('TM-NOT-SAMPLE')], true),
      (error: any) => error.code === 'SAMPLE_WORKSPACE_REQUIRED',
    );
    assert.equal((await store.listCases(productionId, '2026-11-19')).length, 0);
  });
});

function parseInput(source: Record<string, unknown>) {
  const parsed = parseCaseInput(source);
  if (!parsed.ok) throw new Error(parsed.message);
  return parsed.value;
}
