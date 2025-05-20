@description('Name of the container registry')
param name string

@description('Azure region where the resource will be deployed')
param location string

@description('Tags for the resource')
param tags object = {}

@description('Enable admin user for the container registry')
param adminUserEnabled bool = false

@description('SKU for the container registry')
param sku string = 'Basic'

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: adminUserEnabled
  }
}

output id string = containerRegistry.id
output name string = containerRegistry.name
output loginServer string = containerRegistry.properties.loginServer
