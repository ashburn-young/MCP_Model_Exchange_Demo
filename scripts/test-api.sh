#!/bin/bash
# Test the Smart Retail Assistant API

echo "Testing Smart Retail Assistant API..."
echo "Sending a test query to the server..."

curl -X POST http://localhost:3002/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{"query": "What products would you recommend based on my purchase history?", "customerName": "Alice Johnson"}' \
  | json_pp

echo -e "\n\nTesting another query type..."

curl -X POST http://localhost:3002/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{"query": "Is the organic aloe vera moisturizer currently in stock?", "customerName": "Alice Johnson"}' \
  | json_pp

echo -e "\n\nDone testing."
