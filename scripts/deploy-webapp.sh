#!/bin/bash

# Set error handling
set -e

# Configuration
RESOURCE_GROUP_NAME="rg-smart-retail"
LOCATION="swedencentral"
ENVIRONMENT_NAME="retailassistant"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying AI-Powered Smart Retail Assistant to Azure...${NC}"

# Check for required environment variables
if [ -z "$AZURE_OPENAI_API_KEY" ]; then
  echo -e "${RED}AZURE_OPENAI_API_KEY environment variable is required${NC}"
  export AZURE_OPENAI_API_KEY=$(grep AZURE_OPENAI_API_KEY .env | cut -d '=' -f2)
  echo -e "${GREEN}Set AZURE_OPENAI_API_KEY from .env file${NC}"
fi

if [ -z "$AZURE_OPENAI_ENDPOINT" ]; then
  echo -e "${RED}AZURE_OPENAI_ENDPOINT environment variable is required${NC}"
  export AZURE_OPENAI_ENDPOINT=$(grep AZURE_OPENAI_ENDPOINT .env | cut -d '=' -f2)
  echo -e "${GREEN}Set AZURE_OPENAI_ENDPOINT from .env file${NC}"
fi

# Step 1: Create resource group if it doesn't exist
echo -e "${YELLOW}Step 1: Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION

# Step 2: Create a container registry if it doesn't exist
echo -e "${YELLOW}Step 2: Creating container registry...${NC}"
ACR_NAME="retailassistantacr"
az acr create --resource-group $RESOURCE_GROUP_NAME --name $ACR_NAME --sku Basic --admin-enabled true

# Step 3: Login to ACR
echo -e "${YELLOW}Step 3: Logging in to ACR...${NC}"
az acr login --name $ACR_NAME

# Step 4: Build and push container
echo -e "${YELLOW}Step 4: Building and pushing container image...${NC}"
docker build -t $ACR_NAME.azurecr.io/retail-api:latest .
docker push $ACR_NAME.azurecr.io/retail-api:latest

# Step 5: Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# Step 6: Create App Service Plan
echo -e "${YELLOW}Step 6: Creating App Service Plan...${NC}"
APP_PLAN_NAME="retail-app-plan"
az appservice plan create --name $APP_PLAN_NAME --resource-group $RESOURCE_GROUP_NAME --sku B1 --is-linux

# Step 7: Create Web App for Containers
echo -e "${YELLOW}Step 7: Creating Web App for Containers...${NC}"
WEB_APP_NAME="retail-app-$RANDOM"
az webapp create --resource-group $RESOURCE_GROUP_NAME --plan $APP_PLAN_NAME --name $WEB_APP_NAME --deployment-container-image-name $ACR_NAME.azurecr.io/retail-api:latest

# Step 8: Configure Web App
echo -e "${YELLOW}Step 8: Configuring Web App...${NC}"
az webapp config appsettings set --resource-group $RESOURCE_GROUP_NAME --name $WEB_APP_NAME --settings AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT AZURE_OPENAI_MODEL_GROUP=oaimodels

# Step 9: Configure container registry settings
echo -e "${YELLOW}Step 9: Configuring container registry settings...${NC}"
az webapp config container set --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP_NAME --docker-custom-image-name $ACR_NAME.azurecr.io/retail-api:latest --docker-registry-server-url https://$ACR_NAME.azurecr.io --docker-registry-server-user $ACR_USERNAME --docker-registry-server-password $ACR_PASSWORD

# Step 10: Enable logging
echo -e "${YELLOW}Step 10: Enabling logging...${NC}"
az webapp log config --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP_NAME --docker-container-logging filesystem

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Web App URL: https://$WEB_APP_NAME.azurewebsites.net${NC}"
