@description('Name of the container app')
param name string

@description('Azure region where the resource will be deployed')
param location string

@description('Tags for the resource')
param tags object = {}

@description('ID of the container app environment')
param containerAppEnvironmentId string

@description('ID of the managed identity')
param managedIdentityId string

@description('Name of the container registry')
param containerRegistryName string

@description('Image for the container')
param containerImage string

@description('Port exposed by the container')
param containerPort int = 80

@description('Environment variables for the container')
param env array = []

@description('Secrets for the container')
param secrets array = []

@description('Minimum number of replicas for the container app')
param minReplicas int = 1

@description('Maximum number of replicas for the container app')
param maxReplicas int = 10

@description('CORS policy for the container app')
param corsPolicy object = {
  allowedOrigins: []
  allowedMethods: []
  allowedHeaders: []
  exposeHeaders: []
  maxAge: 0
}

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
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
    managedEnvironmentId: containerAppEnvironmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: containerPort
        corsPolicy: corsPolicy
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: [
        {
          server: '${containerRegistryName}.azurecr.io'
          identity: managedIdentityId
        }
      ]
      secrets: secrets
    }
    template: {
      containers: [
        {
          name: 'app'
          image: containerImage
          env: env
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: containerPort
                scheme: 'HTTP'
              }
              initialDelaySeconds: 15
              periodSeconds: 30
              timeoutSeconds: 5
              successThreshold: 1
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: containerPort
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              timeoutSeconds: 3
              successThreshold: 1
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scaling-rule'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
}

output id string = containerApp.id
output name string = containerApp.name
output fqdn string = containerApp.properties.configuration.ingress.fqdn
