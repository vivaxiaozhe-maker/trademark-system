import { createHash, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { addCalendarDays } from '../shared/calendar-date.js';
import { caseRecordToInput, parseCaseInput, stableJson } from './case-input.js';
import { HttpError, storageOperation } from './errors.js';
import type {
  BatchUpdateResult,
  CaseInput,
  CaseRecord,
  CaseStore,
  ImportReport,
  ImportRowResult,
  ImportRowStatus,
} from './types.js';

type Database = Pool | PoolClient;

const CASE_COLUMNS = `
  id, workspace_id, case_no, brand_name, business_type_code, business_type,
  jurisdiction_type, country, status_code, status, application_number,
  registration_number, official_deadline, responsible_user_id, responsible_user,
  law_firm_name, enabled, payload, record_version, created_at, updated_at
`;

function asIso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function asCalendarDate(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function toCase(row: Record<string, any>): CaseRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    caseNo: row.case_no,
    brandName: row.brand_name,
    businessTypeCode: row.business_type_code,
    businessType: row.business_type,
    jurisdictionType: row.jurisdiction_type,
    country: row.country,
    statusCode: row.status_code,
    status: row.status,
    applicationNumber: row.application_number,
    registrationNumber: row.registration_number,
    officialDeadline: asCalendarDate(row.official_deadline),
    responsibleUserId: row.responsible_user_id,
    responsibleUser: row.responsible_user,
    lawFirmName: row.law_firm_name,
    enabled: row.enabled,
    payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
    recordVersion: row.record_version,
    createdAt: asIso(row.created_at),
    updatedAt: asIso(row.updated_at),
  };
}

async function insertCase(database: Database, workspaceId: string, input: CaseInput): Promise<CaseRecord> {
  const result = await database.query(
    `INSERT INTO cases (
      id, workspace_id, case_no, brand_name, business_type_code, business_type,
      jurisdiction_type, country, status_code, status, application_number,
      registration_number, official_deadline, responsible_user_id, responsible_user,
      law_firm_name, enabled, payload
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18::jsonb
    ) RETURNING ${CASE_COLUMNS}`,
    [
      randomUUID(), workspaceId, input.caseNo, input.brandName, input.businessTypeCode,
      input.businessType, input.jurisdictionType, input.country, input.statusCode,
      input.status, input.applicationNumber, input.registrationNumber, input.officialDeadline,
      input.responsibleUserId, input.responsibleUser, input.lawFirmName, input.enabled,
      JSON.stringify(input.payload),
    ],
  );
  return toCase(result.rows[0]);
}

async function casesByNumbers(database: Database, workspaceId: string, caseNos: string[]): Promise<Map<string, CaseRecord>> {
  if (!caseNos.length) return new Map();
  const result = await database.query(
    `SELECT ${CASE_COLUMNS} FROM cases WHERE workspace_id = $1 AND case_no = ANY($2::text[])`,
    [workspaceId, [...new Set(caseNos)]],
  );
  return new Map(result.rows.map((row) => {
    const record = toCase(row);
    return [record.caseNo, record];
  }));
}

function sourceHash(records: Array<Record<string, unknown>>): string {
  return createHash('sha256').update(stableJson(records)).digest('hex');
}

function emptyReport(hash: string, rows: ImportRowResult[]): ImportReport {
  const count = (status: ImportRowStatus) => rows.filter((row) => row.status === status).length;
  return {
    batchId: null,
    sourceHash: hash,
    totalCount: rows.length,
    successCount: count('success'),
    duplicateCount: count('duplicate'),
    conflictCount: count('conflict'),
    rejectedCount: count('rejected'),
    reconciled: false,
    idempotent: false,
    rows,
  };
}

async function preflight(
  database: Database,
  workspaceId: string,
  records: Array<Record<string, unknown>>,
): Promise<ImportReport> {
  const parsed = records.map((record) => ({ source: record, parsed: parseCaseInput(record) }));
  const validCaseNos = parsed.flatMap(({ parsed: item }) => item.ok ? [item.value.caseNo] : []);
  const existing = await casesByNumbers(database, workspaceId, validCaseNos);
  const seen = new Set<string>();
  const rows: ImportRowResult[] = parsed.map(({ source, parsed: item }, index) => {
    const base = { rowNumber: index + 1, source };
    if (!item.ok) {
      return { ...base, caseNo: item.caseNo, caseId: null, status: 'rejected', message: item.message };
    }
    const input = item.value;
    const current = existing.get(input.caseNo);
    if (seen.has(input.caseNo)) {
      return { ...base, caseNo: input.caseNo, caseId: current?.id ?? null,
        status: 'duplicate', message: '导入文件内案号重复，仅保留首次出现的记录' };
    }
    seen.add(input.caseNo);
    if (current) {
      const identical = stableJson(caseRecordToInput(current)) === stableJson(input);
      return { ...base, caseNo: input.caseNo, caseId: current.id,
        status: identical ? 'duplicate' : 'conflict',
        message: identical ? '数据库已有相同案件，未重复写入' : '案号已存在且内容不同，需人工核对后更新' };
    }
    return { ...base, caseNo: input.caseNo, caseId: null, status: 'success', message: '预检通过，可写入新案件' };
  });
  return emptyReport(sourceHash(records), rows);
}

async function importReport(
  database: Database,
  workspaceId: string,
  batchId: string,
  idempotent = false,
): Promise<ImportReport | null> {
  const batch = await database.query(
    'SELECT * FROM import_batches WHERE workspace_id = $1 AND id = $2',
    [workspaceId, batchId],
  );
  if (!batch.rowCount) return null;
  const result = await database.query(
    `SELECT ir.*, (c.id IS NOT NULL AND c.case_no = ir.case_no) AS linked
     FROM import_rows ir
     LEFT JOIN cases c ON c.id = ir.case_id AND c.workspace_id = $2
     WHERE ir.batch_id = $1 ORDER BY ir.row_number`,
    [batchId, workspaceId],
  );
  const rows: ImportRowResult[] = result.rows.map((row) => ({
    rowNumber: row.row_number,
    caseNo: row.case_no,
    caseId: row.case_id,
    status: row.status,
    message: row.message,
    source: typeof row.source_payload === 'string' ? JSON.parse(row.source_payload) : row.source_payload,
  }));
  const linkedRows = result.rows.filter((row) => row.status === 'success' || row.status === 'duplicate');
  const reconciled = linkedRows.every((row) => row.linked);
  const data = batch.rows[0];
  return {
    batchId,
    sourceHash: data.source_hash,
    totalCount: data.total_count,
    successCount: data.success_count,
    duplicateCount: data.duplicate_count,
    conflictCount: data.conflict_count,
    rejectedCount: data.rejected_count,
    reconciled,
    idempotent,
    rows,
  };
}

export class PostgresStore implements CaseStore {
  constructor(private readonly pool: Pool) {}

  async health(): Promise<void> {
    await storageOperation(async () => { await this.pool.query('SELECT 1'); });
  }

  async getCase(workspaceId: string, caseNo: string): Promise<CaseRecord | null> {
    return storageOperation(async () => {
      const result = await this.pool.query(
        `SELECT ${CASE_COLUMNS} FROM cases WHERE workspace_id = $1 AND case_no = $2`,
        [workspaceId, caseNo],
      );
      return result.rowCount ? toCase(result.rows[0]) : null;
    });
  }

  async listCases(workspaceId: string, today: string, deadlineWithin?: number): Promise<CaseRecord[]> {
    return storageOperation(async () => {
      const parameters: unknown[] = [workspaceId];
      let deadlineFilter = '';
      if (deadlineWithin !== undefined) {
        parameters.push(today, addCalendarDays(today, deadlineWithin));
        deadlineFilter = 'AND official_deadline > $2::date AND official_deadline <= $3::date';
      }
      const result = await this.pool.query(
        `SELECT ${CASE_COLUMNS} FROM cases WHERE workspace_id = $1 ${deadlineFilter} ORDER BY case_no`,
        parameters,
      );
      return result.rows.map(toCase);
    });
  }

  async createCase(workspaceId: string, input: CaseInput): Promise<CaseRecord> {
    return storageOperation(async () => {
      try {
        return await insertCase(this.pool, workspaceId, input);
      } catch (error: any) {
        if (error?.code === '23505') throw new HttpError(409, 'CASE_CONFLICT', '该案号已存在，未重复写入');
        throw error;
      }
    });
  }

  async batchSetEnabled(workspaceId: string, caseNos: string[], enabled: boolean): Promise<BatchUpdateResult> {
    return storageOperation(async () => {
      const uniqueCaseNos = [...new Set(caseNos)];
      const result = await this.pool.query(
        `UPDATE cases SET enabled = $3, record_version = record_version + 1, updated_at = NOW()
         WHERE workspace_id = $1 AND case_no = ANY($2::text[]) RETURNING case_no`,
        [workspaceId, uniqueCaseNos, enabled],
      );
      const updated = new Set(result.rows.map((row) => row.case_no));
      const results = uniqueCaseNos.map((caseNo) => ({ caseNo, success: updated.has(caseNo) }));
      return {
        successCount: results.filter((item) => item.success).length,
        failureCount: results.filter((item) => !item.success).length,
        results,
      };
    });
  }

  async preflightCases(workspaceId: string, records: Array<Record<string, unknown>>): Promise<ImportReport> {
    return storageOperation(() => preflight(this.pool, workspaceId, records));
  }

  async commitCases(
    workspaceId: string,
    sourceId: string | null,
    records: Array<Record<string, unknown>>,
  ): Promise<ImportReport> {
    return storageOperation(async () => {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const hash = sourceHash(records);
        const previous = await client.query(
          'SELECT id FROM import_batches WHERE workspace_id = $1 AND source_hash = $2',
          [workspaceId, hash],
        );
        if (previous.rowCount) {
          await client.query('COMMIT');
          return (await importReport(client, workspaceId, previous.rows[0].id, true))!;
        }

        const report = await preflight(client, workspaceId, records);
        const batchId = randomUUID();
        await client.query(
          `INSERT INTO import_batches (
            id, workspace_id, source_id, source_hash, total_count, success_count,
            duplicate_count, conflict_count, rejected_count
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [batchId, workspaceId, sourceId, hash, report.totalCount, report.successCount,
            report.duplicateCount, report.conflictCount, report.rejectedCount],
        );
        for (const row of report.rows) {
          if (row.status === 'success' && row.caseNo) {
            const parsed = parseCaseInput(row.source);
            if (!parsed.ok) throw new Error('Preflight changed during import');
            const created = await insertCase(client, workspaceId, parsed.value);
            row.caseId = created.id;
          }
          await client.query(
            `INSERT INTO import_rows (
              id, batch_id, row_number, case_id, case_no, status, message, source_payload
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
            [randomUUID(), batchId, row.rowNumber, row.caseId, row.caseNo, row.status,
              row.message, JSON.stringify(row.source)],
          );
        }
        await client.query('COMMIT');
        return (await importReport(client, workspaceId, batchId))!;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    });
  }

  async getImportReport(workspaceId: string, batchId: string): Promise<ImportReport | null> {
    return storageOperation(() => importReport(this.pool, workspaceId, batchId));
  }

  async createWorkspace(name: string, dataMode: 'sample' | 'production', id = randomUUID()): Promise<string> {
    return storageOperation(async () => {
      await this.pool.query(
        'INSERT INTO workspaces (id, name, data_mode) VALUES ($1, $2, $3)',
        [id, name, dataMode],
      );
      return id;
    });
  }

  async seedSampleWorkspace(workspaceId: string, records: Array<Record<string, unknown>>, reset: boolean): Promise<number> {
    return storageOperation(async () => {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const workspace = await client.query('SELECT data_mode FROM workspaces WHERE id = $1', [workspaceId]);
        if (!workspace.rowCount) throw new HttpError(404, 'WORKSPACE_NOT_FOUND', '演示工作区不存在');
        if (workspace.rows[0].data_mode !== 'sample') {
          throw new HttpError(403, 'SAMPLE_WORKSPACE_REQUIRED', '仅允许在 sample 工作区加载或重置演示数据');
        }
        const count = await client.query('SELECT COUNT(*)::int AS count FROM cases WHERE workspace_id = $1', [workspaceId]);
        if (count.rows[0].count > 0 && !reset) {
          await client.query('COMMIT');
          return count.rows[0].count;
        }
        if (reset) {
          await client.query('DELETE FROM import_batches WHERE workspace_id = $1', [workspaceId]);
          await client.query('DELETE FROM cases WHERE workspace_id = $1', [workspaceId]);
        }
        for (const source of records) {
          const parsed = parseCaseInput(source);
          if (!parsed.ok) throw new Error(parsed.message);
          await insertCase(client, workspaceId, parsed.value);
        }
        await client.query('COMMIT');
        return records.length;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    });
  }
}
