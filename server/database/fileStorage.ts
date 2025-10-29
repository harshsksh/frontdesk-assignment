import * as fs from 'fs';
import * as path from 'path';
import { HelpRequest, KnowledgeEntry, Customer, RequestStatus } from '../../shared/types';

interface DatabaseData {
  customers: Customer[];
  helpRequests: HelpRequest[];
  knowledgeBase: KnowledgeEntry[];
}

export class FileStorage {
  private dbPath: string;
  private data!: DatabaseData;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'frontdesk-data.json');
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const content = fs.readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(content);
      } else {
        this.data = {
          customers: [],
          helpRequests: [],
          knowledgeBase: [],
        };
        this.save();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      this.data = {
        customers: [],
        helpRequests: [],
        knowledgeBase: [],
      };
      this.save();
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Customer operations
  createOrUpdateCustomer(customer: Customer): void {
    const index = this.data.customers.findIndex(c => c.phone === customer.phone);
    if (index >= 0) {
      this.data.customers[index] = customer;
    } else {
      this.data.customers.push(customer);
    }
    this.save();
  }

  getCustomerById(id: string): Customer | null {
    return this.data.customers.find(c => c.id === id) || null;
  }

  getCustomerByPhone(phone: string): Customer | null {
    return this.data.customers.find(c => c.phone === phone) || null;
  }

  getAllCustomers(): Customer[] {
    return [...this.data.customers];
  }

  // Help Request operations
  createRequest(request: HelpRequest): void {
    this.data.helpRequests.push(request);
    this.save();
  }

  getRequestById(id: string): HelpRequest | null {
    return this.data.helpRequests.find(r => r.id === id) || null;
  }

  getPendingRequests(): HelpRequest[] {
    return this.data.helpRequests.filter(r => r.status === RequestStatus.PENDING);
  }

  getAllRequests(limit?: number): HelpRequest[] {
    const sorted = [...this.data.helpRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  updateRequest(request: HelpRequest): void {
    const index = this.data.helpRequests.findIndex(r => r.id === request.id);
    if (index >= 0) {
      this.data.helpRequests[index] = request;
      this.save();
    }
  }

  // Knowledge Base operations
  createKnowledgeEntry(entry: KnowledgeEntry): void {
    this.data.knowledgeBase.push(entry);
    this.save();
  }

  getAllKnowledgeEntries(): KnowledgeEntry[] {
    return [...this.data.knowledgeBase];
  }

  updateKnowledgeEntry(entry: KnowledgeEntry): void {
    const index = this.data.knowledgeBase.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      this.data.knowledgeBase[index] = entry;
      this.save();
    }
  }
}

