# Quick Start Guide - Smart Retail Assistant

This guide will help you quickly set up and start using the AI-Powered Smart Retail Assistant demo.

## 1. Prerequisites

Ensure you have the following installed:
- Node.js (v18+)
- npm (v9+)
- Docker
- Azure CLI
- Access to Azure OpenAI Service

## 2. Setup

### Clone the Repository

```bash
git clone <repository-url>
cd smart-retail-assistant
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your Azure OpenAI credentials:
```
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
```

### Install Dependencies

```bash
npm install
cd src/client
npm install
cd ../..
```

## 3. Local Development

### Run in Development Mode

```bash
npm run dev:all
```

This will start both the backend server and the React client in development mode.

- Backend: http://localhost:3000
- Frontend: http://localhost:3001

## 4. Demo Scenarios

Try the following queries to test different MCP servers:

### Customer Preferences (MCP Server A - GPT-4o)
- "What skincare products would you recommend based on my preference for organic items?"
- "Show me my recent purchase history for sustainable products."

### Inventory Analytics (MCP Server B - Claude 3.5 Sonnet)
- "What's the current inventory status for face moisturizers?"
- "Show me the price trends for premium skincare products."

### Marketing Optimization (MCP Server C - Gemini 1.5 Pro)
- "Create a promotion for our summer skincare collection."
- "Analyze the effectiveness of our last discount campaign."

## 5. Azure Deployment

To deploy to Azure:

```bash
export AZURE_OPENAI_API_KEY=your_api_key
export AZURE_OPENAI_ENDPOINT=your_endpoint_url
npm run deploy
```

The deployment script will:
1. Create a resource group
2. Deploy infrastructure using Bicep
3. Build and push Docker images
4. Deploy the container app and web app

After deployment, you'll get URLs for accessing the web app and API.

## 6. Model Switching

The system automatically selects the appropriate AI model based on the query:
- Customer-related queries → GPT-4o
- Inventory-related queries → Claude 3.5 Sonnet
- Marketing-related queries → Gemini 1.5 Pro

## 7. Additional Information

- Refer to README.md for detailed documentation
- Check the Azure portal for monitoring deployed resources
- View logs for troubleshooting

## 8. Troubleshooting

- **Connection Issues**: Ensure Azure credentials are correct
- **Model Errors**: Verify models are deployed in your Azure OpenAI resource
- **UI Issues**: Check browser console for CORS or API errors
