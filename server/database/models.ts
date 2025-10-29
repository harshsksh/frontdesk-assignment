import { HelpRequest, KnowledgeEntry, Customer, RequestStatus } from '../../shared/types';
import { FileStorage } from './fileStorage';

export class CustomerModel {
  constructor(private storage: FileStorage) {}
  
  createOrGet(phone: string, name: string): Customer {
    const existing = this.storage.getCustomerByPhone(phone);
    if (existing) {
      // Update last contacted
      const updated = {
        ...existing,
        lastContactedAt: new Date().toISOString(),
      };
      this.storage.createOrUpdateCustomer(updated);
      return updated;
    }
    
    const id = require('uuid').v4();
    const now = new Date().toISOString();
    const customer: Customer = {
      id,
      phone,
      name,
      createdAt: now,
      lastContactedAt: now,
    };
    this.storage.createOrUpdateCustomer(customer);
    return customer;
  }
  
  getById(id: string): Customer | null {
    return this.storage.getCustomerById(id);
  }
  
  getByPhone(phone: string): Customer | null {
    return this.storage.getCustomerByPhone(phone);
  }
  
  updateLastContacted(phone: string): void {
    const customer = this.storage.getCustomerByPhone(phone);
    if (customer) {
      customer.lastContactedAt = new Date().toISOString();
      this.storage.createOrUpdateCustomer(customer);
    }
  }
}

export class HelpRequestModel {
  constructor(private storage: FileStorage) {}
  
  create(
    customerId: string,
    customerPhone: string,
    customerName: string,
    question: string
  ): HelpRequest {
    const id = require('uuid').v4();
    const now = new Date().toISOString();
    // Set timeout to 5 minutes from now
    const timeoutAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const request: HelpRequest = {
      id,
      customerId,
      customerPhone,
      customerName,
      question,
      status: RequestStatus.PENDING,
      createdAt: now,
      resolvedAt: null,
      supervisorAnswer: null,
      supervisorId: null,
      timeoutAt,
    };
    
    this.storage.createRequest(request);
    return request;
  }
  
  getById(id: string): HelpRequest | null {
    return this.storage.getRequestById(id);
  }
  
  getPending(): HelpRequest[] {
    return this.storage.getPendingRequests();
  }
  
  getAll(limit = 100): HelpRequest[] {
    return this.storage.getAllRequests(limit);
  }
  
  resolve(id: string, supervisorAnswer: string, supervisorId: string): HelpRequest | null {
    const request = this.storage.getRequestById(id);
    if (!request) return null;
    
    const now = new Date().toISOString();
    const updated: HelpRequest = {
      ...request,
      status: RequestStatus.RESOLVED,
      resolvedAt: now,
      supervisorAnswer,
      supervisorId,
    };
    
    this.storage.updateRequest(updated);
    return updated;
  }
  
  markUnresolved(id: string): HelpRequest | null {
    const request = this.storage.getRequestById(id);
    if (!request) return null;
    
    const now = new Date().toISOString();
    const updated: HelpRequest = {
      ...request,
      status: RequestStatus.UNRESOLVED,
      resolvedAt: now,
    };
    
    this.storage.updateRequest(updated);
    return updated;
  }
}

export class KnowledgeBaseModel {
  constructor(private storage: FileStorage) {}
  
  findAnswer(question: string): KnowledgeEntry | null {
    // Simple keyword matching - in production, use semantic search or embeddings
    const questionLower = question.toLowerCase().trim();
    const entries = this.storage.getAllKnowledgeEntries();
    
    for (const entry of entries) {
      const entryLower = entry.question.toLowerCase().trim();
      // Check if question contains key words from knowledge base entry
      const entryWords = entryLower.split(/\s+/);
      const questionWords = questionLower.split(/\s+/);
      const matchCount = entryWords.filter(w => questionWords.some(qw => qw.includes(w) || w.includes(qw))).length;
      
      if (matchCount >= Math.min(2, entryWords.length * 0.5)) {
        // Update usage stats
        this.incrementUsage(entry.id);
        return entry;
      }
    }
    
    return null;
  }
  
  addEntry(question: string, answer: string, sourceRequestId: string | null): KnowledgeEntry {
    const id = require('uuid').v4();
    const now = new Date().toISOString();
    
    const entry: KnowledgeEntry = {
      id,
      question,
      answer,
      sourceRequestId,
      createdAt: now,
      lastUsedAt: null,
      usageCount: 0,
    };
    
    this.storage.createKnowledgeEntry(entry);
    return entry;
  }
  
  getAll(): KnowledgeEntry[] {
    return this.storage.getAllKnowledgeEntries();
  }
  
  incrementUsage(id: string): void {
    const entry = this.storage.getAllKnowledgeEntries().find(e => e.id === id);
    if (entry) {
      const now = new Date().toISOString();
      const updated: KnowledgeEntry = {
        ...entry,
        usageCount: entry.usageCount + 1,
        lastUsedAt: now,
      };
      this.storage.updateKnowledgeEntry(updated);
    }
  }
}
