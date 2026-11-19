export interface CaseInput {
  caseNo: string;
  brandName: string;
  businessTypeCode: string | null;
  businessType: string | null;
  jurisdictionType: 'domestic' | 'overseas' | null;
  country: string | null;
  statusCode: string | null;
  status: string | null;
  applicationNumber: string | null;
  registrationNumber: string | null;
  officialDeadline: string | null;
  responsibleUserId: string | null;
  responsibleUser: string | null;
  lawFirmName: string | null;
  enabled: boolean;
  payload: Record<string, unknown>;
}

export interface CaseRecord extends CaseInput {
  id: string;
  workspaceId: string;
  recordVersion: number;
  createdAt: string;
  updatedAt: string;
}

export type ImportRowStatus = 'success' | 'duplicate' | 'conflict' | 'rejected';

export interface ImportRowResult {
  rowNumber: number;
  caseNo: string | null;
  caseId: string | null;
  status: ImportRowStatus;
  message: string;
  source: Record<string, unknown>;
}

export interface ImportReport {
  batchId: string | null;
  sourceHash: string;
  totalCount: number;
  successCount: number;
  duplicateCount: number;
  conflictCount: number;
  rejectedCount: number;
  reconciled: boolean;
  idempotent: boolean;
  rows: ImportRowResult[];
}

export interface BatchUpdateResult {
  successCount: number;
  failureCount: number;
  results: Array<{ caseNo: string; success: boolean }>;
}

export interface CaseStore {
  health(): Promise<void>;
  getCase(workspaceId: string, caseNo: string): Promise<CaseRecord | null>;
  listCases(workspaceId: string, today: string, deadlineWithin?: number): Promise<CaseRecord[]>;
  createCase(workspaceId: string, input: CaseInput): Promise<CaseRecord>;
  batchSetEnabled(workspaceId: string, caseNos: string[], enabled: boolean): Promise<BatchUpdateResult>;
  preflightCases(workspaceId: string, records: Array<Record<string, unknown>>): Promise<ImportReport>;
  commitCases(workspaceId: string, sourceId: string | null, records: Array<Record<string, unknown>>): Promise<ImportReport>;
  getImportReport(workspaceId: string, batchId: string): Promise<ImportReport | null>;
}
