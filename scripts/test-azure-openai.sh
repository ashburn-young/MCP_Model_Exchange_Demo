#!/bin/bash
# filepath: /afh/projects/kimyo-5913-193b8cf7-c6fc-4ba0-9f24-f7969c405f98/code/smart-retail-assistant/scripts/test-azure-openai.sh

# Set error handling
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Azure OpenAI API Connection${NC}"

# Check if Azure OpenAI API key is set
if [ -z "$AZURE_OPENAI_API_KEY" ]; then
  echo -e "${RED}Error: AZURE_OPENAI_API_KEY environment variable is not set${NC}"
  echo -e "Please set it using: export AZURE_OPENAI_API_KEY=your-api-key"
  exit 1
fi

# Check if Azure OpenAI endpoint is set
if [ -z "$AZURE_OPENAI_ENDPOINT" ]; then
  echo -e "${RED}Error: AZURE_OPENAI_ENDPOINT environment variable is not set${NC}"
  echo -e "Please set it using: export AZURE_OPENAI_ENDPOINT=your-endpoint-url"
  exit 1
fi

echo -e "${YELLOW}Using Azure OpenAI endpoint: $AZURE_OPENAI_ENDPOINT${NC}"

# Test GPT-4o
echo -e "\n${YELLOW}Testing GPT-4o model...${NC}"
curl -s -X POST $AZURE_OPENAI_ENDPOINT/openai/deployments/gpt-4o/chat/completions?api-version=2023-12-01-preview \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_OPENAI_API_KEY" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello, are you available?"}
    ],
    "max_tokens": 100
  }' | jq '.choices[0].message.content' 2>/dev/null || echo -e "${RED}Failed to connect to GPT-4o${NC}"

# Test Claude 3.5 Sonnet
echo -e "\n${YELLOW}Testing Claude 3.5 Sonnet model...${NC}"
curl -s -X POST $AZURE_OPENAI_ENDPOINT/openai/deployments/claude-3.5-sonnet/chat/completions?api-version=2023-12-01-preview \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_OPENAI_API_KEY" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello, are you available?"}
    ],
    "max_tokens": 100
  }' | jq '.choices[0].message.content' 2>/dev/null || echo -e "${RED}Failed to connect to Claude 3.5 Sonnet${NC}"

# Test Gemini 1.5 Pro
echo -e "\n${YELLOW}Testing Gemini 1.5 Pro model...${NC}"
curl -s -X POST $AZURE_OPENAI_ENDPOINT/openai/deployments/gemini-1.5-pro/chat/completions?api-version=2023-12-01-preview \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_OPENAI_API_KEY" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello, are you available?"}
    ],
    "max_tokens": 100
  }' | jq '.choices[0].message.content' 2>/dev/null || echo -e "${RED}Failed to connect to Gemini 1.5 Pro${NC}"

echo -e "\n${GREEN}Azure OpenAI API tests completed.${NC}"
echo -e "${YELLOW}Note: If any test failed, ensure that the model is deployed in your Azure OpenAI resource${NC}"
echo -e "${YELLOW}and that you have the correct deployment names configured.${NC}"
