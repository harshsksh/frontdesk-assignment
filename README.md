# Frontdesk AI Receptionist System

A human-in-the-loop system for AI agents managing customer relationships end-to-end. The system allows AI receptionists to handle customer calls, escalate unknown questions to human supervisors, and automatically update their knowledge base from supervisor responses.

## Overview

This system simulates AI receptionists receiving phone calls and includes:

- **AI Agent**: Responds to known questions using business info and knowledge base
- **Escalation System**: Creates help requests when AI doesn't know the answer
- **Supervisor Panel**: Web UI for supervisors to view and respond to requests
- **Knowledge Base**: Automatically learns from supervisor responses
- **Follow-up System**: Automatically notifies customers after supervisor responds

## Architecture

### Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: SQLite (better-sqlite3) - easily migratable to PostgreSQL/DynamoDB
- **Frontend**: React + TypeScript + Vite
- **AI**: Simulated AI agent (can be extended with LiveKit or other providers)

### Project Structure

```
frontdesk-assign/
├── server/                 # Backend application
│   ├── ai/                # AI agent logic
│   │   └── agent.ts       # Main AI agent class
│   ├── api/               # API routes
│   │   └── routes.ts      # Express routes
│   ├── database/          # Database layer
│   │   ├── schema.ts      # Database schema & initialization
│   │   └── models.ts      # Data models (Customers, Requests, Knowledge)
│   ├── services/          # Background services
│   │   └── timeoutHandler.ts  # Handles request timeouts
│   └── index.ts           # Server entry point
├── shared/                # Shared types between frontend/backend
│   └── types.ts           # TypeScript interfaces
├── ui/                    # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── RequestList.tsx
│   │   │   ├── RequestDetail.tsx
│   │   │   └── KnowledgeBase.tsx
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # React entry point
│   └── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- TypeScript 5+

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the TypeScript backend:**
   ```bash
   npm run build
   ```

3. **Start the backend server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3001`

4. **In a separate terminal, start the frontend dev server:**
   ```bash
   npm run dev:ui
   ```
   The UI will be available at `http://localhost:3000`

5. **Access the Supervisor Panel:**
   Open `http://localhost:3000` in your browser

## Usage

### Simulating a Call

You can simulate an incoming call by making a POST request to the API:

```bash
curl -X POST http://localhost:3001/api/calls/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "name": "John Doe",
    "question": "What are your hours?"
  }'
```

**Known questions** (AI responds directly):
- "What are your hours?" / "When are you open?"
- "Where are you located?" / "What is your address?"
- "What services do you offer?"
- "How can I book an appointment?"
- "What is your phone number?"

**Unknown questions** will create a help request and escalate to supervisors.

### Supervisor Workflow

1. **View Pending Requests**: Open the supervisor panel and click "Pending Requests"
2. **Select a Request**: Click on any pending request to see details
3. **Provide Answer**: Enter your answer in the text area
4. **Submit**: Click "Submit Answer"
5. **System Actions** (automatic):
   - Customer is notified (simulated via console log)
   - Knowledge base is updated
   - Request is marked as resolved

### Features

- **Auto-refresh**: Pending requests refresh every 5 seconds
- **Request History**: View all past requests (resolved/unresolved)
- **Knowledge Base**: View all learned answers with usage statistics
- **Timeout Handling**: Requests automatically timeout after 5 minutes if not answered

## Design Decisions

### Database Schema

**Customers Table**
- Stores customer phone numbers and names
- Tracks last contacted timestamp
- Enables customer relationship tracking

**Help Requests Table**
- Links to customers via foreign key
- Status: `pending`, `resolved`, `unresolved`
- Includes timeout tracking for graceful degradation
- Stores supervisor responses for audit trail

**Knowledge Base Table**
- Stores question-answer pairs
- Links back to source request (traceability)
- Tracks usage statistics for optimization
- Enables answer reuse across similar questions

### Escalation Flow

1. AI receives question → checks business info → checks knowledge base
2. If unknown → create help request → notify supervisor (console log)
3. Supervisor responds → update request → update knowledge base → follow up with customer
4. Future similar questions → answered automatically from knowledge base

### Knowledge Base Matching

Currently uses simple keyword matching:
- Compares question words with knowledge base entries
- Requires ~50% word overlap for match
- **Future improvement**: Use semantic search/embeddings (OpenAI, Pinecone, etc.)

### Scalability Considerations

**Current Design (10-100 requests/day):**
- SQLite for simplicity
- In-memory keyword matching
- Simple polling for supervisor notifications

**Scale to 1000+ requests/day:**
1. **Database**: Migrate to PostgreSQL or DynamoDB
   - Add connection pooling
   - Use read replicas for supervisor panel
2. **Knowledge Base**: 
   - Implement vector embeddings (OpenAI Ada)
   - Use vector DB (Pinecone, Weaviate) for semantic search
3. **Notifications**:
   - WebSocket for real-time supervisor alerts
   - Queue system (Redis, SQS) for request processing
4. **Request Timeouts**:
   - Background job queue (Bull, Agenda.js)
   - More sophisticated timeout strategies
5. **Multi-tenancy**:
   - Add business/tenant isolation
   - Per-tenant knowledge bases

### Error Handling

- Database errors are caught and logged
- API returns appropriate HTTP status codes
- Failed requests don't crash the server
- Timeout handler gracefully handles failures

### Missing Features (Future Enhancements)

- **Real phone integration**: Currently simulated via API
- **LiveKit integration**: For real-time voice handling
- **Email notifications**: Real supervisor notifications
- **Analytics dashboard**: Request metrics, AI confidence scores
- **Knowledge base management**: Edit/delete learned answers
- **Multi-language support**: Internationalization
- **A/B testing**: Test different AI response strategies

## API Endpoints

### `POST /api/calls/simulate`
Simulate an incoming call with a question.

**Request:**
```json
{
  "phone": "+1234567890",
  "name": "John Doe",
  "question": "What are your hours?"
}
```

**Response:**
```json
{
  "success": true,
  "respondedBy": "ai" | "escalated",
  "answer": "...",  // if respondedBy is "ai"
  "requestId": "...",  // if respondedBy is "escalated"
  "context": { ... }
}
```

### `GET /api/requests/pending`
Get all pending help requests.

### `GET /api/requests`
Get all requests (with optional `?limit=100` query param).

### `GET /api/requests/:id`
Get a specific request by ID.

### `POST /api/requests/:id/resolve`
Resolve a request with a supervisor answer.

**Request:**
```json
{
  "answer": "We are open Monday-Friday 9am-7pm",
  "supervisorId": "supervisor-1"
}
```

### `GET /api/knowledge`
Get all knowledge base entries.

## Development

### Scripts

- `npm run build` - Build TypeScript backend
- `npm run start` - Run production server
- `npm run dev` - Run dev server with hot reload
- `npm run dev:ui` - Run frontend dev server
- `npm run build:ui` - Build frontend for production

### Testing the System

1. Start both servers (backend + frontend)
2. Open supervisor panel in browser
3. Simulate calls with known questions (AI responds)
4. Simulate calls with unknown questions (creates requests)
5. Answer requests in supervisor panel
6. Simulate similar questions again (should be answered from KB)

## License

MIT

