# Smart Retail Assistant Azure Integration

This document provides a summary of the Azure OpenAI integration in the Smart Retail Assistant demo.

## Integration Updates

1. **Direct Azure OpenAI Integration**
   - The application now connects directly to Azure OpenAI instead of using mock responses
   - Model and version information is displayed in the UI for each response
   - Graceful fallback to mock responses if a model is unavailable or there's an error

2. **Model Configuration**
   - Customer Preferences: Uses GPT-4o from Azure OpenAI
   - Inventory Analytics: Uses GPT-4 from Azure OpenAI
   - Marketing Optimization: Uses GPT-35-turbo from Azure OpenAI

3. **UI Enhancements**
   - Added clear model version display in the chat interface
   - Visual indicator when mock responses are being used
   - Improved styling for model information section

4. **Error Handling**
   - Robust error handling for cases when Azure OpenAI is unavailable
   - MCP server failure detection and graceful recovery
   - Appropriate user feedback in the UI

## Configuration

The application uses the following Azure OpenAI settings:

```
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://oaimodels.openai.azure.com/
AZURE_OPENAI_MODEL_GROUP=oaimodels
```

## Available Models

The following Azure OpenAI models were tested and are working with the application:

1. `gpt-4o` (gpt-4o-2024-11-20) - Used for Customer Preferences MCP server
2. `gpt-4` (gpt-4-turbo-2024-04-09) - Used for Inventory Analytics MCP server
3. `gpt-35-turbo` (gpt-3.5-turbo-0125) - Used for Marketing Optimization MCP server

## Dynamic Model Switching

The application now supports dynamic switching between different Azure OpenAI models based on user preferences or contextual needs.

### Available Models

The following Azure OpenAI models are supported:

1. **GPT-4o** (`gpt-4o`) - Most advanced model with multimodal capabilities
2. **GPT-4** (`gpt-4`) - High-capability model for complex reasoning tasks
3. **GPT-3.5 Turbo** (`gpt-35-turbo`) - Fast and efficient model for general tasks
4. **GPT-4.1** (`gpt-4.1`) - Advanced reasoning capabilities with improved knowledge
5. **GPT-4.5 Preview** (`gpt-4.5-preview`) - Preview of next generation GPT with enhanced capabilities

### How Model Selection Works

The application selects models using a multi-level approach:

1. **User Preference**: If the user explicitly selects a model, that model is used
2. **Content-Based Selection**: If certain keywords are detected in the query (e.g., "complex", "detailed", "fast"), an appropriate model is selected
3. **Domain-Specific Default**: Each domain (Customer Preferences, Inventory Analytics, Marketing) has a default model

### API Usage with Model Selection

You can specify a preferred model when making API requests:

```bash
curl -X POST http://localhost:3002/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{"query": "What are my shopping preferences?", "preferredModel": "gpt-4.1"}'
```

### Retrieving Available Models

The application exposes an endpoint to get information about available models:

```bash
curl http://localhost:3002/api/models
```

## Testing

You can test the API directly using:

```bash
./test-api.sh
```

You can test the available models using:

```bash
node test-esm.js
```

To start the server:

```bash
node src/server/index.js
```

## MCP Server Status

The Model Context Protocol (MCP) servers are currently failing to start due to configuration issues. However, the main server is still operational and correctly routes requests to the appropriate Azure OpenAI models.

### Fallback Mechanism

The application uses a fallback mechanism to handle MCP server failures:

1. If an MCP server fails to start, the main server will route requests directly to Azure OpenAI.
2. If Azure OpenAI is available, it will process the request using the appropriate model.
3. If Azure OpenAI is unavailable or fails, the server will use mock responses.

## Next Steps for Improvement

1. Fix MCP server TypeScript syntax errors (partially fixed)
2. Update MCP server configuration to include required options
3. Add more robust error handling for Azure OpenAI API errors
4. Update model selection logic to support new Azure OpenAI models as they become available
