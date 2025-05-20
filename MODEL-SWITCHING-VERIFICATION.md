# Smart Retail Assistant - Model Switching Verification

This document summarizes the testing strategy we've developed to verify the dynamic model switching functionality in the Smart Retail Assistant application deployed to Azure.

## Understanding the Model Switching Implementation

After reviewing the code and documentation, we identified that the Smart Retail Assistant uses a sophisticated scoring system to determine which model to use based on:

1. **Query Content Analysis**: 
   - Complexity keywords (e.g., "complex", "detailed", "analyze") → GPT-4o
   - Speed keywords (e.g., "fast", "quick", "brief") → GPT-3.5 Turbo
   - Analytics keywords (e.g., "trends", "patterns", "forecast") → GPT-4.1
   - Creative keywords (e.g., "create", "design", "generate") → GPT-4.5-preview

2. **Query Length**:
   - Short queries (< 10 words) → GPT-3.5 Turbo
   - Medium queries → Based on content
   - Long queries (> 40 words) → GPT-4o or GPT-4.1

3. **Domain-Specific Intelligence**:
   - Customer Preferences domain → Prefers GPT-4o
   - Inventory Analytics domain → Prefers GPT-4 and GPT-4.1
   - Marketing Optimization domain → Prefers GPT-4.5-preview for creative tasks

4. **User Preference Override**:
   - Explicit model selection via UI or API overrides content-based selection

## Testing Tools Created

We've developed several tools to help verify and test the model switching functionality:

1. **[verify-model-switching.sh](./verify-model-switching.sh)**: 
   - A comprehensive bash script that tests 12 different query scenarios
   - Each test targets a specific model selection scenario
   - The script compares expected vs. actual model selection

2. **[quick-model-test.sh](./quick-model-test.sh)**:
   - A simplified version with just 4 core tests
   - Designed for quick verification of basic functionality

3. **[test-model-switching-web.html](./test-model-switching-web.html)**:
   - An interactive web UI for testing model selection
   - Includes predefined tests and custom query testing
   - Provides visual feedback on model selection

4. **[MODEL-SWITCHING-TESTING.md](./MODEL-SWITCHING-TESTING.md)**:
   - Detailed documentation of test cases and expected outcomes
   - Explanation of model selection logic for each test case

5. **[WEB-TESTING-GUIDE.md](./WEB-TESTING-GUIDE.md)**:
   - Guide for using the web testing tool
   - Instructions for interpreting results

## Key Test Scenarios

The following test scenarios are critical for verifying proper model switching:

1. **Simple Queries**: "What are our bestselling products?" → GPT-3.5 Turbo
2. **Complex Analysis**: "I need a complex, detailed breakdown of our inventory..." → GPT-4o
3. **Analytics/Forecasting**: "Analyze the sales trends and predict next quarter..." → GPT-4.1
4. **Creative Content**: "Create an innovative summer marketing campaign..." → GPT-4.5-preview
5. **Domain-Specific**: Inventory queries → GPT-4, Customer queries → GPT-4o
6. **Explicit Selection**: Using the UI dropdown or API parameter → Should override content-based selection
7. **Mixed Intent**: Queries with competing keywords → Should select based on scoring weights

## Using the Test Tools

To verify the model switching functionality in your deployed application:

1. **Update API Endpoints**: 
   - Update the API_URL in the scripts to point to your deployed instance
   - Default is currently set to:  
     `https://ca-retail-3f5b3811.orangemushroom-044f259b.swedencentral.azurecontainerapps.io/api`

2. **Run the Verification Scripts**:
   ```bash
   ./verify-model-switching.sh
   # Or for a quicker test:
   ./quick-model-test.sh
   ```

3. **Use the Web Testing Tool**:
   - Open `test-model-switching-web.html` in a browser
   - Update the API URL if necessary
   - Run the predefined tests or create custom tests

## Troubleshooting Connection Issues

If you encounter connection issues:

1. **Verify Container App Status**:
   - Check that your Azure Container App is running
   - Verify the correct URL/endpoint is being used

2. **Check CORS Configuration**:
   - Ensure the server's CORS settings allow requests from your testing environment
   - The app should have already been updated with appropriate CORS settings

3. **Test Basic Connectivity**:
   ```bash
   curl -v https://your-app-url.azurecontainerapps.io/api/models
   ```

4. **Check Logs**:
   - Review the Azure Container Apps logs for any errors
   - Look for connection or timeout-related issues

## What to Look for in Test Results

When analyzing the test results, focus on:

1. **Model Selection Consistency**: The same query should consistently select the same model
2. **Selection Reasoning**: The API should return meaningful explanations for model selection
3. **Keyword Sensitivity**: Queries with specific keywords should trigger the expected models
4. **Override Functionality**: Explicit model selection should override the automatic selection

## Conclusion

The dynamic model switching functionality is a key feature of the Smart Retail Assistant that optimizes both response quality and cost. By using these testing tools and strategies, you can verify that the feature is working as expected in your deployment.

If you encounter any persistent issues with model switching, review the scoring weights in `model-manager.js` and ensure that all models referenced in the code are properly deployed and accessible through your Azure OpenAI resource.
