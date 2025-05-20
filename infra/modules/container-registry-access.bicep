@description('Name of the container registry')
param containerRegistryName string

@description('Principal ID of the managed identity or service principal')
param principalId string

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' existing = {
  name: containerRegistryName
}

// Assign the AcrPull role to the managed identity
resource roleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id, principalId, 'AcrPull')
  scope: containerRegistry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') // AcrPull role
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}

// Assign the AcrPush role to the managed identity
resource roleAssignmentPush 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id, principalId, 'AcrPush')
  scope: containerRegistry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '8311e382-0749-4cb8-b61a-304f252e45ec') // AcrPush role
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}
