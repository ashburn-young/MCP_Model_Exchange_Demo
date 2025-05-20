#!/bin/bash

# Set error handling
set -e

# Configuration
RESOURCE_GROUP_NAME="rg-smart-retail-app3"  # Updated to prevent conflicts with previous deployments
LOCATION="swedencentral"
ENVIRONMENT_NAME="retailassistant5"  # Updated to prevent conflicts with previous deployments
SUBSCRIPTION_ID="f72857b0-21a1-447e-9bd5-c8b5ed2f8d69"

# Azure OpenAI credentials
AZURE_OPENAI_API_KEY="3Jlvh7bHjguxnlzAGtJMwLr7RI6cNKLe6PrMpAIeWRxPnbUhT30EJQQJ99BDACfhMk5XJ3w3AAABACOGaWoA"
AZURE_OPENAI_ENDPOINT="https://oaimodels.openai.azure.com/"
AZURE_OPENAI_MODEL_GROUP="oaimodels"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Generate a unique token for resources to avoid naming conflicts
RESOURCE_TOKEN=$(openssl rand -hex 4)

echo -e "${YELLOW}▶ STEP 1: Setting Azure subscription...${NC}"
az account set --subscription $SUBSCRIPTION_ID

echo -e "${YELLOW}▶ STEP 2: Creating resource group: $RESOURCE_GROUP_NAME${NC}"
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION --output table

echo -e "${YELLOW}▶ STEP 3: Creating Azure Container Registry${NC}"
ACR_NAME="acrretail${RESOURCE_TOKEN}"
echo -e "Creating ACR: $ACR_NAME"
az acr create \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true \
  --output table

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

echo -e "${YELLOW}▶ STEP 4: Building and pushing Docker image to ACR${NC}"
az acr login --name $ACR_NAME

# Build and push Docker image to ACR
echo -e "Building Docker image..."
IMAGE_NAME="${ACR_NAME}.azurecr.io/retail-api:latest"
docker build -t $IMAGE_NAME .
echo -e "Pushing Docker image to $ACR_NAME..."
docker push $IMAGE_NAME

echo -e "${YELLOW}▶ STEP 5: Creating Container App Environment${NC}"
ENV_NAME="${ENVIRONMENT_NAME}-env"
echo -e "Creating Container App Environment: $ENV_NAME"
az containerapp env create \
  --name $ENV_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --location $LOCATION \
  --output table

echo -e "${YELLOW}▶ STEP 6: Creating Container App${NC}"
CONTAINER_APP_NAME="ca-retail-${RESOURCE_TOKEN}"
echo -e "Creating Container App: $CONTAINER_APP_NAME"
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --environment $ENV_NAME \
  --image $IMAGE_NAME \
  --registry-server ${ACR_NAME}.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT AZURE_OPENAI_MODEL_GROUP=$AZURE_OPENAI_MODEL_GROUP \
  --output table

echo -e "${YELLOW}▶ STEP 7: Creating App Service Plan${NC}"
APP_SERVICE_PLAN="asp-retail-${RESOURCE_TOKEN}"
echo -e "Creating App Service Plan: $APP_SERVICE_PLAN"
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP_NAME \
  --is-linux \
  --sku B1 \
  --output table

echo -e "${YELLOW}▶ STEP 8: Creating Web App${NC}"
WEB_APP_NAME="app-retail-${RESOURCE_TOKEN}"
echo -e "Creating Web App: $WEB_APP_NAME"
az webapp create \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --plan $APP_SERVICE_PLAN \
  --runtime "NODE:18-lts" \
  --output table

echo -e "${YELLOW}▶ STEP 9: Building and deploying client application${NC}"
# Navigate to client directory
cd src/client

# Install dependencies and build the client
echo -e "Installing client dependencies..."
npm install

echo -e "Building client application..."
npm run build

# Return to project root
cd ../..

# Deploy the client app to Web App
echo -e "Deploying client app to Web App: $WEB_APP_NAME"
az webapp deploy \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --src-path ./src/client/build \
  --type zip

echo -e "${YELLOW}▶ STEP 10: Configuring API URL in Web App${NC}"
# Get Container App URL
CONTAINER_APP_URL=$(az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --query "properties.configuration.ingress.fqdn" -o tsv)

# Configure API URL in web app settings
echo -e "Setting API_URL in Web App settings..."
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --settings API_BASE_URL=https://$CONTAINER_APP_URL REACT_APP_API_URL=https://$CONTAINER_APP_URL/api

echo -e "${YELLOW}▶ STEP 11: Configuring CORS settings${NC}"
# Get Web App URL
WEB_APP_URL=$(az webapp show \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --query "defaultHostName" -o tsv)

# Update CORS settings in Container App
echo -e "Updating CORS settings in Container App..."
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --cors-allowed-origins https://$WEB_APP_URL

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}Web App URL: https://$WEB_APP_URL${NC}"
echo -e "${GREEN}API URL: https://$CONTAINER_APP_URL${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Open https://$WEB_APP_URL in your browser to access the Smart Retail Assistant"
echo -e "2. Try different queries to test the specialized MCP servers"
echo -e "3. Check Azure Portal for monitoring and logs at: https://portal.azure.com/#resource/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP_NAME/overview"
