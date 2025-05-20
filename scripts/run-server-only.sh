#!/bin/bash
# Simple script to start only the main server without relying on MCP servers

# Set environment variables
export PORT=3005
export NODE_ENV=development
export AZURE_OPENAI_ENDPOINT=https://oaimodels.openai.azure.com/
export AZURE_OPENAI_API_KEY=3Jlvh7bHjguxnlzAGtJMwLr7RI6cNKLe6PrMpAIeWRxPnbUhT30EJQQJ99BDACfhMk5XJ3w3AAABACOGaWoA
export AZURE_OPENAI_MODEL_GROUP=oaimodels

echo "Starting Smart Retail Assistant server on port 3005..."
echo "Using Azure OpenAI endpoint: $AZURE_OPENAI_ENDPOINT"

# Start the server
cd "$(dirname "$0")/.." || exit 1
node src/server/index.js
