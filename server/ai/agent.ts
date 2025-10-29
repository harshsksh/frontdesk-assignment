import { CustomerModel, HelpRequestModel, KnowledgeBaseModel } from '../database/models';
import { HelpRequest, KnowledgeEntry } from '../../shared/types';

export interface CallContext {
  customerPhone: string;
  customerName: string;
}

export class AIAgent {
  private businessInfo: Map<string, string>;
  
  constructor(
    private customerModel: CustomerModel,
    private helpRequestModel: HelpRequestModel,
    private knowledgeBase: KnowledgeBaseModel
  ) {
    // Initialize with basic salon business info
    this.businessInfo = new Map([
      ['hours', 'We are open Monday through Friday from 9 AM to 7 PM, Saturday from 10 AM to 5 PM, and closed on Sundays.'],
      ['location', 'We are located at 123 Main Street, Downtown District.'],
      ['phone', 'You can reach us at (555) 123-4567.'],
      ['booking', 'You can book an appointment by calling us or visiting our website.'],
      ['services', 'We offer haircuts, styling, coloring, and spa treatments.'],
    ]);
  }
  
  /**
   * Simulates receiving a phone call
   */
  async receiveCall(phone: string, name: string): Promise<CallContext> {
    console.log(`📞 Incoming call from ${name} (${phone})`);
    
    // Get or create customer
    const customer = this.customerModel.createOrGet(phone, name);
    
    return {
      customerPhone: customer.phone,
      customerName: customer.name,
    };
  }
  
  /**
   * Processes a question from a caller
   * Returns the answer if known, or null if escalation is needed
   */
  async processQuestion(context: CallContext, question: string): Promise<string | null> {
    console.log(`\n🤖 AI Processing question from ${context.customerName}: "${question}"`);
    
    // Check business info first
    const businessAnswer = this.checkBusinessInfo(question);
    if (businessAnswer) {
      console.log(`✅ AI Responded: "${businessAnswer}"`);
      return businessAnswer;
    }
    
    // Check knowledge base
    const kbAnswer = this.knowledgeBase.findAnswer(question);
    if (kbAnswer) {
      console.log(`✅ AI Responded (from KB): "${kbAnswer.answer}"`);
      return kbAnswer.answer;
    }
    
    // Unknown question - escalate
    console.log(`❓ Unknown question - escalating to supervisor`);
    return null;
  }
  
  /**
   * Creates a help request when AI doesn't know the answer
   */
  async escalateQuestion(context: CallContext, question: string): Promise<HelpRequest> {
    const customer = this.customerModel.createOrGet(context.customerPhone, context.customerName);
    const request = this.helpRequestModel.create(
      customer.id,
      context.customerPhone,
      context.customerName,
      question
    );
    
    console.log(`\n🚨 HELP REQUEST CREATED:`);
    console.log(`   Request ID: ${request.id}`);
    console.log(`   Customer: ${request.customerName} (${request.customerPhone})`);
    console.log(`   Question: "${request.question}"`);
    console.log(`   Status: ${request.status}`);
    
    // Simulate supervisor notification
    this.notifySupervisor(request);
    
    return request;
  }
  
  /**
   * Follows up with customer after supervisor response
   */
  async followUpWithCustomer(request: HelpRequest): Promise<void> {
    if (!request.supervisorAnswer) {
      throw new Error('Cannot follow up without supervisor answer');
    }
    
    console.log(`\n📱 FOLLOW-UP MESSAGE TO ${request.customerName} (${request.customerPhone}):`);
    console.log(`   "${request.supervisorAnswer}"`);
    
    // Update customer's last contacted time
    this.customerModel.updateLastContacted(request.customerPhone);
  }
  
  /**
   * Updates knowledge base with supervisor's answer
   */
  async learnFromResponse(request: HelpRequest): Promise<KnowledgeEntry> {
    if (!request.supervisorAnswer) {
      throw new Error('Cannot learn without supervisor answer');
    }
    
    const entry = this.knowledgeBase.addEntry(
      request.question,
      request.supervisorAnswer,
      request.id
    );
    
    console.log(`\n🧠 KNOWLEDGE BASE UPDATED:`);
    console.log(`   Question: "${entry.question}"`);
    console.log(`   Answer: "${entry.answer}"`);
    
    return entry;
  }
  
  private checkBusinessInfo(question: string): string | null {
    const questionLower = question.toLowerCase();
    
    for (const [key, answer] of this.businessInfo.entries()) {
      if (questionLower.includes(key) || 
          (key === 'hours' && (questionLower.includes('open') || questionLower.includes('time'))) ||
          (key === 'location' && questionLower.includes('where'))) {
        return answer;
      }
    }
    
    return null;
  }
  
  private notifySupervisor(request: HelpRequest): void {
    console.log(`\n🔔 SUPERVISOR NOTIFICATION:`);
    console.log(`   Hey supervisor! I need help answering this question:`);
    console.log(`   From: ${request.customerName} (${request.customerPhone})`);
    console.log(`   Question: "${request.question}"`);
    console.log(`   Request ID: ${request.id}`);
    console.log(`   Please check the supervisor panel and provide an answer.`);
  }
}

