// src/lib/types.ts
export type ID = string;
export type ISODate = string;

export type Severity = 'Critical' | 'Major' | 'Minor';
export type FindingStatus = 'Open' | 'Resolved';
export type CapaStatus = 'Open' | 'In Progress' | 'Done';
export type Category = 'Personnel' | 'Medication' | 'Safety' | 'Other';

export interface Finding {
  id: ID;
  title: string;
  comarRef?: string;
  severity: Severity;
  notes?: string;
  pageRef?: string;
  status: FindingStatus;
  category: Category;
  linkedCapaId?: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface CAPA {
  id: ID;
  findingId: ID; // one CAPA per finding in v0
  deficiencySummary: string;
  rootCause: string;
  correctiveAction: string;
  responsiblePerson?: string;
  dueDate?: ISODate;
  status: CapaStatus;
  verificationNotes?: string;
  evidenceDocIds: ID[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface EvidenceDoc {
  id: ID;
  fileKey: string; // IndexedDB key (later)
  fileName: string;
  mime: string;
  size: number;
  linkedFindingId?: ID;
  linkedCapaId?: ID;
  uploadedAt: ISODate;
}

export interface AppState {
  findings: Finding[];
  capas: CAPA[];
  evidence: EvidenceDoc[];
  lastSaved: ISODate;
}
