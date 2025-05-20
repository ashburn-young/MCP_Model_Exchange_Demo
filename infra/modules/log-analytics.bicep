@description('Name of the log analytics workspace')
param name string

@description('Azure region where the resource will be deployed')
param location string

@description('Tags for the resource')
param tags object = {}

@description('Pricing tier for the log analytics workspace')
param sku string = 'PerGB2018'

@description('Retention period in days for the log analytics workspace')
param retentionInDays int = 30

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      name: sku
    }
    retentionInDays: retentionInDays
  }
}

output id string = logAnalyticsWorkspace.id
output name string = logAnalyticsWorkspace.name
