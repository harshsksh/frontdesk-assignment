# Design Document

## System Architecture

### High-Level Flow

```
Customer Call → AI Agent → Check Knowledge → [Known | Unknown]
                                      ↓
                               Escalate Request
                                      ↓
                              Supervisor Panel
                                      ↓
                              Supervisor Responds
                                      ↓
                    [Update Knowledge Base] + [Follow-up Customer]
```

### Core Components

#### 1. AI Agent Module (`server/ai/agent.ts`)

**Responsibilities:**
- Receives and processes customer calls
- Checks business information (hardcoded salon info)
- Searches knowledge base for similar questions
- Escalates unknown questions to supervisors
- Follows up with customers after supervisor responses
- Updates knowledge base from supervisor answers

**Key Methods:**
- `receiveCall()`: Simulates incoming call, creates/updates customer
- `processQuestion()`: Determines if AI can answer or needs escalation
- `escalateQuestion()`: Creates help request and notifies supervisor
- `followUpWithCustomer()`: Sends answer back to customer
- `learnFromResponse()`: Adds supervisor answer to knowledge base

#### 2. Database Layer (`server/database/`)

**Schema Design:**

**Customers Table:**
- Purpose: Track customer relationships
- Key Fields: `id`, `phone` (unique), `name`, `last_contacted_at`
- Use Case: Link requests to customers, track interaction history

**Help Requests Table:**
- Purpose: Manage escalation lifecycle
- Key Fields: `id`, `customer_id` (FK), `question`, `status`, `timeout_at`, `supervisor_answer`
- States: `pending` → `resolved` | `unresolved` (on timeout)
- Timeout: 5 minutes (configurable)

**Knowledge Base Table:**
- Purpose: Store learned answers for reuse
- Key Fields: `question`, `answer`, `source_request_id` (traceability), `usage_count`
- Matching: Currently keyword-based (see future improvements)

**Design Decisions:**
- **SQLite for MVP**: Easy setup, single-file database
- **Foreign Keys**: Ensure data integrity (customer_id references customers)
- **Denormalization**: `customer_phone` and `customer_name` stored in requests for quick access
- **Indexes**: On `status`, `customer_id`, `phone` for performance

#### 3. API Layer (`server/api/routes.ts`)

**Endpoints:**
- `POST /api/calls/simulate`: Main entry point for testing
- `GET /api/requests/pending`: Supervisor dashboard data
- `GET /api/requests`: Request history
- `POST /api/requests/:id/resolve`: Supervisor response
- `GET /api/knowledge`: View learned answers

**Error Handling:**
- All endpoints wrapped in try-catch
- Returns appropriate HTTP status codes
- Logs errors for debugging

#### 4. Supervisor UI (`ui/src/`)

**Components:**
- **RequestList**: Displays list of requests with status badges
- **RequestDetail**: Shows full request info and answer form
- **KnowledgeBase**: Displays all learned answers

**Features:**
- Auto-refresh every 5 seconds for pending requests
- Real-time status updates
- Clean, minimal UI focused on task completion
- Responsive design for mobile/tablet

#### 5. Timeout Handler (`server/services/timeoutHandler.ts`)

**Purpose:** Background service to handle request timeouts gracefully

**Behavior:**
- Runs every minute (configurable)
- Checks pending requests for timeout
- Automatically marks timed-out requests as `unresolved`
- Prevents stale requests from blocking supervisor workflow

## Key Design Decisions

### 1. Knowledge Base Matching Strategy

**Current Implementation:**
- Simple keyword matching
- Compares question words with knowledge base entries
- Requires ~50% word overlap for match

**Why:**
- No external dependencies for MVP
- Fast and predictable
- Good enough for demonstration

**Future Improvement:**
- Use semantic embeddings (OpenAI Ada, Sentence Transformers)
- Vector database (Pinecone, Weaviate) for similarity search
- Much more accurate matching for natural language variations

### 2. Request Timeout Handling

**Current:**
- Fixed 5-minute timeout
- Automatic escalation to `unresolved` status
- Background service polls every minute

**Why:**
- Ensures requests don't hang forever
- Graceful degradation if supervisor unavailable
- Simple to implement and understand

**Future:**
- Configurable per-request timeouts
- Customer notification on timeout
- Retry mechanism
- Priority-based timeouts

### 3. Customer Relationship Tracking

**Design:**
- Customers stored separately from requests
- `last_contacted_at` tracks interaction recency
- Foreign key ensures data integrity

**Benefits:**
- Can build customer profiles over time
- Track repeat customers
- Future: CRM integration, personalization

### 4. Supervisor Notification

**Current:**
- Console log (for testing)
- Supervisor must check UI panel

**Future:**
- WebSocket push notifications
- Email/SMS alerts
- Slack/Teams integration
- Mobile app notifications

### 5. Follow-up Mechanism

**Current:**
- Simulated via console log
- Updates customer `last_contacted_at`

**Future:**
- SMS integration (Twilio, Vonage)
- Email follow-up
- Phone callback
- WhatsApp integration

## Scalability Path

### Phase 1: Current (10-100 requests/day)
- SQLite database
- Single server process
- In-memory keyword matching
- Polling-based supervisor notifications

### Phase 2: Medium Scale (100-1000 requests/day)
- **Database**: PostgreSQL with connection pooling
- **Knowledge Base**: Vector embeddings with Pinecone
- **Notifications**: WebSocket for real-time alerts
- **Background Jobs**: Bull queue for timeout handling
- **Caching**: Redis for frequently accessed data

### Phase 3: Large Scale (1000+ requests/day)
- **Microservices**: Split AI agent, API, supervisor UI
- **Database**: Read replicas for supervisor panel
- **Load Balancing**: Multiple API instances
- **Monitoring**: Prometheus, Grafana
- **Logging**: Centralized logging (ELK stack)

## Security Considerations

### Current (MVP)
- No authentication (local development)
- No rate limiting
- Direct database access

### Production Requirements
- Authentication for supervisor panel (JWT, OAuth)
- Rate limiting on API endpoints
- Database query sanitization (already using parameterized queries)
- HTTPS enforcement
- Input validation and sanitization
- Audit logging for sensitive operations

## Testing Strategy

### Manual Testing (Current)
- Script-based call simulation
- UI testing through browser
- Console log verification

### Future Automated Testing
- Unit tests for AI agent logic
- Integration tests for API endpoints
- E2E tests for supervisor workflow
- Knowledge base matching accuracy tests
- Load testing for scalability validation

## Known Limitations

1. **Knowledge Base Matching**: Simple keyword matching may miss semantic similarity
2. **No Duplicate Detection**: Multiple similar requests can create duplicate KB entries
3. **No Answer Quality Control**: Supervisor answers added to KB without validation
4. **Single Business Context**: Hardcoded salon info, not multi-tenant
5. **No Analytics**: No metrics on AI performance, request resolution time, etc.

## Future Enhancements

1. **AI Confidence Scoring**: AI provides confidence level before escalating
2. **Answer Templates**: Pre-approved answers for common questions
3. **KB Management**: Edit/delete/merge knowledge base entries
4. **Customer Feedback**: Allow customers to rate AI responses
5. **A/B Testing**: Test different AI response strategies
6. **Multi-language Support**: Internationalization
7. **Voice Integration**: LiveKit for real phone calls
8. **Analytics Dashboard**: Request metrics, AI performance
9. **Smart Timeouts**: Priority-based timeout handling
10. **Answer Suggestions**: AI suggests answers based on KB

