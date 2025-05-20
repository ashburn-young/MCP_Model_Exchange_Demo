#!/bin/bash

# Set error handling
set -e

# Configuration
RESOURCE_GROUP_NAME="rg-smart-retail-fixed"  # Updated to prevent conflicts with previous deployments
LOCATION="swedencentral"
ENVIRONMENT_NAME="retailassistant6"  # Updated to prevent conflicts with previous deployments
SUBSCRIPTION_ID="f72857b0-21a1-447e-9bd5-c8b5ed2f8d69"

# Set Azure OpenAI credentials from .env file
AZURE_OPENAI_API_KEY="3Jlvh7bHjguxnlzAGtJMwLr7RI6cNKLe6PrMpAIeWRxPnbUhT30EJQQJ99BDACfhMk5XJ3w3AAABACOGaWoA"
AZURE_OPENAI_ENDPOINT="https://oaimodels.openai.azure.com/"
AZURE_OPENAI_MODEL_GROUP="oaimodels"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}STEP 1: Setting Azure subscription...${NC}"
az account set --subscription $SUBSCRIPTION_ID

echo -e "${YELLOW}STEP 2: Creating resource group: $RESOURCE_GROUP_NAME${NC}"
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION

echo -e "${YELLOW}STEP 3: Deploying infrastructure partially to create ACR first...${NC}"
# First deploy just ACR and other supporting resources
# Create a temporary parameters file for bicep to filter out Container App creation
cat > temp-infra.bicep << EOF
targetScope = 'subscription'

@description('Azure OpenAI API key')
@secure()
param azureOpenAIApiKey string = ''

@description('Azure OpenAI endpoint')
param azureOpenAIEndpoint string = ''

@minLength(1)
@maxLength(64)
@description('Name of the environment that will be used to generate a short unique hash for resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string = 'swedencentral'

// Optional parameters
@description('Id of the user or app to assign application roles')
param principalId string = ''

var abbrs = {
  appServicePlan: 'asp'
  appServiceApp: 'app'
  containerRegistry: 'acr'
  containerApp: 'ca'
  keyVault: 'kv'
  logAnalyticsWorkspace: 'law'
  managedIdentity: 'mi'
  resourceGroup: 'rg'
}

var tags = { 'azd-env-name': environmentName }

// Generated unique resource name
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: '${abbrs.resourceGroup}-${environmentName}'
  location: location
  tags: tags
}

// Create Azure Container Registry (ACR)
module containerRegistry './infra/modules/container-registry.bicep' = {
  name: 'container-registry'
  scope: resourceGroup
  params: {
    name: '${abbrs.containerRegistry}${resourceToken}'
    location: location
    tags: tags
    adminUserEnabled: true
  }
}

output RESOURCE_GROUP string = resourceGroup.name
output CONTAINER_REGISTRY_NAME string = containerRegistry.outputs.name
EOF

# Deploy the temporary Bicep template to create ACR first
az deployment sub create \
  --name retailassistant-acr-deployment \
  --location $LOCATION \
  --template-file ./temp-infra.bicep \
  --parameters environmentName=$ENVIRONMENT_NAME location=$LOCATION azureOpenAIApiKey=$AZURE_OPENAI_API_KEY azureOpenAIEndpoint=$AZURE_OPENAI_ENDPOINT

# Get resource group and ACR name from the deployment
RESOURCE_GROUP=$(az deployment sub show --name retailassistant-acr-deployment --query properties.outputs.RESOURCE_GROUP.value -o tsv)
ACR_NAME=$(az deployment sub show --name retailassistant-acr-deployment --query properties.outputs.CONTAINER_REGISTRY_NAME.value -o tsv)

# Build and push Docker image BEFORE deploying Container App
echo -e "${YELLOW}STEP 4: Building and pushing Docker image to ACR: $ACR_NAME...${NC}"
az acr login --name $ACR_NAME

# Build and push Docker image to ACR
echo -e "Building and pushing Docker image..."
IMAGE_NAME="$ACR_NAME.azurecr.io/retail-api:latest"
docker build -t $IMAGE_NAME .
docker push $IMAGE_NAME

# Clean up the temporary Bicep file
rm temp-infra.bicep

echo -e "${YELLOW}STEP 5: Now deploying the full infrastructure including Container App...${NC}"
az deployment sub create \
  --name retailassistant-deployment \
  --location $LOCATION \
  --template-file ./infra/main.bicep \
  --parameters environmentName=$ENVIRONMENT_NAME location=$LOCATION azureOpenAIApiKey=$AZURE_OPENAI_API_KEY azureOpenAIEndpoint=$AZURE_OPENAI_ENDPOINT

echo -e "${YELLOW}STEP 6: Getting deployment outputs...${NC}"
WEB_APP_NAME=$(az deployment sub show --name retailassistant-deployment --query properties.outputs.WEB_APP_NAME.value -o tsv)
CONTAINER_APP_NAME=$(az deployment sub show --name retailassistant-deployment --query properties.outputs.CONTAINER_APP_NAME.value -o tsv)

# No need to build and push image again as it's already done
echo -e "${YELLOW}STEP 7: Updating Container App with the image we already pushed...${NC}"
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $IMAGE_NAME

echo -e "${YELLOW}STEP 8: Building and deploying the client application...${NC}"
# Build the client app
cd src/client
npm install
npm run build
cd ../..

# Deploy the client app to App Service
echo -e "Deploying client app to Web App: $WEB_APP_NAME"
az webapp deploy \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --src-path ./src/client/build \
  --type zip

echo -e "${YELLOW}STEP 9: Configuring CORS settings...${NC}"
WEB_APP_URL=$(az webapp show --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName -o tsv)
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --cors-allowed-origins "https://$WEB_APP_URL"

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Web App URL: https://$WEB_APP_URL${NC}"
CONTAINER_APP_URL=$(az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)
echo -e "${GREEN}API URL: https://$CONTAINER_APP_URL${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Open https://$WEB_APP_URL in your browser to access the Smart Retail Assistant"
echo -e "2. Try different queries to test the specialized MCP servers"
echo -e "3. Check Azure Portal for monitoring and logs"
