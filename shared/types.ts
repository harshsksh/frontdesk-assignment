export enum RequestStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  UNRESOLVED = 'unresolved',
}

export interface HelpRequest {
  id: string;
  customerId: string;
  customerPhone: string;
  customerName: string;
  question: string;
  status: RequestStatus;
  createdAt: string;
  resolvedAt: string | null;
  supervisorAnswer: string | null;
  supervisorId: string | null;
  timeoutAt: string | null;
}

export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  sourceRequestId: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  createdAt: string;
  lastContactedAt: string | null;
}

