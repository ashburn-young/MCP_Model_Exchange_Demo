# AI-Powered Smart Retail Assistant Demo

This project demonstrates an AI-powered retail assistant that utilizes three specialized Model Context Protocol (MCP) servers to provide intelligent retail insights and assistance. The system dynamically switches between different Azure OpenAI models based on query context.

## Features

- **Three Specialized MCP Servers:**
  - **Customer Preference & Purchase History (MCP Server A):** Analyzes customer preferences and past purchases
  - **Inventory & Supply Chain Analytics (MCP Server B):** Provides insights into inventory status and supply chain
  - **Promotion & Marketing Optimization (MCP Server C):** Optimizes marketing campaigns and promotions

- **Dynamic Azure OpenAI Model Switching:**
  - GPT-4o for customer preference analysis
  - GPT-4 for inventory analytics
  - GPT-3.5 Turbo for marketing optimization
  - Support for GPT-4.1 and GPT-4.5-preview models
  - User-selectable model preferences via UI
  - See [MODEL-SWITCHING.md](MODEL-SWITCHING.md) for details

- **Model Version Display:** UI shows detailed model and version information for each response

- **Smart Fallback to Mock Responses:** Falls back to simulated responses when Azure OpenAI is unavailable or when there are API errors, with clear indication in the UI

- **Modern React-based UI** for seamless user interaction

- **Azure Cloud Deployment** with infrastructure as code (Bicep)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v9 or later)
- [Docker](https://www.docker.com/) for containerization
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) for deployment
- Azure subscription with access to Azure OpenAI Service

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd smart-retail-assistant
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and add your Azure OpenAI API key and endpoint.

3. **Install dependencies:**
   ```bash
   npm install
   cd src/client
   npm install
   cd ../..
   ```

4. **Start the development server:**
   ```bash
   # Use this script for a full setup with MCP servers
   npm run dev
   
   # OR for a simpler setup using only Azure OpenAI models
   ./scripts/run-server-only.sh
   ```

5. **Access the application:**
   - Backend API: http://localhost:3000
   - Frontend: http://localhost:3001

## Deployment

1. **Set required environment variables:**
   ```bash
   export AZURE_OPENAI_API_KEY=your-api-key
   export AZURE_OPENAI_ENDPOINT=your-endpoint-url
   ```

2. **Test Azure OpenAI connectivity:**
   ```bash
   ./scripts/test-azure-openai.sh
   ```

3. **Run the deployment script:**
   ```bash
   chmod +x ./scripts/deploy.sh
   ./scripts/deploy.sh
   ```

4. **For detailed deployment instructions**, see the [Deployment Guide](DEPLOYMENT.md).

## Architecture

### Backend

- **Main Server**: Orchestrates requests between the frontend and the specialized MCP servers
- **MCP Server A**: Specializes in customer preferences and purchase history
- **MCP Server B**: Specializes in inventory and supply chain analytics
- **MCP Server C**: Specializes in marketing and promotion optimization

### API Endpoints

- **/api/inquiry** (POST): Main endpoint for processing retail assistant queries
- **/api/health** (GET): Health check endpoint for monitoring
- **/api/serverinfo** (GET): Information about available MCP servers and models

### Frontend

- React-based single page application
- Bootstrap for styling
- Chat-based interface for user interactions

### Deployment

- Azure Container Apps for the backend
- Azure App Service for the frontend
- Azure Container Registry for Docker images

## Model Context Protocol (MCP)

This project leverages the Model Context Protocol (MCP) to create specialized AI model servers that can be dynamically selected based on the query context. Each MCP server implements different tools:

- **MCP Server A Tools**: 
  - `get_customer_preferences`
  - `get_purchase_history`
  - `search_related_products`

- **MCP Server B Tools**:
  - `check_inventory_status`
  - `analyze_price_trends`
  - `forecast_demand`

- **MCP Server C Tools**:
  - `analyze_promotion_effectiveness`
  - `create_marketing_campaign`
  - `generate_personalized_offer`

## Demo Scenarios

1. **Customer Preferences Analysis**:
   - "What products would you recommend based on my purchase history?"
   - "Show me organic skincare products similar to what I've purchased before."

2. **Inventory Analytics**:
   - "What's the current inventory status for moisturizers?"
   - "When will we need to restock face cleansers based on current demand?"

3. **Marketing Optimization**:
   - "Create a promotion for our summer skincare collection."
   - "What discount strategy would be most effective for our premium customers?"

## Troubleshooting

- **CORS Issues**: If you encounter CORS issues, ensure the container app's CORS policy is correctly set to allow the web app's origin.
- **Model Errors**: Verify that your Azure OpenAI resource has all required models deployed.
- **Container Deployment**: Check container logs if the API isn't responding properly.

## License

[MIT](LICENSE)
