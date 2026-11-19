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
    assert.equal(JSON.parse(values.get('tm_data_version')), '2.5');
  });

  it('F02: unknown case reads do not write and detail page has no reset/fallback action', () => {
    service.init();
    const before = writes;
    assert.equal(service.getCaseById('NOT-EXIST'), undefined);
    assert.equal(writes, before);
    const detail = readFileSync(resolve(__dirname, '../trademark-system/js/workbench-detail.js'), 'utf8');
    assert.ok(detail.includes('未找到案件'));
    assert.ok(!detail.includes('re-seeding data'));
    assert.ok(!detail.includes('DataService.seedData();location.reload()'));
    assert.ok(!detail.includes('allCases[0]'));
  });

  it('moves the original sample application number without reinterpreting a custom registration number', () => {
    service.init();
    service.updateCase('TM-2026-0042', { applicationNumber: '', registrationNumber: '20260115001' });
    service.updateCase('TM-2026-0031', { applicationNumber: '', registrationNumber: 'CUSTOM-REG' });
    values.set('tm_data_version', JSON.stringify('2.3'));
    assert.equal(service.init(), true);
    assert.equal(service.getCaseById('TM-2026-0042').applicationNumber, '20260115001');
    assert.equal(service.getCaseById('TM-2026-0042').registrationNumber, '');
    assert.equal(service.getCaseById('TM-2026-0031').registrationNumber, 'CUSTOM-REG');
  });

  it('keeps task completion and notes in the shared store without changing the official deadline', () => {
    service.init();
    const task = service.getTodoById('todo-1');
    assert.ok(service.getTodos().filter(row => row.caseId).every(row => service.getCaseById(row.caseId)));
    const officialDeadline = service.getCaseById(task.caseId).officialDeadline;
    service.updateTodo(task.id, { status: 'in_progress', note: '已核对材料' });
    service.completeTodo(task.id);
    assert.equal(service.getTodos().find(row => row.id === task.id).status, 'completed');
    assert.equal(service.getTodoById(task.id).note, '已核对材料');
    assert.equal(service.getTodoById(task.id).completedById, service.CURRENT_USER.id);
    assert.equal(service.getTodoById(task.id).completedAt, service.getToday());
    assert.equal(service.getCaseById(task.caseId).officialDeadline, officialDeadline);
    assert.equal(service.getDeadlineBucket('2026-02-30'), 'unknown');
  });

  it('preserves legacy and sibling drafts and submits a saved draft only once', () => {
    service.init();
    const legacy = 'workbench-case-create';
    const selected = 'case-draft-check';
    service.saveDraft(legacy, { brandName: '旧草稿' });
    service.saveDraft(selected, { brandName: '新草稿' });
    values.set('tm_data_version', JSON.stringify('2.4'));
    assert.equal(service.init(), true);
    assert.ok(service.getCaseDrafts().some(draft => draft.id === legacy));

    const id = service.nextCaseNumber();
    failWrites = true;
    assert.equal(service.createCaseFromDraft(selected, caseRow(id)), null);
    assert.ok(service.getCaseDrafts().some(draft => draft.id === selected));
    failWrites = false;

    assert.equal(service.createCaseFromDraft(selected, caseRow(id)).id, id);
    assert.equal(service.createCaseFromDraft(selected, caseRow(service.nextCaseNumber())).id, id);
    assert.equal(service.getCaseDrafts().some(draft => draft.id === selected), false);
    assert.ok(service.getCaseDrafts().some(draft => draft.id === legacy));
    assert.equal(service.getCases().filter(record => record.sourceDraftId === selected).length, 1);
  });

  it('finds brand cases by stable identity and only falls back to an unambiguous name', () => {
    service.init();
    const original = service.getCaseById('TM-2026-0042');
    service.updateCase(original.id, { brandName: '旧显示名称' });
    service.createCase(caseRow('TM-BRAND-NAME', { brandName: '云智' }));
    service.createCase(caseRow('TM-DIFFERENT-BRAND', { brandId: 'zhilian', brandName: '云智' }));
    assert.deepEqual(service.getBrandCases('yunzhi').map(record => record.id), [original.id, 'TM-BRAND-NAME']);
    service.createBrand({ id: 'another-yunzhi', name: '云智', type: 'external', classMatrix: {} });
    assert.deepEqual(service.getBrandCases('yunzhi').map(record => record.id), [original.id]);
  });

  it('creates one searchable todo per monitoring alert and preserves existing case deadlines', () => {
    service.init();
    const caseId = 'TM-2026-0042';
    const deadline = service.getCaseById(caseId).officialDeadline;
    assert.equal(service.createMonitorTodo('unknown'), null);
    assert.equal(service.createMonitorTodo('mr-1', { caseId: 'unknown' }), null);
    failWrites = true;
    assert.equal(service.createMonitorTodo('mr-1', { caseId }), null);
    assert.equal(service.getMonitorTodo('mr-1'), null);
    failWrites = false;
    const task = service.createMonitorTodo('mr-1', { caseId });
    assert.equal(task.status, 'pending');
    assert.equal(task.caseId, caseId);
    assert.equal(task.deadline, '');
    assert.match(task.description, /78954321/);
    assert.deepEqual(service.createMonitorTodo('mr-1'), task);
    assert.equal(service.getTodos().filter(todo => todo.sourceMonitorResultId === 'mr-1').length, 1);
    service.completeTodo(task.id);
    assert.equal(service.getMonitorTodo('mr-1').status, 'completed');
    assert.equal(service.getCaseById(caseId).officialDeadline, deadline);
  });

  it('validates fee lines, preserves decimal totals and keeps submissions distinct from paid bills', () => {
    service.init();
    const billCount = service.getFees().length;
    const input = {
      title: '费用验收', type: 'budget', currency: 'CNY', caseId: 'TM-2026-0042',
      items: [{ type: '官费', amount: '0.10' }, { type: '代理费', amount: '0.20' }]
    };
    assert.equal(service.submitFeeApplication({ ...input, caseId: 'bad' }), null);
    assert.equal(service.submitFeeApplication({ ...input, currency: 'JPY' }), null);
    failWrites = true;
    assert.equal(service.submitFeeApplication(input), null);
    failWrites = false;
    const record = service.submitFeeApplication(input);
    assert.equal(record.status, 'pending');
    assert.equal(record.flow[1].status, 'current');
    assert.equal(record.amount, 0.3);
    assert.equal(service.getFeeAppById(record.id).amount, 0.3);
    assert.equal(service.getFees().length, billCount);
    const next = service.submitFeeApplication({ ...input, currency: 'USD' });
    assert.notEqual(record.id, next.id);
    assert.equal(service.getFinanceOverview().pendingTotals.find(row => row.currency === 'USD').amount, 0.3);
  });

  it('keeps generated report content stable and filters custom periods', () => {
    service.init();
    assert.equal(service.createManagementReport({ type: 'fee', period: 'custom', from: '2026-02-30', to: '2026-03-02' }), null);
    const original = service.createManagementReport({ type: 'fee' });
    const initialCount = original.snapshot.applications.length;
    const record = service.submitFeeApplication({
      title: '费用快照验收', type: 'budget', currency: 'CNY', items: [{ type: '官费', amount: '630.15' }]
    });
    assert.equal(service.getManagementReport(original.id).snapshot.applications.length, initialCount);
    const today = service.getToday();
    const updated = service.createManagementReport({ type: 'fee', period: 'custom', from: today, to: today });
    assert.equal(updated.snapshot.applications.find(row => row.id === record.id).amount, 630.15);
    assert.equal(service.getManagementReport(updated.id).period, 'custom');
  });

  it('resolves firm cases by stable IDs and keeps legacy name-only links after renaming', () => {
    service.init();
    const legacy = service.getCaseById('TM-2025-0189');
    assert.equal(service.resolveCaseLawFirm(legacy).id, 'jincheng');
    assert.ok(service.getLawFirmCases('jincheng').some(row => row.id === legacy.id));
    assert.equal(service.resolveCaseLawFirm({ lawFirmId: 'zhongyu', lawFirmName: legacy.lawFirmName }).id, 'zhongyu');
    assert.equal(service.resolveCaseLawFirm({ lawFirmId: 'unknown', lawFirmName: legacy.lawFirmName }), undefined);
    assert.equal(service.saveLawFirmProfile('jincheng', { name: '中誉知识产权', status: 'active' }), null);
    const updated = service.saveLawFirmProfile('jincheng', { name: '金诚演示律所', status: 'active', renewDate: '2027-03-01' });
    assert.equal(updated.renewDate, '2027-03-01');
    assert.equal(service.resolveCaseLawFirm(legacy).name, '金诚演示律所');
    assert.equal(service.getLawFirmCases('jincheng').length, 5);
  });

  it('persists role changes for the same account and rejects incompatible or stale edits', () => {
    service.init();
    const record = service.getStaff().find(user => user.id === 'zhao');
    assert.equal(record.roleId, 'legal');
    assert.equal(service.setStaffRole('zhao', 'external', 'legal'), null);
    assert.equal(service.setStaffRole('zhao', '__proto__', 'legal'), null);
    assert.equal(service.setStaffRole('missing', 'legal', 'legal'), null);
    failWrites = true;
    assert.equal(service.setStaffRole('zhao', 'director', 'legal'), null);
    assert.equal(service.getStaff().find(user => user.id === 'zhao').roleId, 'legal');
    failWrites = false;
    const updated = service.setStaffRole('zhao', 'director', 'legal');
    assert.equal(updated.roleChange.previousRoleId, 'legal');
    assert.equal(service.STAFF_ROLES[updated.roleId].scope, '本部门及下属案卷');
    assert.equal(service.getStaff().find(user => user.id === 'zhao').roleId, 'director');
    assert.equal(service.setStaffRole('zhao', 'finance', 'legal'), null);
    assert.equal(service.getCaseById('TM-2026-0012').responsibleUserId, 'zhao');
  });

  it('validates and persists internal and external brand authorizations in the same store', () => {
    service.init();
    const values = {
      brandId: 'yunzhi', caseId: 'TM-2026-0042', holder: '合作测试主体', department: '知识产权部',
      purpose: '品牌展示', territories: '中国、欧盟,中国',
      startDate: '2026-11-19', endDate: '2026-12-19', needsCertificate: true
    };
    assert.equal(service.createBrandAuthorization('external', { ...values, caseId: 'TM-2026-0031' }), null);
    assert.equal(service.createBrandAuthorization('external', { ...values, endDate: '2026-11-18' }), null);
    assert.equal(service.createBrandAuthorization('external', { ...values, startDate: '2026-02-30' }), null);
    failWrites = true;
    assert.equal(service.createBrandAuthorization('external', values), null);
    failWrites = false;
    const external = service.createBrandAuthorization('external', values);
    const internal = service.createBrandAuthorization('internal', { ...values, holder: '内部运营组' });
    assert.match(external.id, /^AE-\d{4}-\d{4}$/);
    assert.match(internal.id, /^AI-\d{4}-\d{4}$/);
    assert.equal(external.status, 'pending');
    assert.deepEqual(external.territories, ['中国','欧盟']);
    assert.ok(service.getBrandAuthorizations('external').some(row => row.id === external.id));
    assert.ok(!service.getBrandAuthorizations('internal').some(row => row.id === external.id));
    assert.equal(service.reviewBrandAuthorization('internal', external.id, 'approved', '同意'), null);
    assert.equal(service.reviewBrandAuthorization('external', external.id, 'approved', '同意').status, 'approved');
    assert.equal(service.reviewBrandAuthorization('external', external.id, 'rejected', '重复审批'), null);
  });

  it('keeps seal requests tied to canonical cases and validates workflow transitions', () => {
    service.init();
    const args = { caseId: 'TM-2026-0042', title: '复审文件', purpose: '演示用途' };
    assert.equal(service.createSealRequest({ ...args, caseId: 'unknown' }), null);
    assert.equal(service.createSealRequest({ ...args, documentId: 'unknown' }), null);
    const baseline = service.getSealRequests(args.caseId).length;
    failWrites = true;
    assert.equal(service.createSealRequest(args), null);
    assert.equal(service.getSealRequests(args.caseId).length, baseline);
    failWrites = false;
    const saved = service.createSealRequest(args);
    assert.match(saved.id, /^SP-\d{4}-\d{4}$/);
    assert.equal(saved.status, 'pending_approval');
    assert.ok(service.getSealRequests(args.caseId).some(row => row.id === saved.id));
    assert.ok(!service.getSealRequests('TM-2026-0031').some(row => row.id === saved.id));
    assert.equal(service.advanceSealRequest(saved.id, 'pending_confirm', { decision: 'complete' }), null);
    assert.equal(service.advanceSealRequest(saved.id, 'pending_approval', { reference: 'AP-DEMO' }).status, 'approving');
    assert.equal(service.advanceSealRequest(saved.id, 'approving'), null);
    assert.equal(service.advanceSealRequest(saved.id, 'approving', { attachment: { name: '回传.pdf', fileKey: 'test-file' } }).status, 'pending_confirm');
    assert.equal(service.advanceSealRequest(saved.id, 'pending_confirm', { decision: 'complete' }).status, 'completed');
    assert.equal(service.getCaseById(args.caseId).brandName, '云智');
  });

  it('reads copied cases from the current case records and persists personal read and follow state', () => {
    service.init();
    const id = 'TM-2026-0056';
    const before = service.getCaseById(id);
    assert.equal(service.getCopiedCases().find(row => row.caseId === id).record.brandName, before.brandName);
    assert.equal(service.markCaseCopyRead('unknown'), null);
    assert.equal(service.markCaseCopyRead(id).readAt, service.getToday());
    assert.equal(service.setCaseCopyFollowing(id, false).following, false);
    assert.equal(service.getCopiedCases().find(row => row.caseId === id).following, false);
    assert.deepEqual(service.getCaseById(id), before);
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
  it('allocates successive identifiers and retains official numbers on distinct cases', () => {
    service.init();
    const first = service.nextCaseNumber();
    service.createCase(caseRow(first, { applicationNumber: 'AP-TEST-1', registrationNumber: 'REG-TEST-1' }));
    const second = service.nextCaseNumber();
    assert.notEqual(first, second);
    assert.equal(service.getCaseById(first).applicationNumber, 'AP-TEST-1');
    assert.equal(service.getCaseById(first).registrationNumber, 'REG-TEST-1');
    assert.equal(service.getCaseById(second), undefined);
  });

  it('stores firm material and timeline together without changing the other case', () => {
    service.init();
    const caseId = 'TM-2026-0042';
    const otherCase = 'TM-2026-0031';
    const before = service.getCaseById(otherCase).documents.length;
    const input = { id: 'returned-v1', name: 'sample.txt', firmId: 'jincheng', firmName: '金诚律师事务所' };
    const first = service.addCaseDocument(caseId, input);
    const second = service.addCaseDocument(caseId, { ...input, id: 'returned-v2' });
    assert.equal(first.version, 1);
    assert.equal(second.version, 2);
    assert.equal(service.addCaseDocument(caseId, input), null);
    assert.equal(service.getCaseById(caseId).documents.at(-1).id, 'returned-v2');
    assert.equal(service.getCaseById(caseId).timeline.at(-1).title, '律所回传材料');
    assert.equal(service.getCaseById(otherCase).documents.length, before);
  });

});
