import { Router } from 'express';
import { AIAgent, CallContext } from '../ai/agent';
import { CustomerModel, HelpRequestModel, KnowledgeBaseModel } from '../database/models';

export function createRoutes(
  aiAgent: AIAgent,
  helpRequestModel: HelpRequestModel,
  knowledgeBaseModel: KnowledgeBaseModel
): Router {
  const router = Router();
  
  // Simulate incoming call
  router.post('/api/calls/simulate', async (req, res) => {
    try {
      const { phone, name, question } = req.body;
      
      if (!phone || !name || !question) {
        return res.status(400).json({ error: 'Missing required fields: phone, name, question' });
      }
      
      // Receive call
      const context = await aiAgent.receiveCall(phone, name);
      
      // Process question
      const answer = await aiAgent.processQuestion(context, question);
      
      if (answer) {
        // AI knew the answer
        return res.json({
          success: true,
          respondedBy: 'ai',
          answer,
          context,
        });
      } else {
        // Escalate to supervisor
        const request = await aiAgent.escalateQuestion(context, question);
        return res.json({
          success: true,
          respondedBy: 'escalated',
          message: 'Checking with supervisor...',
          requestId: request.id,
          context,
        });
      }
    } catch (error: any) {
      console.error('Error simulating call:', error);
      return res.status(500).json({ error: error.message });
    }
  });
  
  // Get pending requests
  router.get('/api/requests/pending', (req, res) => {
    try {
      const requests = helpRequestModel.getPending();
      return res.json({ requests });
    } catch (error: any) {
      console.error('Error getting pending requests:', error);
      return res.status(500).json({ error: error.message });
    }
  });
  
  // Get all requests
  router.get('/api/requests', (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const requests = helpRequestModel.getAll(limit);
      return res.json({ requests });
    } catch (error: any) {
      console.error('Error getting requests:', error);
      return res.status(500).json({ error: error.message });
    }
  });
  
  // Get single request
  router.get('/api/requests/:id', (req, res) => {
    try {
      const request = helpRequestModel.getById(req.params.id);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      return res.json({ request });
    } catch (error: any) {
      console.error('Error getting request:', error);
      return res.status(500).json({ error: error.message });
    }
  });
  
  // Resolve request
  router.post('/api/requests/:id/resolve', async (req, res) => {
    try {
      const { answer, supervisorId } = req.body;
      
      if (!answer) {
        return res.status(400).json({ error: 'Answer is required' });
      }
      
      const request = helpRequestModel.resolve(
        req.params.id,
        answer,
        supervisorId || 'supervisor-1'
      );
      
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      // Update knowledge base
      await aiAgent.learnFromResponse(request);
      
      // Follow up with customer
      await aiAgent.followUpWithCustomer(request);
      
      return res.json({
        success: true,
        request,
        message: 'Request resolved and customer notified',
      });
    } catch (error: any) {
      console.error('Error resolving request:', error);
      return res.status(500).json({ error: error.message });
    }
  });
  
  // Get knowledge base entries
  router.get('/api/knowledge', (req, res) => {
    try {
      const entries = knowledgeBaseModel.getAll();
      return res.json({ entries });
    } catch (error: any) {
      console.error('Error getting knowledge base:', error);
      return res.status(500).json({ error: error.message });
    }
  });
  
  return router;
}

