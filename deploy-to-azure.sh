#!/bin/bash

# Set error handling
set -e

# Configuration
RESOURCE_GROUP_NAME="rg-smart-retail-app"
LOCATION="swedencentral"
ENVIRONMENT_NAME="retailassistant2"
SUBSCRIPTION_ID="f72857b0-21a1-447e-9bd5-c8b5ed2f8d69"

# Set Azure OpenAI credentials from .env file
AZURE_OPENAI_API_KEY="3Jlvh7bHjguxnlzAGtJMwLr7RI6cNKLe6PrMpAIeWRxPnbUhT30EJQQJ99BDACfhMk5XJ3w3AAABACOGaWoA"
AZURE_OPENAI_ENDPOINT="https://oaimodels.openai.azure.com/"
AZURE_OPENAI_MODEL_GROUP="oaimodels"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying AI-Powered Smart Retail Assistant to Azure...${NC}"

# Set subscription
echo -e "${YELLOW}Setting Azure subscription...${NC}"
az account set --subscription $SUBSCRIPTION_ID

# Create resource group if it doesn't exist
if ! az group show --name $RESOURCE_GROUP_NAME &> /dev/null; then
    echo -e "${YELLOW}Creating resource group: $RESOURCE_GROUP_NAME${NC}"
    az group create --name $RESOURCE_GROUP_NAME --location $LOCATION
else
    echo -e "${YELLOW}Resource group $RESOURCE_GROUP_NAME already exists${NC}"
fi

# Deploy infrastructure
echo -e "${YELLOW}Deploying infrastructure using Bicep...${NC}"
az deployment sub create \
  --name retailassistant-deployment \
  --location $LOCATION \
  --template-file ./infra/main.bicep \
  --parameters environmentName=$ENVIRONMENT_NAME location=$LOCATION azureOpenAIApiKey=$AZURE_OPENAI_API_KEY azureOpenAIEndpoint=$AZURE_OPENAI_ENDPOINT \
  --output json

# Get outputs from deployment
ACR_NAME=$(az deployment sub show --name retailassistant-deployment --query properties.outputs.CONTAINER_REGISTRY_NAME.value -o tsv)
WEB_APP_NAME=$(az deployment sub show --name retailassistant-deployment --query properties.outputs.WEB_APP_NAME.value -o tsv)
CONTAINER_APP_NAME=$(az deployment sub show --name retailassistant-deployment --query properties.outputs.CONTAINER_APP_NAME.value -o tsv)

echo -e "${YELLOW}Building and pushing container image to $ACR_NAME...${NC}"

# Log in to the container registry
az acr login --name $ACR_NAME

# Build and push the image to ACR with full ACR path
IMAGE_NAME="$ACR_NAME.azurecr.io/retail-api:latest"
echo -e "${YELLOW}Building image: $IMAGE_NAME${NC}"
docker build -t $IMAGE_NAME .
docker push $IMAGE_NAME

# Deploy the container app
echo -e "${YELLOW}Deploying container app...${NC}"
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --image "$ACR_NAME.azurecr.io/retail-api:latest"

# Deploy the web app
echo -e "${YELLOW}Deploying web app...${NC}"
cd src/client
npm install
npm run build
cd ../..

# Get the publish profile for the web app
PUBLISH_PROFILE=$(az webapp deployment list-publishing-profiles --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP_NAME --xml)

# Save the publish profile to a temporary file
echo "$PUBLISH_PROFILE" > publish_profile.xml

# Deploy the client app
az webapp deploy --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP_NAME --src-path ./src/client/build --type zip

# Clean up
rm publish_profile.xml

# Get the deployment URLs
WEB_APP_URL=$(az deployment sub show --name retailassistant-deployment --query properties.outputs.WEB_APP_URL.value -o tsv)
API_URL=$(az deployment sub show --name retailassistant-deployment --query properties.outputs.API_URL.value -o tsv)

# Update the CORS settings for the container app to use the actual web app URL
echo -e "${YELLOW}Updating CORS settings for container app...${NC}"
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --cors-allowed-origins $WEB_APP_URL

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Web App URL: $WEB_APP_URL${NC}"
echo -e "${GREEN}API URL: $API_URL${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Open $WEB_APP_URL in your browser to access the Smart Retail Assistant"
echo -e "2. Try different queries to test the specialized MCP servers"
echo -e "3. Check Azure portal for monitoring and logs"
