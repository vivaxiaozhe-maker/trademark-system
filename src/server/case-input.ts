import { isCalendarDate } from '../shared/calendar-date.js';
import type { CaseInput, CaseRecord } from './types.js';

export type ParsedCaseInput =
  | { ok: true; value: CaseInput }
  | { ok: false; caseNo: string | null; message: string };

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function parseCaseInput(source: Record<string, unknown>): ParsedCaseInput {
  const caseNo = text(source.caseNo) ?? text(source.id);
  const brandName = text(source.brandName);
  if (!caseNo) return { ok: false, caseNo: null, message: 'caseNo（或旧字段 id）为必填项' };
  if (!brandName) return { ok: false, caseNo, message: 'brandName 为必填项' };
  const officialDeadline = text(source.officialDeadline);
  if (officialDeadline && !isCalendarDate(officialDeadline)) {
    return { ok: false, caseNo, message: 'officialDeadline 必须是有效的 YYYY-MM-DD 日期' };
  }
  const rawType = text(source.jurisdictionType) ?? text(source.type);
  if (rawType && rawType !== 'domestic' && rawType !== 'overseas') {
    return { ok: false, caseNo, message: 'jurisdictionType 仅支持 domestic 或 overseas' };
  }
  const rawPayload = source.payload;
  const payload = rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload)
    ? rawPayload as Record<string, unknown>
    : source;

  return {
    ok: true,
    value: {
      caseNo,
      brandName,
      businessTypeCode: text(source.businessTypeCode),
      businessType: text(source.businessType),
      jurisdictionType: rawType as 'domestic' | 'overseas' | null,
      country: text(source.country),
      statusCode: text(source.statusCode),
      status: text(source.status),
      applicationNumber: text(source.applicationNumber),
      registrationNumber: text(source.registrationNumber),
      officialDeadline,
      responsibleUserId: text(source.responsibleUserId),
      responsibleUser: text(source.responsibleUser),
      lawFirmName: text(source.lawFirmName),
      enabled: source.enabled !== false,
      payload,
    },
  };
}

export function caseRecordToInput(record: CaseRecord): CaseInput {
  const { caseNo, brandName, businessTypeCode, businessType, jurisdictionType, country,
    statusCode, status, applicationNumber, registrationNumber, officialDeadline,
    responsibleUserId, responsibleUser, lawFirmName, enabled, payload } = record;
  return { caseNo, brandName, businessTypeCode, businessType, jurisdictionType, country,
    statusCode, status, applicationNumber, registrationNumber, officialDeadline,
    responsibleUserId, responsibleUser, lawFirmName, enabled, payload };
}

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
