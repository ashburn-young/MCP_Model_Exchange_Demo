# Deployment Guide for Smart Retail Assistant

This guide provides detailed instructions for deploying the Smart Retail Assistant demo to Azure.

## Prerequisites

Before you begin, make sure you have:

1. **Azure Subscription** with access to:
   - Azure Container Apps
   - Azure App Service
   - Azure Container Registry
   - Azure OpenAI Service (with access to GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro models)

2. **Required Tools**:
   - [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (latest version)
   - [Node.js](https://nodejs.org/) (v18 or later)
   - [npm](https://www.npmjs.com/) (v9 or later)
   - [Docker](https://www.docker.com/)

3. **Azure OpenAI Service Credentials**:
   - API key
   - Endpoint URL

## Step 1: Prepare Your Environment

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd smart-retail-assistant
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your Azure OpenAI credentials:
   ```
   AZURE_OPENAI_API_KEY=your_api_key_here
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
   ```

3. **Login to Azure CLI**:
   ```bash
   az login
   ```

## Step 2: Configure Deployment Settings

1. **Review deployment variables**:
   Open `scripts/deploy.sh` and review the configuration variables:
   
   ```bash
   RESOURCE_GROUP_NAME="rg-smart-retail"
   LOCATION="swedencentral"
   ENVIRONMENT_NAME="retailassistant"
   ```
   
   You can modify these if needed.

2. **Export required environment variables**:
   ```bash
   export AZURE_OPENAI_API_KEY=your-api-key
   export AZURE_OPENAI_ENDPOINT=your-endpoint-url
   ```
   
   These will be used during deployment.

## Step 3: Deploy to Azure

1. **Run the deployment script**:
   ```bash
   chmod +x ./scripts/deploy.sh
   ./scripts/deploy.sh
   ```

   This script will:
   - Create a resource group
   - Deploy the infrastructure using Bicep
   - Build and push the Docker image to Azure Container Registry
   - Deploy the container app and web app
   - Configure the CORS settings

2. **Wait for deployment to complete**:
   This process can take 10-15 minutes. The script will output the URLs for your deployed web app and API once completed.

## Step 4: Verify the Deployment

1. **Check resource creation**:
   Navigate to the [Azure Portal](https://portal.azure.com) and verify that the following resources were created:
   - Resource Group: `rg-smart-retail`
   - Container Registry
   - Container App
   - App Service
   - Container App Environment
   - Log Analytics Workspace
   - Managed Identity

2. **Access the web application**:
   Open the URL provided in the deployment output. You should see the Smart Retail Assistant web interface.

3. **Test the API endpoints**:
   - Health check: `https://your-api-url/api/health`
   - Server info: `https://your-api-url/api/serverinfo`

## Step 5: Monitoring and Maintenance

1. **Access Container App logs**:
   ```bash
   az containerapp logs show --name <CONTAINER_APP_NAME> --resource-group rg-smart-retail
   ```

2. **Monitor app performance**:
   Use Azure Monitor and Log Analytics to track app performance and errors.

3. **Update the application**:
   If you make changes to the code, redeploy using the same deployment script:
   ```bash
   ./scripts/deploy.sh
   ```

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   If your web app cannot communicate with the API due to CORS errors, manually update the CORS policy:
   ```bash
   az containerapp update \
     --name <CONTAINER_APP_NAME> \
     --resource-group rg-smart-retail \
     --cors-allowed-origins "https://<WEB_APP_URL>"
   ```

2. **Azure OpenAI Errors**:
   - Verify that you have access to all required models (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)
   - Check that the API key and endpoint are correct
   - Verify your Azure OpenAI service is deployed in Sweden Central region

3. **Container App Not Starting**:
   Check the container logs for errors:
   ```bash
   az containerapp logs show --name <CONTAINER_APP_NAME> --resource-group rg-smart-retail
   ```

4. **Deployment Failures**:
   - Check for errors in the deployment logs
   - Ensure you have sufficient permissions in your Azure subscription
   - Verify your Bicep templates are valid

### Getting Support

If you encounter issues with the deployment, please:
1. Check the troubleshooting section above
2. Review logs in Azure Portal
3. Raise an issue in the project repository with detailed information

## Clean Up Resources

When you're finished with the demo, you can clean up all resources to avoid incurring costs:

```bash
az group delete --name rg-smart-retail --yes
```

This will remove all resources created for this project.
