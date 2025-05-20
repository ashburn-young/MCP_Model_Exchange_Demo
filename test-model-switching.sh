#!/bin/bash
# filepath: /afh/projects/kimyo-5913-193b8cf7-c6fc-4ba0-9f24-f7969c405f98/code/smart-retail-assistant/test-model-switching.sh
# Test script for model switching functionality

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Smart Retail Assistant - Model Switching Test =====${NC}"
echo -e "${BLUE}This script tests the dynamic model switching functionality${NC}\n"

API_URL="http://localhost:3002"

# Test 1: Get available models
echo -e "${YELLOW}Test 1: Getting available models...${NC}"
curl -s "$API_URL/api/models" | jq '.models[] | {id, name, description, strengths}'
echo

# Test 2: Make a request with default model selection
echo -e "${YELLOW}Test 2: Making a request with default model selection...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about my purchase history"}' | jq '.model, .modelSelectionReason'
echo

# Test 3: Make a request with explicit model selection
echo -e "${YELLOW}Test 3: Making a request with explicit model selection (gpt-4)...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about my purchase history", "preferredModel": "gpt-4"}' | jq '.model, .modelSelectionReason'
echo

# Test 4: Make a request with a different explicit model selection
echo -e "${YELLOW}Test 4: Making a request with explicit model selection (gpt-35-turbo)...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about my purchase history", "preferredModel": "gpt-35-turbo"}' | jq '.model, .modelSelectionReason'
echo

# Test 5: Test content-based model selection
echo -e "${YELLOW}Test 5: Content-based model selection (query contains 'complex')...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "I need a complex analysis of my purchase history"}' | jq '.model, .modelSelectionReason'
echo

# Test 6: Try an invalid model
echo -e "${YELLOW}Test 6: Trying an invalid model...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about my purchase history", "preferredModel": "invalid-model"}' | jq
echo

# Test 7: Test task-specific model selection (creative task)
echo -e "${YELLOW}Test 7: Task-specific model selection (creative marketing task)...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Create a summer promotion campaign for our eco-friendly products"}' | jq '.model, .modelSelectionReason'
echo

# Test 8: Test length-based model selection (short query)
echo -e "${YELLOW}Test 8: Length-based model selection (short query)...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Check stock"}' | jq '.model, .modelSelectionReason'
echo

# Test 9: Test inventory analytics forecasting (should select gpt-4.1)
echo -e "${YELLOW}Test 9: Testing inventory forecasting (should prefer gpt-4.1)...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Forecast demand for our skincare products for the next 90 days"}' | jq '.model, .modelSelectionReason, .serverType'
echo

# Test 10: Test inventory optimization (should select gpt-4.5-preview)
echo -e "${YELLOW}Test 10: Testing inventory optimization (should prefer gpt-4.5-preview)...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Optimize our inventory levels to maximize efficiency and minimize costs"}' | jq '.model, .modelSelectionReason, .serverType'
echo

# Test 11: Test customer preferences personalization (should select gpt-4o)
echo -e "${YELLOW}Test 11: Testing customer preferences personalization (should prefer gpt-4o)...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Analyze Alice Johnson's preferences and recommend personalized products"}' | jq '.model, .modelSelectionReason, .serverType'
echo

# Test 12: Test marketing creativity (should select gpt-4.5-preview)
echo -e "${YELLOW}Test 12: Testing marketing creativity (should prefer gpt-4.5-preview)...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Generate creative and innovative marketing ideas for our new sustainable skincare line"}' | jq '.model, .modelSelectionReason, .serverType'
echo

echo -e "${GREEN}Model switching tests completed!${NC}"
