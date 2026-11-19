import Fastify, { type FastifyInstance } from 'fastify';
import { calendarDateInTimeZone } from '../shared/calendar-date.js';
import { parseCaseInput } from './case-input.js';
import { HttpError, StorageUnavailableError } from './errors.js';
import type { CaseStore } from './types.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface AppOptions {
  store: CaseStore;
  now?: () => Date;
  timeZone?: string;
  logger?: boolean;
}

function workspaceId(value: unknown): string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new HttpError(400, 'INVALID_WORKSPACE_ID', 'workspaceId 必须是有效 UUID');
  }
  return value;
}

function objectBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'INVALID_BODY', '请求体必须是 JSON 对象');
  }
  return body as Record<string, unknown>;
}

function importBody(body: unknown): {
  workspaceId: string;
  sourceId: string | null;
  records: Array<Record<string, unknown>>;
} {
  const data = objectBody(body);
  if (!Array.isArray(data.records) || !data.records.length
    || data.records.some((record) => !record || typeof record !== 'object' || Array.isArray(record))) {
    throw new HttpError(400, 'INVALID_IMPORT_ROWS', 'records 必须是非空 JSON 对象数组');
  }
  return {
    workspaceId: workspaceId(data.workspaceId),
    sourceId: typeof data.sourceId === 'string' ? data.sourceId : null,
    records: data.records as Array<Record<string, unknown>>,
  };
}

export function buildApp(options: AppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });
  const now = options.now ?? (() => new Date());
  const timeZone = options.timeZone ?? 'Asia/Shanghai';

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({ error: { code: error.code, message: error.message } });
    }
    if (error instanceof StorageUnavailableError) {
      request.log.warn({ err: error }, 'Storage operation failed');
      return reply.code(503).send({ error: { code: 'STORAGE_UNAVAILABLE', message: '存储暂不可用，业务状态未推进，请稍后重试' } });
    }
    request.log.error({ err: error }, 'Unhandled request error');
    return reply.code(500).send({ error: { code: 'INTERNAL_ERROR', message: '请求处理失败，业务状态未推进' } });
  });

  app.get('/health', async () => {
    await options.store.health();
    return { status: 'ok', storage: 'ok' };
  });

  app.get<{ Querystring: { workspaceId?: string; deadlineWithin?: string } }>('/api/cases', async (request) => {
    const id = workspaceId(request.query.workspaceId);
    let deadlineWithin: number | undefined;
    if (request.query.deadlineWithin !== undefined) {
      deadlineWithin = Number(request.query.deadlineWithin);
      if (!Number.isInteger(deadlineWithin) || deadlineWithin < 1 || deadlineWithin > 365) {
        throw new HttpError(400, 'INVALID_DEADLINE_WINDOW', 'deadlineWithin 必须是 1–365 的整数');
      }
    }
    const today = calendarDateInTimeZone(now(), timeZone);
    const items = await options.store.listCases(id, today, deadlineWithin);
    return { items, total: items.length, today, timeZone };
  });

  app.get<{ Params: { caseNo: string }; Querystring: { workspaceId?: string } }>('/api/cases/:caseNo', async (request) => {
    const id = workspaceId(request.query.workspaceId);
    const record = await options.store.getCase(id, request.params.caseNo);
    if (!record) throw new HttpError(404, 'CASE_NOT_FOUND', '未找到该案卷，未加载或重置任何数据');
    return record;
  });

  app.post('/api/cases', async (request, reply) => {
    const data = objectBody(request.body);
    const id = workspaceId(data.workspaceId);
    const parsed = parseCaseInput(data);
    if (!parsed.ok) throw new HttpError(400, 'INVALID_CASE', parsed.message);
    const record = await options.store.createCase(id, parsed.value);
    return reply.code(201).send(record);
  });

  app.post('/api/cases/batch-enabled', async (request) => {
    const data = objectBody(request.body);
    const id = workspaceId(data.workspaceId);
    if (!Array.isArray(data.caseNos) || !data.caseNos.length
      || data.caseNos.some((caseNo) => typeof caseNo !== 'string' || !caseNo)
      || typeof data.enabled !== 'boolean') {
      throw new HttpError(400, 'INVALID_BATCH_UPDATE', 'caseNos 必须是非空字符串数组，enabled 必须是布尔值');
    }
    return options.store.batchSetEnabled(id, data.caseNos as string[], data.enabled);
  });

  app.post('/api/imports/cases/preflight', async (request) => {
    const data = importBody(request.body);
    return options.store.preflightCases(data.workspaceId, data.records);
  });

  app.post('/api/imports/cases/commit', async (request, reply) => {
    const data = importBody(request.body);
    const report = await options.store.commitCases(data.workspaceId, data.sourceId, data.records);
    return reply.code(report.idempotent ? 200 : 201).send(report);
  });

  app.get<{ Params: { batchId: string }; Querystring: { workspaceId?: string } }>('/api/imports/:batchId', async (request) => {
    const id = workspaceId(request.query.workspaceId);
    const report = await options.store.getImportReport(id, request.params.batchId);
    if (!report) throw new HttpError(404, 'IMPORT_NOT_FOUND', '未找到该导入批次');
    return report;
  });

  return app;
}
