# Dynamic Model Switching in Smart Retail Assistant

This document explains how to use the dynamic model switching feature in the Smart Retail Assistant.

## Available Models

The Smart Retail Assistant supports the following Azure OpenAI models:

| Model ID | Name | Description | Best For |
|----------|------|-------------|----------|
| `gpt-4o` | GPT-4o | Most advanced model with multimodal capabilities | Complex analysis, detailed explanations, multiple capabilities |
| `gpt-4` | GPT-4 | High-capability model for complex reasoning tasks | Reasoning, balanced performance, inventory analytics |
| `gpt-35-turbo` | GPT-3.5 Turbo | Fast and efficient model for general tasks | Speed, efficiency, simple queries |
| `gpt-4.1` | GPT-4.1 | Advanced reasoning capabilities with improved knowledge | Analytics, forecasting, pattern recognition |
| `gpt-4.5-preview` | GPT-4.5 Preview | Preview of next generation GPT with enhanced capabilities | Creative generation, marketing, innovation |

## How to Switch Models

### Using the Web Interface

1. Open the Smart Retail Assistant at http://localhost:3000
2. Look for the "Select AI Model" dropdown at the top of the page
3. Choose your preferred model from the dropdown
4. Submit your next query, which will use the selected model

### Using the API Directly

When making API calls to the Smart Retail Assistant, you can specify a `preferredModel` parameter:

```bash
curl -X POST http://localhost:3002/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the current promotions for skincare products?",
    "preferredModel": "gpt-4.1"
  }'
```

## Automatic Model Selection

The system features sophisticated dynamic model selection capabilities. If you don't specify a preferred model, the system will automatically select the most appropriate model based on:

1. **Advanced Query Content Analysis**: The system deeply analyzes your question to determine:
   - Content complexity and domain-specific requirements
   - Identification of analytical, creative, or speed-focused tasks
   - Specialized keyword pattern detection for optimal model matching
   - Query intent classification (forecasting, inventory check, marketing creation, etc.)
   
2. **Intelligent Task-Specific Optimization**:
   - **Complex Analysis Tasks**: Uses GPT-4o for deep, nuanced analysis
   - **Fast Responses**: Uses GPT-3.5 Turbo for quick, efficient responses
   - **Creative Generation**: Uses GPT-4.5-preview for marketing content and creative tasks
   - **Forecasting & Trends**: Uses GPT-4.1 for analyzing data patterns and predictions
   - **Balanced Reasoning**: Uses GPT-4 for general reasoning tasks that need good performance
   - **Supply Chain Optimization**: Uses specialized model selection for inventory management
   - **Customer Analysis**: Uses personalized model selection for customer preference analysis

3. **Contextual Query Analysis**:
   - Short, simple queries (under 10 words) → GPT-3.5 Turbo
   - Medium-length queries → Model based on content analysis
   - Long, detailed queries (over 40 words) → GPT-4o or GPT-4.1
   - Specific domain keywords trigger specialized model selection
   
4. **Domain-Optimized Selection with Advanced Scoring**:
   - Numerical scoring system evaluates multiple query characteristics
   - Multiple keyword categories are independently scored
   - Domain-specific logic adds additional context-aware scoring
   - Model strengths are matched to query requirements

The model selection reasoning is displayed with each response, showing why a particular model was chosen for your query.

## Server-Specific Model Selection Logic

Each MCP server implements specialized domain-specific model selection logic:

### Customer Preferences Server
- Uses GPT-4o for detailed customer analysis with personalized recommendations
- Uses GPT-3.5 Turbo for quick customer lookups and simple preference checks
- Uses GPT-4.1 for pattern detection and trend analysis in customer behavior
- Customer keyword detection prioritizes different models based on query intent

### Inventory Analytics Server
- Uses GPT-4 as the default for balanced inventory analysis
- Uses GPT-4.1 for forecasting, demand prediction, and trend analysis
- Uses GPT-4.5-preview for complex numerical calculations and optimization problems
- Uses GPT-3.5 Turbo for simple inventory checks and quick status reports
- Specialized for supply chain terminology and inventory optimization

### Marketing Optimization Server
- Uses GPT-4.5-preview for creative marketing content generation and innovative campaigns
- Uses GPT-4.1 for ROI analysis, performance metrics, and analytics-driven marketing
- Uses GPT-4o for complex marketing strategy questions and competitive analysis
- Uses GPT-3.5 Turbo as a fast default for simple marketing questions
- Optimized for promotion creation and marketing campaign development

## Viewing Available Models

To see all available models via API:

```bash
curl http://localhost:3002/api/models
```

This returns a JSON response with all available models, including their strengths:

```json
{
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "description": "Most advanced model with multimodal capabilities",
      "strengths": ["complex analysis", "detailed explanation", "multiple capabilities"]
    },
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "description": "High-capability model for complex reasoning tasks",
      "strengths": ["reasoning", "balanced performance", "inventory analytics"]
    },
    {
      "id": "gpt-35-turbo",
      "name": "GPT-3.5 Turbo",
      "description": "Fast and efficient model for general tasks",
      "strengths": ["speed", "efficiency", "simple queries"]
    },
    {
      "id": "gpt-4.1",
      "name": "GPT-4.1",
      "description": "Advanced reasoning capabilities with improved knowledge",
      "strengths": ["analytics", "forecasting", "pattern recognition"]
    },
    {
      "id": "gpt-4.5-preview",
      "name": "GPT-4.5 Preview",
      "description": "Preview of next generation GPT with enhanced capabilities",
      "strengths": ["creative generation", "marketing", "innovation"]
    }
  ],
  "timestamp": "2025-05-17T02:35:19.431Z"
}
```

## Model Selection Best Practices

- **GPT-4o**: Use for complex, nuanced, and detailed customer preference analysis
- **GPT-4**: Great for inventory analysis and supply chain optimization
- **GPT-3.5 Turbo**: Ideal for basic search and quick marketing campaign suggestions
- **GPT-4.1**: Best for analytics, trend detection, and forecasting
- **GPT-4.5-preview**: Optimal for creative content generation and innovative marketing

## Testing the Model Selection System

The Smart Retail Assistant includes a comprehensive test script that verifies all aspects of the model selection system:

```bash
./test-model-switching.sh
```

This script tests:
- Model availability and API endpoints
- Explicit model selection via user preference
- Dynamic model selection based on query content
- Server-specific model selection logic
- Handling of invalid model requests
- Query complexity and length-based selection
- Domain-specific keyword triggers

## Troubleshooting

If you encounter issues with a specific model:

1. Try switching to a different model
2. Check the server logs for any model-specific errors
3. Verify that the Azure OpenAI deployment includes all the models you're trying to use
4. Check the model selection output in the API response (`modelSelectionReason`)
5. Examine the test results from `test-model-switching.sh` for any failing tests
