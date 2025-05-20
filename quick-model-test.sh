#!/bin/bash
# quick-model-test.sh
# A simplified test script to quickly verify model switching functionality

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Smart Retail Assistant - Quick Model Switching Test =====${NC}"

# Set the deployed API URL
API_URL="https://ca-retail-3f5b3811.orangemushroom-044f259b.swedencentral.azurecontainerapps.io/api"

# Function to test a query and print the selected model
test_query() {
    local description=$1
    local query=$2
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "Query: \"$query\""
    
    # Make the API call with a timeout
    response=$(curl -s -m 30 -X POST "$API_URL/inquiry" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}")
    
    # Check if the curl command failed
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Error: API call failed or timed out${NC}"
        return
    fi
    
    # Extract and display the model
    model=$(echo $response | jq -r '.model // "Error: No model in response"')
    reason=$(echo $response | jq -r '.modelSelectionReason // "No reason provided"')
    
    if [[ "$model" == *"Error"* ]] || [[ "$response" == *"error"* ]]; then
        echo -e "${RED}✗ Error in API response: $response${NC}"
        return
    fi
    
    echo -e "Selected model: ${GREEN}$model${NC}"
    echo "Reason: $reason"
    echo
    
    # Add a delay to avoid rate limiting
    sleep 3
}

# 1. Test a simple query (should prefer gpt-35-turbo)
test_query "Simple Query" "What are our bestselling products?"

# 2. Test a complex query (should prefer gpt-4o)
test_query "Complex Query" "I need a complex, detailed analysis of our inventory levels across all stores."

# 3. Test a creative query (should prefer gpt-4.5-preview)
test_query "Creative Query" "Create an innovative marketing campaign for our summer skincare collection."

# 4. Test an analytics query (should prefer gpt-4.1)
test_query "Analytics Query" "Analyze the sales trends for the last quarter and forecast the next quarter."

echo -e "${BLUE}Quick model switching tests completed!${NC}"
