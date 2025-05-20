# Testing Guide: Verifying Dynamic Model Switching in Smart Retail Assistant

This document provides a complete guide for testing the dynamic model switching functionality in the Smart Retail Assistant deployed to Azure.

## Overview

The Smart Retail Assistant is designed to dynamically select the most appropriate Azure OpenAI model based on query content and intent. We have developed several tools and test cases to verify this functionality.

## Test Tools

1. **Command-Line Test Scripts**:
   - `verify-model-switching.sh`: Comprehensive test script with 12 different test cases
   - `quick-model-test.sh`: Simplified script with 4 core test cases
   
2. **Web-Based Testing Tool**:
   - `test-model-switching-web.html`: Interactive UI for testing model selection

## Setting Up

1. **Update API URL**:
   - All test scripts are pre-configured with the current API URL:
     `https://ca-retail-3f5b3811.orangemushroom-044f259b.swedencentral.azurecontainerapps.io/api`
   - Update this URL if your deployment changes

2. **Make Scripts Executable**:
   ```bash
   chmod +x verify-model-switching.sh quick-model-test.sh
   ```

## Running Tests

### Command-Line Tests

For quick verification:
```bash
./quick-model-test.sh
```

For comprehensive testing:
```bash
./verify-model-switching.sh
```

### Web-Based Testing

1. Open `test-model-switching-web.html` in your browser:
   - Using VS Code's Live Server extension
   - Or opening it directly from the file system
   
2. The default API URL is pre-filled, but you can update it if needed
   
3. Click any test button to run that specific test

4. Use the "Custom Query Test" section at the bottom to test with your own queries

## Test Cases

### Simple Query Tests
- **Test**: "What are our bestselling products this week?"
- **Expected Model**: gpt-35-turbo
- **Rationale**: Short query with no special keywords should use the faster model

### Complex Analysis Tests
- **Test**: "I need a complex, detailed breakdown of our inventory to understand supply chain bottlenecks and optimize our ordering process."
- **Expected Model**: gpt-4o
- **Rationale**: Contains complexity keywords and is a detailed request

### Analytics/Forecasting Tests
- **Test**: "Analyze the sales trends for skincare products over the last 6 months and predict the next quarter's performance."
- **Expected Model**: gpt-4.1
- **Rationale**: Contains analytics and forecasting keywords

### Creative Content Tests
- **Test**: "Create an innovative summer marketing campaign with compelling slogans for our new organic skincare line."
- **Expected Model**: gpt-4.5-preview
- **Rationale**: Contains creative and marketing keywords

### Domain-Specific Tests
- **Customer Preferences**: "Analyze Sarah Johnson's purchase history and recommend personalized products based on her preferences."
  - **Expected Model**: gpt-4o
- **Inventory Analytics**: "What are our current inventory levels for all skincare products, and which items need to be restocked?"
  - **Expected Model**: gpt-4
- **Marketing Optimization**: "Design a creative loyalty program that will increase customer retention for our premium skincare line."
  - **Expected Model**: gpt-4.5-preview

### Explicit Model Selection Tests
- **Test**: Include `preferredModel` parameter or use the dropdown in the web interface
- **Expected Behavior**: Selected model should override content-based selection

## Interpreting Results

For each test, check:
1. **Model Selection**: Does the returned model match expectations?
2. **Selection Reason**: Is the reason provided logical for the query?
3. **Consistency**: Do similar queries consistently select the same model?

## Troubleshooting

If tests fail or API connections fail:

1. **Verify API Connectivity**:
   ```bash
   curl -v https://ca-retail-3f5b3811.orangemushroom-044f259b.swedencentral.azurecontainerapps.io/api/models
   ```

2. **Check Container App Status**:
   - Verify the Azure Container App is running
   - Check logs for any errors

3. **CORS Configuration**:
   - Ensure CORS is properly configured in the server

4. **Model Availability**:
   - Verify all required models are available in your Azure OpenAI deployment

## Documenting Results

For each test run:
1. Record which models were selected for each query type
2. Note any unexpected model selections
3. Document any error messages or connection issues
4. If using the web tool, take screenshots of the results for reference

## Additional Documentation

For more detailed information, refer to:
- `MODEL-SWITCHING.md`: Overview of the dynamic model switching functionality
- `MODEL-SWITCHING-TESTING.md`: Detailed explanation of test cases
- `MODEL-SWITCHING-VERIFICATION.md`: Summary of the testing approach
- `WEB-TESTING-GUIDE.md`: Guide for using the web testing tool
