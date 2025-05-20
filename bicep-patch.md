# This file contains a patch for the main.bicep file to fix the container image reference
# It should be applied before deployment

# Original
# containerImage: 'retail-api:latest'

# Updated
# containerImage: '${containerRegistry.outputs.loginServer}/retail-api:latest'

# To apply this patch:
# 1. Edit infra/main.bicep
# 2. Find the containerApp module parameters
# 3. Update the containerImage line as shown above
