#!/bin/bash

# Test the API with a customer preferences query
echo "Testing customer preferences query..."
curl -X POST http://localhost:3002/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{"query":"I want to know about my purchase history", "customerName":"Alice Johnson"}' | jq

echo "Testing inventory query..."
curl -X POST http://localhost:3002/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{"query":"Is the organic aloe vera moisturizer in stock?", "customerName":"Alice Johnson"}' | jq

echo "Testing marketing query..."
curl -X POST http://localhost:3002/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{"query":"What promotions do you have for sustainable products?", "customerName":"Alice Johnson"}' | jq
