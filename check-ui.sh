#!/bin/bash

echo "Testing the Smart Retail Assistant UI..."
echo

# URL for the client application
CLIENT_URL="http://localhost:3001"
SERVER_URL="http://localhost:3002"

echo "Client URL: $CLIENT_URL"
echo "Server URL: $SERVER_URL"
echo

# Check if the server is running
echo "Checking if server is running..."
curl -s "$SERVER_URL/api/ping" > /dev/null
if [ $? -eq 0 ]; then
  echo "✓ Server is running at $SERVER_URL"
else
  echo "✗ Server is not running at $SERVER_URL"
  exit 1
fi

# Check if the client is running
echo "Checking if client is running..."
curl -s "$CLIENT_URL" > /dev/null
if [ $? -eq 0 ]; then
  echo "✓ Client is running at $CLIENT_URL"
else
  echo "✗ Client is not running at $CLIENT_URL"
  exit 1
fi

echo
echo "All systems are running! Please open the client in your browser at $CLIENT_URL"
echo "Try submitting the query: I'm looking for sustainable skincare products"
