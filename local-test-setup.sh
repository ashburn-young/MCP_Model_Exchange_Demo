#!/bin/bash
# local-test-setup.sh - Setup and run local testing for model switching

# Set error handling
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${YELLOW}Starting local test environment for model switching...${NC}"

# Check if environment file exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  echo -e "${RED}Error: .env file not found in $PROJECT_ROOT${NC}"
  
  # Check if there's an example file we can copy
  if [ -f "$PROJECT_ROOT/.env.example" ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
    echo -e "${GREEN}Created .env file. You may need to update it with your Azure OpenAI credentials.${NC}"
  else
    # Create a minimal .env file
    echo -e "${YELLOW}Creating a minimal .env file...${NC}"
    cat > "$PROJECT_ROOT/.env" << EOF
PORT=3002
# Add your Azure OpenAI credentials below
# AZURE_OPENAI_API_KEY=your-key-here
# AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
# AZURE_OPENAI_MODEL_GROUP=your-deployment-name
EOF
    echo -e "${GREEN}Created minimal .env file. Please update it with your Azure OpenAI credentials.${NC}"
  fi
fi

# Create a local version of the test web interface
echo -e "${YELLOW}Creating local test web interface...${NC}"
cp "$PROJECT_ROOT/test-model-switching-web.html" "$PROJECT_ROOT/test-model-switching-local.html"

# Update the API URL in the local test interface
sed -i 's|https://ca-retail-3f5b3811.orangemushroom-044f259b.swedencentral.azurecontainerapps.io/api|http://localhost:3005/api|g' "$PROJECT_ROOT/test-model-switching-local.html"

# Create a quick test script for local testing
cat > "$PROJECT_ROOT/test-local.sh" << EOF
#!/bin/bash
# test-local.sh - Quick test for local model switching

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "\${YELLOW}Testing model switching on local server...\${NC}"

# Set the local API URL
API_URL="http://localhost:3005/api"

# Function to test a query and print the selected model
test_query() {
    local description=\$1
    local query=\$2
    
    echo -e "\${YELLOW}Testing: \$description\${NC}"
    echo "Query: \"\$query\""
    
    # Make the API call with a timeout
    response=\$(curl -s -m 10 -X POST "\$API_URL/inquiry" \\
        -H "Content-Type: application/json" \\
        -d "{\\\"query\\\": \\\"\$query\\\"}")
    
    # Check if the curl command failed
    if [ \$? -ne 0 ]; then
        echo -e "\${RED}✗ Error: API call failed or timed out\${NC}"
        return
    fi
    
    # Extract and display the model
    model=\$(echo \$response | grep -o '"model":"[^"]*"' | cut -d '"' -f 4)
    reason=\$(echo \$response | grep -o '"modelSelectionReason":"[^"]*"' | cut -d '"' -f 4)
    
    if [ -z "\$model" ]; then
        echo -e "\${RED}✗ Error: No model found in response\${NC}"
        echo \$response
        return
    fi
    
    echo -e "Selected model: \${GREEN}\$model\${NC}"
    echo "Reason: \$reason"
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

echo -e "\${YELLOW}Quick model switching tests completed!\${NC}"
EOF

chmod +x "$PROJECT_ROOT/test-local.sh"

# Create a README for local testing
cat > "$PROJECT_ROOT/LOCAL-TESTING.md" << EOF
# Local Testing for Smart Retail Assistant

This document provides instructions for testing the model switching functionality locally.

## Prerequisites

1. Install Node.js (v14 or later)
2. Configure your Azure OpenAI credentials in the \`.env\` file

## Running the Local Server

To start the local server:

```bash
cd scripts
./run-local.sh
```

This will start the server on port 3005.

## Running the Tests

1. **Command-Line Tests**:
   ```bash
   ./test-local.sh
   ```
   
   Or the Node.js version:
   ```bash
   node test-model-switching-local.js
   ```

2. **Web-Based Tests**:
   - Open \`test-model-switching-local.html\` in your browser
   - The API URL should be automatically set to \`http://localhost:3005/api\`
   - Run the predefined tests or create your own

## Troubleshooting

If you encounter issues:

1. Check if the server is running on port 3005
2. Verify your Azure OpenAI credentials in the \`.env\` file
3. Look for errors in the server console

## Mock Mode

If you don't have Azure OpenAI credentials, the server will run in "mock mode" 
which simulates responses. In this mode, model selection will still work
but you'll get simulated responses instead of actual AI responses.
EOF

echo -e "${GREEN}Local testing setup complete!${NC}"
echo -e "${GREEN}To run the local server:${NC}"
echo -e "  cd scripts && ./run-local.sh"
echo -e "${GREEN}To test model switching locally:${NC}"
echo -e "  ./test-local.sh"
echo -e "${GREEN}To use the web interface for testing:${NC}"
echo -e "  Open test-model-switching-local.html in your browser"
echo -e "${GREEN}For more information, see LOCAL-TESTING.md${NC}"
