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

// Create placeholder URLs for the resources since we can't reference their outputs directly
var containerAppUrl = 'ca-retail-${resourceToken}.${location}.azurecontainerapps.io'
var webAppUrl = '${abbrs.appServiceApp}-retail-${resourceToken}.azurewebsites.net'

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: '${abbrs.resourceGroup}-${environmentName}'
  location: location
  tags: tags
}

// Create a user-assigned managed identity for the app
module managedIdentity 'modules/managed-identity.bicep' = {
  name: 'managed-identity'
  scope: resourceGroup
  params: {
    name: '${abbrs.managedIdentity}-${resourceToken}'
    location: location
    tags: tags
  }
}

// Create a log analytics workspace for container app monitoring
module logAnalytics 'modules/log-analytics.bicep' = {
  name: 'log-analytics'
  scope: resourceGroup
  params: {
    name: '${abbrs.logAnalyticsWorkspace}-${resourceToken}'
    location: location
    tags: tags
  }
}

// Create an App Service Plan for the web app
module appServicePlan 'modules/app-service-plan.bicep' = {
  name: 'app-service-plan'
  scope: resourceGroup
  params: {
    name: '${abbrs.appServicePlan}-${resourceToken}'
    location: location
    tags: tags
    sku: {
      name: 'B1'
    }
  }
}

// Create a container registry
module containerRegistry 'modules/container-registry.bicep' = {
  name: 'container-registry'
  scope: resourceGroup
  params: {
    name: '${abbrs.containerRegistry}${resourceToken}'
    location: location
    tags: tags
    adminUserEnabled: true
  }
}

// Create the Container App Environment
module containerAppEnvironment 'modules/container-app-environment.bicep' = {
  name: 'container-app-environment'
  scope: resourceGroup
  params: {
    name: 'retail-${resourceToken}-env'
    location: location
    tags: tags
    logAnalyticsWorkspaceId: logAnalytics.outputs.id
  }
}

// Create the front-end web app
module webApp 'modules/app-service.bicep' = {
  name: 'web-app'
  scope: resourceGroup
  params: {
    name: '${abbrs.appServiceApp}-retail-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'web' })
    appServicePlanId: appServicePlan.outputs.id
    managedIdentityId: managedIdentity.outputs.id
    runtimeName: 'node'
    runtimeVersion: '18-lts'
    appSettings: {
      WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'false'
      ENABLE_ORYX_BUILD: 'true'
      SCM_DO_BUILD_DURING_DEPLOYMENT: 'true'
      API_BASE_URL: 'https://${containerAppUrl}'
      REACT_APP_API_URL: 'https://${containerAppUrl}/api'
    }
  }
}

// Create the back-end container app
module containerApp 'modules/container-app.bicep' = {
  name: 'container-app'
  scope: resourceGroup
  params: {
    name: '${abbrs.containerApp}-retail-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'api' })
    containerAppEnvironmentId: containerAppEnvironment.outputs.id
    containerRegistryName: containerRegistry.outputs.name
    managedIdentityId: managedIdentity.outputs.id
    containerImage: '${containerRegistry.outputs.loginServer}/retail-api:latest'
    containerPort: 3000
    env: [
      {
        name: 'AZURE_OPENAI_API_KEY'
        secretRef: 'azure-openai-api-key'
      }
      {
        name: 'AZURE_OPENAI_ENDPOINT'
        value: azureOpenAIEndpoint
      }
      {
        name: 'AZURE_OPENAI_MODEL_GROUP'
        value: 'oaimodels' // As specified in the requirements
      }
    ]
    secrets: [
      {
        name: 'azure-openai-api-key'
        value: azureOpenAIApiKey
      }
    ]
    corsPolicy: {
      allowedOrigins: [
        'https://${webAppUrl}'
      ]
      allowedMethods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ]
      allowedHeaders: [ '*' ]
      exposeHeaders: [ '*' ]
      maxAge: 600 // 10 minutes
    }
  }
}

// Give the managed identity access to the container registry
module containerRegistryAccess 'modules/container-registry-access.bicep' = {
  name: 'container-registry-access'
  scope: resourceGroup
  params: {
    containerRegistryName: containerRegistry.outputs.name
    principalId: managedIdentity.outputs.principalId
  }
}

// Outputs for the deployment
output WEB_APP_URL string = 'https://${webAppUrl}'
output API_URL string = 'https://${containerAppUrl}'
output RESOURCE_GROUP_NAME string = resourceGroup.name
output AZURE_LOCATION string = location
output WEB_APP_NAME string = '${abbrs.appServiceApp}-retail-${resourceToken}'
output CONTAINER_APP_NAME string = '${abbrs.containerApp}-retail-${resourceToken}'
output CONTAINER_REGISTRY_NAME string = containerRegistry.outputs.name
