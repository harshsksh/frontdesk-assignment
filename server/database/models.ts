import Database from 'better-sqlite3';
import { HelpRequest, KnowledgeEntry, Customer, RequestStatus } from '../../shared/types';

export class CustomerModel {
  constructor(private db: Database.Database) {}
  
  createOrGet(phone: string, name: string): Customer {
    const existing = this.db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone) as any;
    if (existing) {
      // Update last contacted
      this.db.prepare('UPDATE customers SET last_contacted_at = ? WHERE id = ?')
        .run(new Date().toISOString(), existing.id);
      return {
        id: existing.id,
        phone: existing.phone,
        name: existing.name,
        createdAt: existing.created_at,
        lastContactedAt: existing.last_contacted_at,
      };
    }
    
    const id = require('uuid').v4();
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO customers (id, phone, name, created_at, last_contacted_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, phone, name, now, now);
    
    return { id, phone, name, createdAt: now, lastContactedAt: now };
  }
  
  getById(id: string): Customer | null {
    const row = this.db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      phone: row.phone,
      name: row.name,
      createdAt: row.created_at,
      lastContactedAt: row.last_contacted_at,
    };
  }
  
  getByPhone(phone: string): Customer | null {
    const row = this.db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone) as any;
    if (!row) return null;
    return {
      id: row.id,
      phone: row.phone,
      name: row.name,
      createdAt: row.created_at,
      lastContactedAt: row.last_contacted_at,
    };
  }
  
  updateLastContacted(phone: string): void {
    this.db.prepare('UPDATE customers SET last_contacted_at = ? WHERE phone = ?')
      .run(new Date().toISOString(), phone);
  }
}

export class HelpRequestModel {
  constructor(private db: Database.Database) {}
  
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
    
    this.db.prepare(`
      INSERT INTO help_requests 
        (id, customer_id, customer_phone, customer_name, question, status, created_at, timeout_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, customerId, customerPhone, customerName, question, RequestStatus.PENDING, now, timeoutAt);
    
    return {
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
  }
  
  getById(id: string): HelpRequest | null {
    const row = this.db.prepare('SELECT * FROM help_requests WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.rowToRequest(row);
  }
  
  getPending(): HelpRequest[] {
    const rows = this.db.prepare(`
      SELECT * FROM help_requests 
      WHERE status = ? 
      ORDER BY created_at ASC
    `).all(RequestStatus.PENDING) as any[];
    
    return rows.map(r => this.rowToRequest(r));
  }
  
  getAll(limit = 100): HelpRequest[] {
    const rows = this.db.prepare(`
      SELECT * FROM help_requests 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit) as any[];
    
    return rows.map(r => this.rowToRequest(r));
  }
  
  resolve(id: string, supervisorAnswer: string, supervisorId: string): HelpRequest | null {
    const now = new Date().toISOString();
    const result = this.db.prepare(`
      UPDATE help_requests 
      SET status = ?, resolved_at = ?, supervisor_answer = ?, supervisor_id = ?
      WHERE id = ?
    `).run(RequestStatus.RESOLVED, now, supervisorAnswer, supervisorId, id);
    
    if (result.changes === 0) return null;
    return this.getById(id);
  }
  
  markUnresolved(id: string): HelpRequest | null {
    const now = new Date().toISOString();
    const result = this.db.prepare(`
      UPDATE help_requests 
      SET status = ?, resolved_at = ?
      WHERE id = ?
    `).run(RequestStatus.UNRESOLVED, now, id);
    
    if (result.changes === 0) return null;
    return this.getById(id);
  }
  
  private rowToRequest(row: any): HelpRequest {
    return {
      id: row.id,
      customerId: row.customer_id,
      customerPhone: row.customer_phone,
      customerName: row.customer_name,
      question: row.question,
      status: row.status as RequestStatus,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
      supervisorAnswer: row.supervisor_answer,
      supervisorId: row.supervisor_id,
      timeoutAt: row.timeout_at,
    };
  }
}

export class KnowledgeBaseModel {
  constructor(private db: Database.Database) {}
  
  findAnswer(question: string): KnowledgeEntry | null {
    // Simple keyword matching - in production, use semantic search or embeddings
    const questionLower = question.toLowerCase().trim();
    const entries = this.db.prepare('SELECT * FROM knowledge_base').all() as any[];
    
    for (const entry of entries) {
      const entryLower = entry.question.toLowerCase().trim();
      // Check if question contains key words from knowledge base entry
      const entryWords = entryLower.split(/\s+/);
      const questionWords = questionLower.split(/\s+/);
      const matchCount = entryWords.filter(w => questionWords.some(qw => qw.includes(w) || w.includes(qw))).length;
      
      if (matchCount >= Math.min(2, entryWords.length * 0.5)) {
        // Update usage stats
        this.incrementUsage(entry.id);
        return this.rowToEntry(entry);
      }
    }
    
    return null;
  }
  
  addEntry(question: string, answer: string, sourceRequestId: string | null): KnowledgeEntry {
    const id = require('uuid').v4();
    const now = new Date().toISOString();
    
    this.db.prepare(`
      INSERT INTO knowledge_base (id, question, answer, source_request_id, created_at, usage_count)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(id, question, answer, sourceRequestId, now);
    
    return {
      id,
      question,
      answer,
      sourceRequestId,
      createdAt: now,
      lastUsedAt: null,
      usageCount: 0,
    };
  }
  
  getAll(): KnowledgeEntry[] {
    const rows = this.db.prepare('SELECT * FROM knowledge_base ORDER BY created_at DESC').all() as any[];
    return rows.map(r => this.rowToEntry(r));
  }
  
  incrementUsage(id: string): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE knowledge_base 
      SET usage_count = usage_count + 1, last_used_at = ?
      WHERE id = ?
    `).run(now, id);
  }
  
  private rowToEntry(row: any): KnowledgeEntry {
    return {
      id: row.id,
      question: row.question,
      answer: row.answer,
      sourceRequestId: row.source_request_id,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
      usageCount: row.usage_count,
    };
  }
}

