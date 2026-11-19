const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { beforeEach, describe, it } = require('node:test');

const servicePath = resolve(__dirname, '../trademark-system/js/data-service.js');
let values;
let writes;
let failWrites;

function loadService() {
  values = new Map();
  writes = 0;
  failWrites = false;
  global.localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) {
      writes += 1;
      if (failWrites) throw new Error('synthetic localStorage failure');
      values.set(key, String(value));
    },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); },
  };
  delete require.cache[require.resolve(servicePath)];
  return require(servicePath);
}

function offsetDate(today, offset) {
  const [year, month, day] = today.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return date.toISOString().slice(0, 10);
}

function caseRow(id, overrides = {}) {
  return {
    id,
    brandName: id,
    type: 'domestic',
    businessType: '新申请',
    statusCode: 'pending',
    officialDeadline: null,
    ...overrides,
  };
}

describe('legacy Demo T01 regressions', () => {
  let service;
  beforeEach(() => { service = loadService(); });

  it('F02: version upgrades preserve user-created cases instead of reseeding', () => {
    assert.equal(service.init(), true);
    const created = service.createCase(caseRow('TM-USER-CREATED'));
    assert.equal(created.id, 'TM-USER-CREATED');
    const before = JSON.parse(values.get('tm_data_cases'));
    values.set('tm_data_version', JSON.stringify('2.0'));
    assert.equal(service.init(), true);
    const after = JSON.parse(values.get('tm_data_cases'));
    assert.equal(after.length, before.length);
    assert.ok(after.some((item) => item.id === 'TM-USER-CREATED'));
    assert.equal(JSON.parse(values.get('tm_data_version')), '2.3');
  });

  it('F02: unknown case reads do not write and detail page has no reset/fallback action', () => {
    service.init();
    const before = writes;
    assert.equal(service.getCaseById('NOT-EXIST'), undefined);
    assert.equal(writes, before);
    const detail = readFileSync(resolve(__dirname, '../trademark-system/pages/case-detail.html'), 'utf8');
    assert.ok(detail.includes('未找到案件'));
    assert.ok(!detail.includes('re-seeding data'));
    assert.ok(!detail.includes('DataService.seedData();location.reload()'));
    assert.ok(!detail.includes('allCases[0]'));
  });

  it('F05: future seven-day filters exclude overdue, today and day eight', () => {
    service.init();
    const today = service.getToday();
    const deadlines = [-1, 0, 1, 7, 8];
    service.setEntity('tm_data_cases', deadlines.map((offset) => caseRow(`DATE-${offset}`, {
      officialDeadline: offsetDate(today, offset),
    })));
    const result = service.getCases({ deadlineWithin: 7 });
    assert.deepEqual(result.map((item) => item.id), ['DATE-1', 'DATE-7']);
    assert.equal(service.getCaseStats().deadlineThisWeek, 2);
    assert.equal(service.getDeadlineBucket(offsetDate(today, -1), today), 'overdue');
    assert.equal(service.getDeadlineBucket(today, today), 'today');
  });

  it('F08: batch updates use ids and return actual success/failure counts', () => {
    service.init();
    service.setEntity('tm_data_cases', [caseRow('BATCH-1'), caseRow('BATCH-2')]);
    const result = service.batchSetCaseEnabled(['BATCH-1', 'BATCH-2', 'MISSING'], false);
    assert.equal(result.successCount, 2);
    assert.equal(result.failureCount, 1);
    assert.equal(service.getCaseById('BATCH-1').enabled, false);
    assert.equal(service.getCaseById('BATCH-2').enabled, false);
  });

  it('E09: storage write failures return null instead of a false success object', () => {
    service.init();
    const before = values.get('tm_data_cases');
    failWrites = true;
    assert.equal(service.createCase(caseRow('WRITE-MUST-FAIL')), null);
    assert.equal(service.updateCase('TM-2026-0042', { enabled: false }), null);
    assert.equal(values.get('tm_data_cases'), before);
  });
});
