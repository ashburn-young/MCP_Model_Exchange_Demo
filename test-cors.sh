#!/bin/bash

# This script tests the connection between the React client and the server
# to identify any potential CORS or networking issues

echo "=== Smart Retail Assistant API Connection Test ==="
echo

echo "Testing server ping endpoint..."
curl -v http://localhost:3002/api/ping 2>&1 | grep -E 'Access-Control-Allow|< HTTP'
echo

echo "Testing inquiry endpoint with CORS headers..."
curl -v -X OPTIONS http://localhost:3002/api/inquiry \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" 2>&1 | grep -E 'Access-Control-Allow|< HTTP'
echo

echo "Testing full inquiry endpoint (POST request)..."
curl -v -X POST http://localhost:3002/api/inquiry \
  -H "Origin: http://localhost:3001" \
  -H "Content-Type: application/json" \
  -d '{"query":"Test CORS request", "customerName":"Test User"}' 2>&1 | grep -E 'Access-Control-Allow|< HTTP'
echo

echo "=== Test Complete ==="
