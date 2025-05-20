@description('Name of the container app environment')
param name string

@description('Azure region where the resource will be deployed')
param location string

@description('Tags for the resource')
param tags object = {}

@description('Log analytics workspace ID for the container app environment')
param logAnalyticsWorkspaceId string

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsWorkspaceId, '2022-10-01').customerId
        sharedKey: listKeys(logAnalyticsWorkspaceId, '2022-10-01').primarySharedKey
      }
    }
  }
}

output id string = containerAppEnvironment.id
output name string = containerAppEnvironment.name
