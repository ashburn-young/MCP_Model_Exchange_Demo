@description('Name of the app service plan')
param name string

@description('Azure region where the resource will be deployed')
param location string

@description('Tags for the resource')
param tags object = {}

@description('SKU of the app service plan')
param sku object = {
  name: 'B1'
  tier: 'Basic'
  capacity: 1
}

@description('Kind of the app service plan')
param kind string = 'linux'

@description('Reserved flag for Linux app service plans')
param reserved bool = true

resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: name
  location: location
  tags: tags
  sku: sku
  kind: kind
  properties: {
    reserved: reserved
  }
}

output id string = appServicePlan.id
output name string = appServicePlan.name
