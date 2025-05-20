#!/bin/bash
# verify-model-switching.sh
# A comprehensive test script to verify model switching functionality in the deployed app

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Smart Retail Assistant - Model Switching Verification =====${NC}"
echo -e "${BLUE}Testing the dynamic model switching functionality on deployed Azure instance${NC}\n"

# Set the deployed API URL
API_URL="https://ca-retail-3f5b3811.orangemushroom-044f259b.swedencentral.azurecontainerapps.io/api"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed. Please install it to run this script.${NC}"
    echo "You can install it with: sudo apt-get install jq"
    exit 1
fi

# Function to test model selection with a specific query
test_model_selection() {
    local test_num=$1
    local description=$2
    local query=$3
    local expected_model=$4
    local preferred_model=$5
    
    echo -e "${YELLOW}Test $test_num: $description${NC}"
    
    # Build the request payload
    local payload
    if [ -z "$preferred_model" ]; then
        payload="{\"query\": \"$query\"}"
    else
        payload="{\"query\": \"$query\", \"preferredModel\": \"$preferred_model\"}"
    fi
    
    # Make the API call
    echo "Query: $query"
    
    # Use a timeout to prevent hanging if the API is unresponsive
    response=$(curl -s -m 30 -X POST "$API_URL/inquiry" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    # Check if the curl command failed
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Error: API call failed or timed out${NC}"
        return
    fi
    
    # Extract model information
    selected_model=$(echo $response | jq -r '.model // "Error: No model in response"')
    reason=$(echo $response | jq -r '.modelSelectionReason // "No reason provided"')
    
    # Check if we got a valid response
    if [[ "$selected_model" == *"Error"* ]] || [[ "$response" == *"error"* ]]; then
        echo -e "${RED}✗ Error in API response: $response${NC}"
        return
    fi
    
    # Display the results
    echo "Expected model: $expected_model"
    echo "Selected model: $selected_model"
    echo "Selection reason: $reason"
    
    # Check if the expected model matches the selected model
    if [ "$selected_model" == "$expected_model" ]; then
        echo -e "${GREEN}✓ Test passed: Model selection matched expectation${NC}"
    else
        echo -e "${RED}✗ Test failed: Model selection did not match expectation${NC}"
    fi
    
    # Add a delay to avoid rate limiting
    sleep 2
    echo
}

# Test 0: Verify API is accessible
echo -e "${YELLOW}Test 0: Checking if API is accessible...${NC}"
curl_result=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/models")
if [ "$curl_result" = "200" ]; then
    echo -e "${GREEN}✓ API is accessible${NC}"
else
    echo -e "${RED}✗ Error: Cannot access API at $API_URL - HTTP Status: $curl_result${NC}"
    echo "Please check your connection or update the API_URL variable."
    
    # Print some debug info but continue execution
    echo -e "${YELLOW}Attempting to get more debugging information...${NC}"
    curl -v "$API_URL/models"
    echo
    echo -e "${YELLOW}Continuing tests anyway...${NC}"
fi
echo

# ===== COMPLEXITY-BASED TESTS =====
# Test 1: Complex analysis (should prefer gpt-4o)
test_model_selection 1 "Complex analysis query" \
    "I need a complex, detailed breakdown of our inventory to understand supply chain bottlenecks and optimize our ordering process." \
    "gpt-4o"

# Test 2: Quick, simple query (should prefer gpt-35-turbo)
test_model_selection 2 "Quick, simple query" \
    "What are our bestselling products this week?" \
    "gpt-35-turbo"

# ===== ANALYTICS-BASED TESTS =====
# Test 3: Analytics and trend analysis (should prefer gpt-4.1)
test_model_selection 3 "Analytics and forecasting query" \
    "Analyze the sales trends for skincare products over the last 6 months and predict the next quarter's performance." \
    "gpt-4.1"

# ===== CREATIVE CONTENT TESTS =====
# Test 4: Creative marketing content (should prefer gpt-4.5-preview)
test_model_selection 4 "Creative marketing content generation" \
    "Create an innovative summer marketing campaign with compelling slogans for our new organic skincare line." \
    "gpt-4.5-preview"

# ===== QUERY LENGTH TESTS =====
# Test 5: Very short query (should prefer gpt-35-turbo for efficiency)
test_model_selection 5 "Very short query" \
    "Check stock levels." \
    "gpt-35-turbo"

# Test 6: Very long, detailed query (should prefer more capable models)
test_model_selection 6 "Long, detailed query" \
    "I'm looking to understand the complex interrelationship between our customer demographics, purchasing patterns, and product preferences across multiple store locations. I need a thorough analysis that includes seasonal variations, price sensitivity factors, and correlation with marketing campaigns we've run over the past 18 months. Additionally, I'd like to identify any emerging trends or anomalies that might inform our strategy for the upcoming fiscal year." \
    "gpt-4o"

# ===== DOMAIN-SPECIFIC TESTS =====
# Test 7: Inventory analytics (should prefer gpt-4 or gpt-4.1)
test_model_selection 7 "Inventory analysis query" \
    "What are our current inventory levels for all skincare products, and which items need to be restocked?" \
    "gpt-4"

# Test 8: Customer preferences (should prefer gpt-4o)
test_model_selection 8 "Customer preferences query" \
    "Analyze Sarah Johnson's purchase history and recommend personalized products based on her preferences." \
    "gpt-4o"

# Test 9: Marketing optimization (should prefer gpt-4.5-preview)
test_model_selection 9 "Marketing optimization query" \
    "Design a creative loyalty program that will increase customer retention for our premium skincare line." \
    "gpt-4.5-preview"

# ===== EXPLICIT MODEL SELECTION TESTS =====
# Test 10: Explicit model selection (overriding content-based selection)
test_model_selection 10 "Explicit model selection" \
    "Analyze the complex patterns in our customer data." \
    "gpt-35-turbo" \
    "gpt-35-turbo"

# ===== MIXED INTENT TESTS =====
# Test 11: Mixed signals - analytics with creative elements
test_model_selection 11 "Mixed signals - analytics with creative elements" \
    "Forecast our Q3 sales trends and create a marketing strategy to address any projected shortfalls." \
    "gpt-4.1"

# Test 12: Mixed signals - simple query with complex terms
test_model_selection 12 "Mixed signals - simple query with complex terms" \
    "Quick summary of our complex inventory analytics." \
    "gpt-35-turbo"

echo -e "${GREEN}All model switching verification tests completed!${NC}"
echo -e "${BLUE}Review the results above to verify that model switching is working as expected.${NC}"
