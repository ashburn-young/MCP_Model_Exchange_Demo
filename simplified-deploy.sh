#!/bin/bash

# Set error handling
set -e

# Configuration
SUBSCRIPTION_ID="f72857b0-21a1-447e-9bd5-c8b5ed2f8d69"
RESOURCE_GROUP_NAME="rg-smart-retail-app"
LOCATION="swedencentral"
ENVIRONMENT_NAME="retailassistant2"
APP_NAME="smart-retail"
ACR_NAME="acrretail$(openssl rand -hex 4)"
CONTAINER_APP_NAME="ca-retail-app"
WEB_APP_NAME="web-retail-app"

# Set Azure OpenAI credentials from .env file
AZURE_OPENAI_API_KEY="3Jlvh7bHjguxnlzAGtJMwLr7RI6cNKLe6PrMpAIeWRxPnbUhT30EJQQJ99BDACfhMk5XJ3w3AAABACOGaWoA"
AZURE_OPENAI_ENDPOINT="https://oaimodels.openai.azure.com/"
AZURE_OPENAI_MODEL_GROUP="oaimodels"

# Set subscription
az account set --subscription $SUBSCRIPTION_ID

# Create resource group
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION

# Create ACR
az acr create --resource-group $RESOURCE_GROUP_NAME --name $ACR_NAME --sku Basic --admin-enabled true

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query "username" -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# Build and push Docker image to ACR
az acr login --name $ACR_NAME
docker build -t $ACR_NAME.azurecr.io/retail-api:latest .
docker push $ACR_NAME.azurecr.io/retail-api:latest

# Create Container App Environment
az containerapp env create \
  --name $ENVIRONMENT_NAME-env \
  --resource-group $RESOURCE_GROUP_NAME \
  --location $LOCATION

# Create Container App
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --environment $ENVIRONMENT_NAME-env \
  --image $ACR_NAME.azurecr.io/retail-api:latest \
  --registry-server $ACR_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 3000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT AZURE_OPENAI_MODEL_GROUP=$AZURE_OPENAI_MODEL_GROUP

# Create App Service Plan
az appservice plan create \
  --name $APP_NAME-plan \
  --resource-group $RESOURCE_GROUP_NAME \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --plan $APP_NAME-plan \
  --runtime "NODE:18-lts"

# Build client app
cd src/client
npm install
npm run build
cd ../..

# Deploy client app to Web App
az webapp deploy \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --src-path ./src/client/build \
  --type zip

# Get container app URL
CONTAINER_APP_URL=$(az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --query "properties.configuration.ingress.fqdn" -o tsv)

# Set CORS settings
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --cors-allowed-origins https://$WEB_APP_NAME.azurewebsites.net

# Set webapp settings to point to API
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --settings API_URL=https://$CONTAINER_APP_URL

echo "Deployment completed successfully!"
echo "Web App URL: https://$WEB_APP_NAME.azurewebsites.net"
echo "API URL: https://$CONTAINER_APP_URL"
