# Testing Dynamic Model Switching in Smart Retail Assistant

This document provides a comprehensive guide for testing the dynamic model switching functionality in the Smart Retail Assistant deployed to Azure. The test plan helps verify that different models are being utilized based on query content and domain as expected.

## Understanding Model Selection Logic

The Smart Retail Assistant uses the following criteria for model selection:

1. **User Preference**: If the user specifies a model, that model is used if available
2. **Query Content Analysis**: Different keywords trigger different model selections
   - **Complexity Keywords**: "complex", "detailed", "analyze", etc. → Prefer GPT-4o
   - **Speed Keywords**: "fast", "quick", "brief", etc. → Prefer GPT-3.5 Turbo
   - **Analytics Keywords**: "trends", "patterns", "forecast", etc. → Prefer GPT-4.1
   - **Creative Keywords**: "create", "design", "generate", etc. → Prefer GPT-4.5-preview
3. **Query Length**: Longer queries get more capable models; shorter queries get faster models
4. **Domain Context**: Each server type has default model preferences
   - Customer Preferences → GPT-4o
   - Inventory Analytics → GPT-4
   - Marketing Optimization → GPT-3.5 Turbo (default) or GPT-4.5-preview (creative)

## Test Cases and Expected Outcomes

The `verify-model-switching.sh` script includes the following test cases:

### Complexity-Based Tests
1. **Complex Analysis Query**
   - Query: "I need a complex, detailed breakdown of our inventory to understand supply chain bottlenecks and optimize our ordering process."
   - Expected Model: GPT-4o
   - Rationale: Contains complexity keywords and is asking for detailed analysis
   
2. **Quick, Simple Query**
   - Query: "What are our bestselling products this week?"
   - Expected Model: GPT-3.5 Turbo
   - Rationale: Short, simple query with no special keywords

### Analytics-Based Tests
3. **Analytics and Trend Analysis**
   - Query: "Analyze the sales trends for skincare products over the last 6 months and predict the next quarter's performance."
   - Expected Model: GPT-4.1
   - Rationale: Contains analytics keywords and asks for prediction/forecasting

### Creative Content Tests
4. **Creative Marketing Content**
   - Query: "Create an innovative summer marketing campaign with compelling slogans for our new organic skincare line."
   - Expected Model: GPT-4.5-preview
   - Rationale: Contains creative keywords and is asking for content generation

### Query Length Tests
5. **Very Short Query**
   - Query: "Check stock levels."
   - Expected Model: GPT-3.5 Turbo
   - Rationale: Very short (under 10 words) query favors speed

6. **Very Long, Detailed Query**
   - Query: "I'm looking to understand the complex interrelationship between our customer demographics, purchasing patterns, and product preferences across multiple store locations. [...]"
   - Expected Model: GPT-4o
   - Rationale: Very long query (over 40 words) with complexity keywords

### Domain-Specific Tests
7. **Inventory Analytics**
   - Query: "What are our current inventory levels for all skincare products, and which items need to be restocked?"
   - Expected Model: GPT-4
   - Rationale: Inventory domain with no special keywords defaults to GPT-4

8. **Customer Preferences**
   - Query: "Analyze Sarah Johnson's purchase history and recommend personalized products based on her preferences."
   - Expected Model: GPT-4o
   - Rationale: Customer preferences domain with personalization aspect

9. **Marketing Optimization**
   - Query: "Design a creative loyalty program that will increase customer retention for our premium skincare line."
   - Expected Model: GPT-4.5-preview
   - Rationale: Marketing domain with creative elements

### Explicit Model Selection Tests
10. **Explicit Model Selection**
    - Query: "Analyze the complex patterns in our customer data."
    - Preferred Model: GPT-3.5 Turbo
    - Expected Model: GPT-3.5 Turbo
    - Rationale: Explicit model selection overrides content-based selection

### Mixed Intent Tests
11. **Mixed Signals - Analytics with Creative Elements**
    - Query: "Forecast our Q3 sales trends and create a marketing strategy to address any projected shortfalls."
    - Expected Model: GPT-4.1
    - Rationale: Has both analytics (forecast) and creative elements, but analytics should score higher

12. **Mixed Signals - Simple Query with Complex Terms**
    - Query: "Quick summary of our complex inventory analytics."
    - Expected Model: GPT-3.5 Turbo
    - Rationale: Speed keyword "quick" should outweigh complexity term

## Running the Tests

To run the tests:

1. Make sure the Smart Retail Assistant is deployed to Azure
2. Update the `API_URL` in the script to point to your deployed instance
3. Run the script:
   ```bash
   ./verify-model-switching.sh
   ```

## Interpreting Results

Each test will output:
- The query being tested
- The expected model
- The actual model selected
- The reason for the selection (from the API response)

If a test fails (the expected model doesn't match the selected model), investigate:
1. Is the model selection logic working as expected?
2. Are all models available in your Azure OpenAI deployment?
3. Has the scoring system in the model-manager.js been updated?

## Manual Testing in the Web Interface

You can also test manually through the web interface:

1. Open the Smart Retail Assistant in your browser
2. Try different query types (simple, complex, analytics, creative)
3. Look for the "Selected Model" information in the response
4. Try explicitly selecting different models from the dropdown

When testing manually, note any discrepancies between the expected and actual model selections.
