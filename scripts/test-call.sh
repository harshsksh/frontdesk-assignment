#!/bin/bash

# Script to test the AI receptionist system
# Usage: ./scripts/test-call.sh [phone] [name] [question]

PHONE=${1:-"+1234567890"}
NAME=${2:-"Test User"}
QUESTION=${3:-"What are your hours?"}

echo "📞 Simulating call from $NAME ($PHONE)"
echo "❓ Question: $QUESTION"
echo ""

curl -X POST http://localhost:3001/api/calls/simulate \
  -H "Content-Type: application/json" \
  -d "{
    \"phone\": \"$PHONE\",
    \"name\": \"$NAME\",
    \"question\": \"$QUESTION\"
  }" \
  | python -m json.tool

