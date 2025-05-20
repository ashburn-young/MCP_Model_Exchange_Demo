// Model selection analytics to track effectiveness of the model selection algorithm

// In-memory storage for analytics data
// In a production environment, this would be replaced with a database
const modelSelectionAnalytics = {
  totalQueries: 0,
  modelUsage: {
    'gpt-4o': 0,
    'gpt-4': 0,
    'gpt-35-turbo': 0,
    'gpt-4.1': 0,
    'gpt-4.5-preview': 0
  },
  serverTypeUsage: {
    'Customer Preferences': 0,
    'Inventory Analytics': 0,
    'Marketing Optimization': 0
  },
  userSelectedCount: 0,
  autoSelectedCount: 0,
  queryCategories: {
    'analytics': 0,
    'simple': 0,
    'creative': 0,
    'forecast': 0,
    'optimization': 0,
    'inventory': 0,
    'customer': 0,
    'marketing': 0
  }
};

// Function to track a model selection event
export function trackModelSelection(query, serverType, selectedModel, isUserSelected, modelSelectionReason) {
  // Increment total queries
  modelSelectionAnalytics.totalQueries++;
  
  // Track model usage
  if (modelSelectionAnalytics.modelUsage[selectedModel] !== undefined) {
    modelSelectionAnalytics.modelUsage[selectedModel]++;
  }
  
  // Track server type usage
  if (modelSelectionAnalytics.serverTypeUsage[serverType] !== undefined) {
    modelSelectionAnalytics.serverTypeUsage[serverType]++;
  }
  
  // Track user vs. auto selection
  if (isUserSelected) {
    modelSelectionAnalytics.userSelectedCount++;
  } else {
    modelSelectionAnalytics.autoSelectedCount++;
  }
  
  // Categorize the query type based on keywords
  const normalizedQuery = query.toLowerCase();
  
  // Update query categories based on keywords in the query
  if (normalizedQuery.includes('analyz') || normalizedQuery.includes('statistics') || 
      normalizedQuery.includes('trends') || normalizedQuery.includes('pattern')) {
    modelSelectionAnalytics.queryCategories['analytics']++;
  }
  
  if (normalizedQuery.includes('check') || normalizedQuery.includes('status') || 
      normalizedQuery.includes('list') || normalizedQuery.length < 20) {
    modelSelectionAnalytics.queryCategories['simple']++;
  }
  
  if (normalizedQuery.includes('creat') || normalizedQuery.includes('design') || 
      normalizedQuery.includes('generat') || normalizedQuery.includes('campaign')) {
    modelSelectionAnalytics.queryCategories['creative']++;
  }
  
  if (normalizedQuery.includes('forecast') || normalizedQuery.includes('predict') || 
      normalizedQuery.includes('future') || normalizedQuery.includes('trend')) {
    modelSelectionAnalytics.queryCategories['forecast']++;
  }
  
  if (normalizedQuery.includes('optimi') || normalizedQuery.includes('efficien') || 
      normalizedQuery.includes('improve') || normalizedQuery.includes('maximiz')) {
    modelSelectionAnalytics.queryCategories['optimization']++;
  }
  
  if (normalizedQuery.includes('inventory') || normalizedQuery.includes('stock') || 
      normalizedQuery.includes('supply')) {
    modelSelectionAnalytics.queryCategories['inventory']++;
  }
  
  if (normalizedQuery.includes('customer') || normalizedQuery.includes('preference') || 
      normalizedQuery.includes('history')) {
    modelSelectionAnalytics.queryCategories['customer']++;
  }
  
  if (normalizedQuery.includes('market') || normalizedQuery.includes('promot') || 
      normalizedQuery.includes('campaign')) {
    modelSelectionAnalytics.queryCategories['marketing']++;
  }
}

// Function to get analytics report
export function getModelAnalytics() {
  // Calculate percentages
  const totalQueriesValue = modelSelectionAnalytics.totalQueries || 1; // Prevent division by zero
  
  const modelUsagePercentage = {};
  for (const [model, count] of Object.entries(modelSelectionAnalytics.modelUsage)) {
    modelUsagePercentage[model] = {
      count,
      percentage: Math.round((count / totalQueriesValue) * 100)
    };
  }
  
  const serverTypePercentage = {};
  for (const [serverType, count] of Object.entries(modelSelectionAnalytics.serverTypeUsage)) {
    serverTypePercentage[serverType] = {
      count,
      percentage: Math.round((count / totalQueriesValue) * 100)
    };
  }
  
  const selectionMethodPercentage = {
    userSelected: {
      count: modelSelectionAnalytics.userSelectedCount,
      percentage: Math.round((modelSelectionAnalytics.userSelectedCount / totalQueriesValue) * 100)
    },
    autoSelected: {
      count: modelSelectionAnalytics.autoSelectedCount,
      percentage: Math.round((modelSelectionAnalytics.autoSelectedCount / totalQueriesValue) * 100)
    }
  };
  
  // Return the complete analytics data
  return {
    totalQueries: modelSelectionAnalytics.totalQueries,
    modelUsage: modelUsagePercentage,
    serverTypeUsage: serverTypePercentage,
    selectionMethod: selectionMethodPercentage,
    queryCategories: modelSelectionAnalytics.queryCategories,
    timestamp: new Date().toISOString()
  };
}

// Function to reset analytics data (for testing purposes)
export function resetModelAnalytics() {
  modelSelectionAnalytics.totalQueries = 0;
  for (const model in modelSelectionAnalytics.modelUsage) {
    modelSelectionAnalytics.modelUsage[model] = 0;
  }
  for (const serverType in modelSelectionAnalytics.serverTypeUsage) {
    modelSelectionAnalytics.serverTypeUsage[serverType] = 0;
  }
  modelSelectionAnalytics.userSelectedCount = 0;
  modelSelectionAnalytics.autoSelectedCount = 0;
  for (const category in modelSelectionAnalytics.queryCategories) {
    modelSelectionAnalytics.queryCategories[category] = 0;
  }
  
  return { message: 'Analytics data reset', timestamp: new Date().toISOString() };
}
