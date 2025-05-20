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

# Step 2: Create App Service Plan
echo -e "${YELLOW}Step 2: Creating App Service Plan...${NC}"
APP_PLAN_NAME="retail-app-plan"
az appservice plan create --name $APP_PLAN_NAME --resource-group $RESOURCE_GROUP_NAME --sku B1 --is-linux

# Step 3: Create Web App with Node.js runtime
echo -e "${YELLOW}Step 3: Creating Web App with Node.js runtime...${NC}"
WEB_APP_NAME="retail-app-$RANDOM"
az webapp create --resource-group $RESOURCE_GROUP_NAME --plan $APP_PLAN_NAME --name $WEB_APP_NAME --runtime "NODE:18-lts"

# Step 4: Configure Web App
echo -e "${YELLOW}Step 4: Configuring Web App...${NC}"
az webapp config appsettings set --resource-group $RESOURCE_GROUP_NAME --name $WEB_APP_NAME --settings \
  AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY \
  AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT \
  AZURE_OPENAI_MODEL_GROUP=oaimodels \
  WEBSITE_NODE_DEFAULT_VERSION=~18 \
  SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Step 5: Enable logging
echo -e "${YELLOW}Step 5: Enabling logging...${NC}"
az webapp log config --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP_NAME --web-server-logging filesystem

# Step 6: Deploy the code using Zip deployment
echo -e "${YELLOW}Step 6: Preparing code for deployment...${NC}"
echo -e "${YELLOW}Building client application...${NC}"
cd ./src/client
npm install
npm run build
cd ../..

# Update client API URL to point to Azure deployment
echo -e "${YELLOW}Updating client API URL in the build files...${NC}"
sed -i "s|const apiUrl = 'http://localhost:3005/api'|const apiUrl = 'https://$WEB_APP_NAME.azurewebsites.net/api'|g" ./src/client/build/static/js/main.*.js

mkdir -p ./deploy
cp -r ./src ./deploy/
cp -r ./node_modules ./deploy/ || echo "No node_modules directory found, it will be installed during deployment"
cp package.json package-lock.json ./deploy/
cp -r ./.env ./deploy/

echo -e "${YELLOW}Step 7: Creating deployment zip file...${NC}"
cd ./deploy
zip -r ../app.zip ./* 
cd ..

echo -e "${YELLOW}Step 8: Deploying code to Web App...${NC}"
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP_NAME --name $WEB_APP_NAME --src ./app.zip

# Step 9: Clean up deployment files
echo -e "${YELLOW}Step 9: Cleaning up deployment files...${NC}"
rm -rf ./deploy
rm -f ./app.zip

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Web App URL: https://$WEB_APP_NAME.azurewebsites.net${NC}"
