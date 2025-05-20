# Using the Model Switching Test Web Tool

This guide explains how to use the web-based testing tool (`test-model-switching-web.html`) to verify the dynamic model switching functionality in your deployed Smart Retail Assistant.

## Getting Started

1. Open the `test-model-switching-web.html` file in your browser. You can do this by:
   - Opening it directly from your file system
   - Hosting it on a simple HTTP server
   - Using VS Code's Live Server extension

2. Set your API URL in the input field at the top. This should be the base API URL of your deployed Smart Retail Assistant, such as:
   ```
   https://ca-retail-4ea43e52.redocean-8ebb178a.swedencentral.azurecontainerapps.io/api
   ```

## Running Predefined Tests

The left panel contains 12 predefined test queries designed to trigger different model selection behaviors:

1. **Complex Analysis Query** - Should trigger GPT-4o selection
2. **Quick, Simple Query** - Should trigger GPT-3.5 Turbo selection
3. **Analytics and Forecasting Query** - Should trigger GPT-4.1 selection
4. **Creative Marketing Content** - Should trigger GPT-4.5-preview selection
5. **Very Short Query** - Should trigger GPT-3.5 Turbo selection
6. **Long, Detailed Query** - Should trigger GPT-4o selection
7. **Inventory Analysis Query** - Should trigger GPT-4 selection
8. **Customer Preferences Query** - Should trigger GPT-4o selection
9. **Marketing Optimization Query** - Should trigger GPT-4.5-preview selection
10. **Explicit Model Selection** - Forces GPT-3.5 Turbo regardless of content
11. **Mixed Signals - Analytics with Creative** - Should prioritize analytics (GPT-4.1)
12. **Mixed Signals - Simple with Complex Terms** - Should prioritize speed (GPT-3.5 Turbo)

Simply click on any test button to run that test. The results will appear in the right panel.

## Creating Custom Tests

The bottom section allows you to create and run custom tests:

1. Enter your custom query in the text area
2. Optionally select a preferred model from the dropdown
3. Click "Test Custom Query" to run the test

This feature is particularly useful for:
- Testing edge cases
- Testing specific keyword combinations
- Validating fixes to model selection issues

## Interpreting Results

For each test, the results panel will show:

- The query text
- The selected model (with a colored badge)
- The model selection reason (as reported by the API)
- The server type that processed the request
- The preferred model (if one was specified)

## Troubleshooting

If you encounter errors:

1. **API Connection Issues**:
   - Verify the API URL is correct
   - Check that your Azure Container App is running
   - Ensure CORS is properly configured on the server

2. **Unexpected Model Selections**:
   - Review the model selection reason for clues
   - Check the model-manager.js implementation for scoring logic
   - Verify that all models are available in your Azure OpenAI deployment

3. **Missing Models**:
   - If certain models aren't being selected, verify they're properly configured in Azure OpenAI
   - Check environment variables for API keys and endpoints

## Sharing Results

To share test results with your team:

1. Run all the tests
2. Take screenshots or use browser developer tools to save the test results
3. Document any discrepancies between expected and actual model selections

This can help diagnose issues with model selection logic or deployment configuration.
