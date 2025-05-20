// Main server file for the Smart Retail Assistant
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { getMockResponse } from './mock-responses.js';
import logger, { requestLogger, errorLogger } from './logger.js';
import { AVAILABLE_MODELS, selectBestModel, getAvailableModels, isValidModel } from './model-manager.js';
import { trackModelSelection, getModelAnalytics, resetModelAnalytics } from './model-analytics.js';

// ES Module polyfills for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(requestLogger);  // Add request logging

// Diagnostic endpoint for CORS testing
app.get('/api/ping', (req, res) => {
  logger.info('Ping request received');
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Create MCP server processes
const mcpServers = {
  customerPreferences: null,
  inventoryAnalytics: null,
  marketingOptimization: null
};

// Flag to check if any MCP server is running
let mcpServerRunning = false;

// Azure OpenAI configuration
const azureOpenAIApiKey = process.env.AZURE_OPENAI_API_KEY;
const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const modelGroup = process.env.AZURE_OPENAI_MODEL_GROUP;

    // Initialize Azure OpenAI client if credentials are available
let openAIClient = null;
try {
  if (azureOpenAIApiKey && azureOpenAIEndpoint) {
    openAIClient = new OpenAIClient(
      azureOpenAIEndpoint,
      new AzureKeyCredential(azureOpenAIApiKey)
    );
    logger.info('Azure OpenAI client initialized successfully', {
      endpoint: azureOpenAIEndpoint,
      modelGroup: modelGroup || 'default'
    });
  } else {
    logger.warn('Azure OpenAI credentials not provided, using mock responses only');
  }
} catch (error) {
  logger.error('Error initializing Azure OpenAI client', {
    error: error.message,
    stack: error.stack
  });
  logger.warn('Will use mock responses for all queries');
}

// Function to start MCP servers
function startMCPServers() {
  try {
    logger.info('Starting MCP servers...');
    
    // Start Customer Preference & Purchase History MCP Server
    mcpServers.customerPreferences = spawn('node', [path.join(__dirname, 'mcp-server-a.js')]);
    
    mcpServers.customerPreferences.stdout.on('data', (data) => {
      logger.info(`Customer Preferences MCP: ${data}`);
    });
    
    mcpServers.customerPreferences.stderr.on('data', (data) => {
      logger.error(`Customer Preferences MCP Error: ${data}`);
    });
    
    mcpServers.customerPreferences.on('close', (code) => {
      logger.warn(`Customer Preferences MCP exited with code ${code}`);
      mcpServers.customerPreferences = null;
      // Only try to restart if it's not a syntax error
      if (code !== 1) {
        logger.info('Restarting Customer Preferences MCP server...');
        mcpServers.customerPreferences = spawn('node', [path.join(__dirname, 'mcp-server-a.js')]);
      }
    });
    
    // Start Inventory & Supply Chain Analytics MCP Server
    mcpServers.inventoryAnalytics = spawn('node', [path.join(__dirname, 'mcp-server-b.js')]);
    
    mcpServers.inventoryAnalytics.stdout.on('data', (data) => {
      logger.info(`Inventory Analytics MCP: ${data}`);
    });
    
    mcpServers.inventoryAnalytics.stderr.on('data', (data) => {
      logger.error(`Inventory Analytics MCP Error: ${data}`);
    });
    
    mcpServers.inventoryAnalytics.on('close', (code) => {
      logger.warn(`Inventory Analytics MCP exited with code ${code}`);
      mcpServers.inventoryAnalytics = null;
      // Only try to restart if it's not a syntax error
      if (code !== 1) {
        logger.info('Restarting Inventory Analytics MCP server...');
        mcpServers.inventoryAnalytics = spawn('node', [path.join(__dirname, 'mcp-server-b.js')]);
      }
    });
    
    // Start Promotion & Marketing Optimization MCP Server
    mcpServers.marketingOptimization = spawn('node', [path.join(__dirname, 'mcp-server-c.js')]);
    
    mcpServers.marketingOptimization.stdout.on('data', (data) => {
      logger.info(`Marketing Optimization MCP: ${data}`);
    });
    
    mcpServers.marketingOptimization.stderr.on('data', (data) => {
      logger.error(`Marketing Optimization MCP Error: ${data}`);
    });
    
    mcpServers.marketingOptimization.on('close', (code) => {
      logger.warn(`Marketing Optimization MCP exited with code ${code}`);
      mcpServers.marketingOptimization = null;
      // Only try to restart if it's not a syntax error
      if (code !== 1) {
        logger.info('Restarting Marketing Optimization MCP server...');
        mcpServers.marketingOptimization = spawn('node', [path.join(__dirname, 'mcp-server-c.js')]);
      }
    });
    
    logger.info('All MCP servers started');
    
    // Set a timeout to check if MCP servers are running
    setTimeout(() => {
      // If all servers have exited with errors, set the flag
      if (!mcpServers.customerPreferences && !mcpServers.inventoryAnalytics && !mcpServers.marketingOptimization) {
        logger.error('All MCP servers have exited with errors - will use mock responses only');
        mcpServerRunning = false;
      } else {
        mcpServerRunning = true;
      }
    }, 2000);
  } catch (error) {
    logger.error('Error starting MCP servers:', { error: error.message, stack: error.stack });
    mcpServerRunning = false;
  }
}

// Start MCP servers when the main server starts
startMCPServers();

// Helper function to select the appropriate MCP server and model based on the query
function routeQuery(query, preferredModel = null) {
  let serverType;
  let mcpServer;
  
  // Simple routing logic based on keywords in the query
  if (query.includes('preference') || query.includes('history') || query.includes('purchased')) {
    serverType = 'Customer Preferences';
    mcpServer = mcpServerRunning ? mcpServers.customerPreferences : null;
  } else if (query.includes('inventory') || query.includes('stock') || query.includes('supply')) {
    serverType = 'Inventory Analytics';
    mcpServer = mcpServerRunning ? mcpServers.inventoryAnalytics : null;
  } else if (query.includes('promotion') || query.includes('discount') || query.includes('marketing')) {
    serverType = 'Marketing Optimization';
    mcpServer = mcpServerRunning ? mcpServers.marketingOptimization : null;
  } else {
    // Default to customer preferences if no specific keywords are found
    serverType = 'Customer Preferences';
    mcpServer = mcpServerRunning ? mcpServers.customerPreferences : null;
  }
  
  // Select the best model using our model manager
  const model = selectBestModel(query, serverType, preferredModel);
  
  // Determine simple reasoning for the model selection
  let modelSelectionReason = "";
  
  if (preferredModel) {
    modelSelectionReason = `User-selected model (${preferredModel})`;
  } else {
    // General reasoning based on query content
    if (model === 'gpt-4o') {
      if (query.includes('complex') || query.includes('detailed') || query.includes('analyze')) {
        modelSelectionReason = "Selected for complex analysis capabilities";
      } else {
        modelSelectionReason = "Selected as the most capable model for this query";
      }
    } else if (model === 'gpt-35-turbo') {
      if (query.includes('fast') || query.includes('quick') || query.includes('summary')) {
        modelSelectionReason = "Selected for speed and efficiency";
      } else {
        modelSelectionReason = "Selected as the most suitable model for this simple query";
      }
    } else if (model === 'gpt-4.1') {
      if (query.includes('trends') || query.includes('analytics') || query.includes('patterns')) {
        modelSelectionReason = "Selected for advanced analytics capabilities";
      } else {
        modelSelectionReason = "Selected for advanced reasoning capabilities";
      }
    } else if (model === 'gpt-4.5-preview') {
      if (query.includes('create') || query.includes('design') || query.includes('generate')) {
        modelSelectionReason = "Selected for creative generation capabilities";
      } else {
        modelSelectionReason = "Selected for cutting-edge capabilities";
      }
    } else if (model === 'gpt-4') {
      modelSelectionReason = "Selected for balanced performance";
    }
  }
  
  return {
    mcpServer,
    model,
    serverType,
    modelSelectionReason
  };
}

// API endpoint to handle customer inquiries
app.post('/api/inquiry', async (req, res) => {
  try {
    const { query, customerId, customerName, preferredModel } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required',
        details: 'Please provide a question or inquiry for the retail assistant',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate preferred model if provided
    if (preferredModel && !isValidModel(preferredModel)) {
      logger.warn(`Invalid model requested: ${preferredModel}`);
      return res.status(400).json({
        error: 'Invalid model',
        details: `The requested model '${preferredModel}' is not available. Please choose from the available models.`,
        availableModels: getAvailableModels(),
        timestamp: new Date().toISOString()
      });
    }
    
    // Route the query to the appropriate MCP server and model
    const { mcpServer, model, serverType, modelSelectionReason } = routeQuery(query, preferredModel);
    
    // Log model selection for analytics
    trackModelSelection(
      query, 
      serverType, 
      model, 
      !!preferredModel, // true if user selected a model
      modelSelectionReason
    );
    
    logger.info('Processing inquiry', {
      query,
      serverType,
      requestedModel: preferredModel,
      selectedModel: model,
      dynamicSelection: !preferredModel, // Log if dynamic selection was used
      modelSelectionReason: modelSelectionReason
    });
    
    // Always try to use Azure OpenAI models when available, fall back to mock responses when needed
    let responseContent;
    let modelVersion = ""; // Store model version information
    let usingMock = false;
    let errorDetails = null;
    
    // Check if we can use the Azure OpenAI client
    if (!openAIClient) {
      logger.warn('Azure OpenAI client not available, using mock response for query', { query });
      responseContent = getMockResponse(query, serverType);
      usingMock = true;
      errorDetails = 'Azure OpenAI client not configured or unavailable';
    } else {
      try {
        logger.info(`Processing query with Azure OpenAI`, { query, model, serverType });
        
        // Process the query with Azure OpenAI
        const response = await openAIClient.getChatCompletions(
          // Use the model determined by routing
          model,
          [
            { role: 'system', content: `You are an AI-powered retail assistant using the ${serverType} MCP server. Process customer inquiries about retail products and services.` },
            { role: 'user', content: query }
          ],
          {
            temperature: 0.7,
            maxTokens: 800
          }
        );
        
        // Extract model version information if available
        if (response.model) {
          modelVersion = response.model;
        }
        
        responseContent = response.choices[0].message.content;
      } catch (error) {
        logger.error('Error with Azure OpenAI request', {
          error: error.message,
          stack: error.stack,
          query,
          model,
          serverType
        });
        logger.warn('Falling back to mock response', { query, serverType });
        responseContent = getMockResponse(query, serverType);
        usingMock = true;
        
        // Capture detailed error information for debugging and client feedback
        errorDetails = {
          message: error.message || 'Unknown error with Azure OpenAI',
          code: error.code || 'UNKNOWN_ERROR',
          statusCode: error.statusCode || 500,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Return the AI response
  res.json({
    response: responseContent,
    serverType: serverType,
    model: model,
    modelVersion: modelVersion || "unknown",
    modelSelectionReason: modelSelectionReason || "Default model selection",
    usingMock: usingMock,
    errorDetails: errorDetails,
    availableModels: getAvailableModels(),
    timestamp: new Date().toISOString()
  });
    
  } catch (error) {
    console.error('Error processing inquiry:', error);
    res.status(500).json({ 
      error: 'Failed to process inquiry',
      details: error.message || 'Unknown server error',
      timestamp: new Date().toISOString(),
      path: '/api/inquiry',
      query: req.body.query || 'empty query'
    });
  }
});

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    mcpServers: {
      customerPreferences: !!mcpServers.customerPreferences,
      inventoryAnalytics: !!mcpServers.inventoryAnalytics,
      marketingOptimization: !!mcpServers.marketingOptimization
    }
  };
  
  // Check if all MCP servers are running
  if (Object.values(healthStatus.mcpServers).some(status => !status)) {
    return res.status(503).json({
      ...healthStatus,
      status: 'degraded'
    });
  }
  
  res.json(healthStatus);
});

// API endpoint to get information about available MCP servers and models
app.get('/api/serverinfo', (req, res) => {
  // Get available models
  const availableModels = getAvailableModels();
  
  const serverInfo = [
    {
      id: 'customer-preferences',
      name: 'Customer Preference & Purchase History',
      defaultModel: 'gpt-4o',
      supportedModels: availableModels,
      description: 'Analyzes customer preferences and purchase history',
      capabilities: [
        'Customer preference analysis',
        'Purchase history tracking',
        'Product recommendations',
        'Customer loyalty insights'
      ],
      exampleQueries: [
        'What products would you recommend based on my purchase history?',
        'Show me my recent purchases of sustainable products',
        'What are my shopping preferences?'
      ]
    },
    {
      id: 'inventory-analytics',
      name: 'Inventory & Supply Chain Analytics',
      defaultModel: 'gpt-4',
      supportedModels: availableModels,
      description: 'Provides insights into inventory status and supply chain',
      capabilities: [
        'Real-time inventory tracking',
        'Supply chain optimization',
        'Demand forecasting',
        'Price analysis'
      ],
      exampleQueries: [
        'What\'s the current inventory status for face moisturizers?',
        'When will we need to restock moisturizers based on current demand?',
        'Show me price trends for premium skincare products'
      ]
    },
    {
      id: 'marketing-optimization',
      name: 'Promotion & Marketing Optimization',
      defaultModel: 'gpt-35-turbo',
      supportedModels: availableModels,
      description: 'Optimizes marketing campaigns and promotions',
      capabilities: [
        'Campaign effectiveness analysis',
        'Personalized promotion generation',
        'Customer segment targeting',
        'Marketing ROI calculation'
      ],
      exampleQueries: [
        'Create a promotion for our summer skincare collection',
        'What discount strategy would work best for luxury products?',
        'Analyze the effectiveness of our last discount campaign'
      ]
    }
  ];
  
  res.json(serverInfo);
});

// API endpoint to get available models
app.get('/api/models', (req, res) => {
  try {
    const models = getAvailableModels().map(model => ({
      id: model.id,
      name: model.name,
      description: model.description,
      strengths: model.strengths || []
    }));
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      models: models,
      timestamp: new Date().toISOString()
    });
    
    logger.info('Models information requested', { 
      clientIP: req.ip,
      modelsCount: models.length 
    });
  } catch (error) {
    logger.error('Error fetching models information', { 
      error: error.message,
      stack: error.stack 
    });
    
    res.status(500).json({
      error: 'Failed to fetch models information',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint to get model selection analytics
app.get('/api/model-analytics', (req, res) => {
  try {
    const analytics = getModelAnalytics();
    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching model analytics', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch model analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// Admin endpoint to reset analytics (protected in production)
app.post('/api/reset-analytics', (req, res) => {
  try {
    // In a production environment, this would be protected with authentication
    const result = resetModelAnalytics();
    res.json(result);
  } catch (error) {
    logger.error('Error resetting analytics', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to reset analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// Serve static files from the React client
app.use(express.static(path.join(__dirname, '../client/build')));

// Serve the React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Add error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    azureEndpoint: azureOpenAIEndpoint,
    modelGroup: modelGroup,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    
    // Terminate MCP server processes
    Object.values(mcpServers).forEach(process => {
      if (process) {
        process.kill();
      }
    });
    
    console.log('All MCP servers terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    
    // Terminate MCP server processes
    Object.values(mcpServers).forEach(process => {
      if (process) {
        process.kill();
      }
    });
    
    console.log('All MCP servers terminated');
    process.exit(0);
  });
});
