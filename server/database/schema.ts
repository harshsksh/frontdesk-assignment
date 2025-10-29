import Database from 'better-sqlite3';
import path from 'path';
import { RequestStatus } from '../../shared/types';

export function initializeDatabase(): Database.Database {
  const dbPath = path.join(process.cwd(), 'frontdesk.db');
  const db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_contacted_at TEXT
    )
  `);
  
  // Create help_requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS help_requests (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      question TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'resolved', 'unresolved')),
      created_at TEXT NOT NULL,
      resolved_at TEXT,
      supervisor_answer TEXT,
      supervisor_id TEXT,
      timeout_at TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);
  
  // Create knowledge_base table
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      source_request_id TEXT,
      created_at TEXT NOT NULL,
      last_used_at TEXT,
      usage_count INTEGER DEFAULT 0,
      FOREIGN KEY (source_request_id) REFERENCES help_requests(id)
    )
  `);
  
  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_help_requests_status ON help_requests(status);
    CREATE INDEX IF NOT EXISTS idx_help_requests_customer ON help_requests(customer_id);
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_question ON knowledge_base(question);
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
  `);
  
  return db;
}

