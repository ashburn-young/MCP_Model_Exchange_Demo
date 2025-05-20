@description('Name of the app service')
param name string

@description('Azure region where the resource will be deployed')
param location string

@description('Tags for the resource')
param tags object = {}

@description('ID of the app service plan')
param appServicePlanId string

@description('ID of the managed identity')
param managedIdentityId string

@description('Runtime name for the app service')
param runtimeName string

@description('Runtime version for the app service')
param runtimeVersion string

@description('App settings for the app service')
param appSettings object = {}

resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: name
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlanId
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: '${runtimeName}|${runtimeVersion}'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      appSettings: [for key in items(appSettings): {
        name: key.key
        value: key.value
      }]
    }
  }
}

output id string = appService.id
output name string = appService.name
output hostname string = appService.properties.defaultHostName
