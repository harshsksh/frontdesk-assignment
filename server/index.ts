import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database/schema';
import { CustomerModel, HelpRequestModel, KnowledgeBaseModel } from './database/models';
import { AIAgent } from './ai/agent';
import { createRoutes } from './api/routes';
import { TimeoutHandler } from './services/timeoutHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database (file-based storage, no SQLite needed)
const storage = initializeDatabase();
const customerModel = new CustomerModel(storage);
const helpRequestModel = new HelpRequestModel(storage);
const knowledgeBaseModel = new KnowledgeBaseModel(storage);

// Initialize AI agent
const aiAgent = new AIAgent(customerModel, helpRequestModel, knowledgeBaseModel);

// Set up routes
const routes = createRoutes(aiAgent, helpRequestModel, knowledgeBaseModel);
app.use(routes);

// Start timeout handler
const timeoutHandler = new TimeoutHandler(helpRequestModel);
timeoutHandler.start();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`\n💡 Try simulating a call with:`);
  console.log(`   POST http://localhost:${PORT}/api/calls/simulate`);
  console.log(`   Body: { "phone": "+1234567890", "name": "John Doe", "question": "What are your hours?" }`);
});

