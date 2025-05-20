// Model Manager for Smart Retail Assistant
// Manages available models and model selection

// Define all available models
export const AVAILABLE_MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Most advanced model with multimodal capabilities',
    capabilities: ['customer preferences', 'inventory analytics', 'marketing optimization'],
    contextWindow: 128000,
    priority: 1,
    strengths: ['complex analysis', 'detailed explanation', 'multiple capabilities']
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'High-capability model for complex reasoning tasks',
    capabilities: ['customer preferences', 'inventory analytics', 'marketing optimization'],
    contextWindow: 8192,
    priority: 2,
    strengths: ['reasoning', 'balanced performance', 'inventory analytics']
  },
  {
    id: 'gpt-35-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient model for general tasks',
    capabilities: ['customer preferences', 'inventory analytics', 'marketing optimization'],
    contextWindow: 4096,
    priority: 3,
    strengths: ['speed', 'efficiency', 'simple queries']
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    description: 'Advanced reasoning capabilities with improved knowledge',
    capabilities: ['customer preferences', 'inventory analytics', 'marketing optimization'],
    contextWindow: 32768,
    priority: 1,
    strengths: ['analytics', 'forecasting', 'pattern recognition']
  },
  {
    id: 'gpt-4.5-preview',
    name: 'GPT-4.5 Preview',
    description: 'Preview of next generation GPT with enhanced capabilities',
    capabilities: ['customer preferences', 'inventory analytics', 'marketing optimization'],
    contextWindow: 65536,
    priority: 1,
    strengths: ['creative generation', 'marketing', 'innovation']
  }
];

// Default model selection per domain
export const DEFAULT_MODEL_MAPPINGS = {
  'Customer Preferences': 'gpt-4o',
  'Inventory Analytics': 'gpt-4',
  'Marketing Optimization': 'gpt-35-turbo'
};

// Function to select the best model based on query context, user preferences, and availability
export function selectBestModel(query, serverType, preferredModel = null) {
  // If user specified a preferred model, use it if available
  if (preferredModel) {
    const modelExists = AVAILABLE_MODELS.some(model => model.id === preferredModel);
    if (modelExists) {
      return preferredModel;
    }
  }
  
  // Normalize query for analysis
  const normalizedQuery = query.toLowerCase();
  let score = {};
  
  // Initialize scores for each model
  AVAILABLE_MODELS.forEach(model => {
    score[model.id] = 0;
  });
  
  // 1. Complexity-based scoring
  const complexityKeywords = [
    'complex', 'detailed', 'analyze', 'comprehensive', 'thorough', 
    'in-depth', 'analyze', 'compare', 'breakdown', 'reasoning',
    'root cause', 'investigate', 'explain why', 'explain how'
  ];
  
  const speedKeywords = [
    'fast', 'quick', 'brief', 'short', 'summary', 'simple',
    'summarize', 'list', 'bullet', 'quickly', 'brief overview'
  ];
  
  const analyticsKeywords = [
    'trends', 'patterns', 'analytics', 'statistics', 'metrics',
    'performance', 'forecast', 'predict', 'projection', 'analysis'
  ];
  
  const creativeKeywords = [
    'create', 'design', 'generate', 'innovative', 'creative',
    'marketing', 'promotion', 'campaign', 'slogan', 'naming'
  ];
  
  // Check complexity keywords
  complexityKeywords.forEach(keyword => {
    if (normalizedQuery.includes(keyword)) {
      score['gpt-4o'] += 2;
      score['gpt-4.1'] += 1.8;
      score['gpt-4.5-preview'] += 1.9;
      score['gpt-4'] += 1.5;
    }
  });
  
  // Check speed keywords
  speedKeywords.forEach(keyword => {
    if (normalizedQuery.includes(keyword)) {
      score['gpt-35-turbo'] += 2;
      score['gpt-4o'] += 0.5;
    }
  });
  
  // Check analytics keywords
  analyticsKeywords.forEach(keyword => {
    if (normalizedQuery.includes(keyword)) {
      score['gpt-4o'] += 1.5;
      score['gpt-4.1'] += 1.7;
      score['gpt-4'] += 1.4;
      score['gpt-4.5-preview'] += 1.6;
    }
  });
  
  // Check creative keywords
  creativeKeywords.forEach(keyword => {
    if (normalizedQuery.includes(keyword)) {
      score['gpt-4.1'] += 1.8;
      score['gpt-4o'] += 1.6;
      score['gpt-4.5-preview'] += 2;
      score['gpt-4'] += 1.4;
    }
  });
  
  // 2. Query length-based scoring (longer queries need more capable models)
  const wordCount = normalizedQuery.split(' ').length;
  if (wordCount > 40) {
    score['gpt-4o'] += 1.5;
    score['gpt-4.1'] += 1.4;
    score['gpt-4.5-preview'] += 1.4;
  } else if (wordCount > 20) {
    score['gpt-4o'] += 1;
    score['gpt-4'] += 0.8;
  } else if (wordCount < 10) {
    score['gpt-35-turbo'] += 1;
  }
  
  // 3. Domain-specific intelligence
  // Customer preferences
  if (serverType === 'Customer Preferences') {
    score['gpt-4o'] += 1;
  } 
  // Inventory Analytics 
  else if (serverType === 'Inventory Analytics') {
    score['gpt-4'] += 1;
    score['gpt-4.1'] += 1.2;
  } 
  // Marketing Optimization
  else if (serverType === 'Marketing Optimization') {
    score['gpt-35-turbo'] += 0.8;
    score['gpt-4.5-preview'] += 1.2;
  }
  
  // 4. Find the model with the highest score
  let bestModel = 'gpt-4o'; // Default
  let highestScore = 0;
  
  for (const [modelId, modelScore] of Object.entries(score)) {
    if (modelScore > highestScore) {
      highestScore = modelScore;
      bestModel = modelId;
    }
  }
  
  // 5. If no clear best model (all scores are 0), use the domain default
  if (highestScore === 0) {
    return DEFAULT_MODEL_MAPPINGS[serverType] || 'gpt-4o';
  }
  
  return bestModel;
}

// Function to get available models information for the client
export function getAvailableModels() {
  return AVAILABLE_MODELS.map(model => ({
    id: model.id,
    name: model.name,
    description: model.description
  }));
}

// Function to check if a model is valid
export function isValidModel(modelId) {
  return AVAILABLE_MODELS.some(model => model.id === modelId);
}
