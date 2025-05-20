#!/bin/bash
# Test script for model analytics functionality

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Smart Retail Assistant - Model Analytics Test =====${NC}"
echo -e "${BLUE}This script tests the model analytics functionality${NC}\n"

API_URL="http://localhost:3002"

# Reset analytics data to start fresh
echo -e "${YELLOW}Resetting analytics data...${NC}"
curl -s -X POST "$API_URL/api/reset-analytics" | jq
echo

# Make a few test requests to generate analytics data
echo -e "${YELLOW}Making test requests to generate analytics data...${NC}"

# Test 1: Customer query
echo -e "${YELLOW}Test 1: Customer preferences query...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are my purchase preferences?"}' > /dev/null
echo "Request completed"

# Test 2: Inventory query
echo -e "${YELLOW}Test 2: Inventory query...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Check current inventory for face moisturizers"}' > /dev/null
echo "Request completed"

# Test 3: Marketing query with explicit model
echo -e "${YELLOW}Test 3: Marketing query with explicit model selection...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Create a summer promotion for skincare products", "preferredModel": "gpt-4.5-preview"}' > /dev/null
echo "Request completed"

# Test 4: Analytics query
echo -e "${YELLOW}Test 4: Analytics query...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "Analyze sales trends for organic products in Q2"}' > /dev/null
echo "Request completed"

# Test 5: Simple query
echo -e "${YELLOW}Test 5: Simple query...${NC}"
curl -s -X POST "$API_URL/api/inquiry" \
  -H "Content-Type: application/json" \
  -d '{"query": "List active promotions"}' > /dev/null
echo "Request completed"

# Fetch analytics data
echo -e "\n${YELLOW}Fetching model selection analytics data...${NC}"
curl -s "$API_URL/api/model-analytics" | jq
echo

echo -e "${GREEN}Model analytics tests completed!${NC}"
