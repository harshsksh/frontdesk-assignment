# Example API Queries

Use these examples to test the system. Make sure the server is running on `http://localhost:3001`.

## Known Questions (AI responds directly)

```bash
# Business hours
curl -X POST http://localhost:3001/api/calls/simulate \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "name": "Alice", "question": "What are your hours?"}'

# Location
curl -X POST http://localhost:3001/api/calls/simulate \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567891", "name": "Bob", "question": "Where are you located?"}'

# Services
curl -X POST http://localhost:3001/api/calls/simulate \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567892", "name": "Charlie", "question": "What services do you offer?"}'
```

## Unknown Questions (Creates help request)

```bash
# Pricing question
curl -X POST http://localhost:3001/api/calls/simulate \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567893", "name": "Diana", "question": "How much does a haircut cost?"}'

# Gift cards
curl -X POST http://localhost:3001/api/calls/simulate \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567894", "name": "Eve", "question": "Do you sell gift cards?"}'

# Pet policy
curl -X POST http://localhost:3001/api/calls/simulate \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567895", "name": "Frank", "question": "Can I bring my dog?"}'
```

## After Supervisor Answers

Once a supervisor answers an unknown question, try asking a similar question again:

```bash
# Similar to the gift card question above
curl -X POST http://localhost:3001/api/calls/simulate \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567894", "name": "Eve", "question": "Do you have gift certificates?"}'
```

The AI should now answer from the knowledge base!

## Check Pending Requests

```bash
curl http://localhost:3001/api/requests/pending
```

## View Knowledge Base

```bash
curl http://localhost:3001/api/knowledge
```

