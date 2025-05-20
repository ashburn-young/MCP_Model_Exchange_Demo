// Inventory & Supply Chain Analytics MCP Server
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { selectBestModel } from "./model-manager.js";

// Mock database for inventory data
const inventoryDB = [
  {
    id: "prod-001",
    name: "Organic Aloe Vera Moisturizer",
    category: "Skincare",
    currentStock: 128,
    reorderPoint: 50,
    supplierLeadTime: 7, // days
    priceHistory: [
      { date: "2025-05-01", price: 24.99 },
      { date: "2025-04-01", price: 22.99 },
      { date: "2025-03-01", price: 22.99 }
    ],
    salesVelocity: 6.2, // units per day
    sustainable: true,
    suppliers: [
      { id: "sup-001", name: "NaturalOrganics Co.", reliability: 0.95 },
      { id: "sup-002", name: "EcoBeauty Supplies", reliability: 0.88 }
    ],
    seasonalTrends: [
      { season: "Summer", demandMultiplier: 1.4 },
      { season: "Winter", demandMultiplier: 1.2 }
    ]
  },
  {
    id: "prod-002",
    name: "Vegan Lip Balm",
    category: "Lip Care",
    currentStock: 212,
    reorderPoint: 80,
    supplierLeadTime: 5, // days
    priceHistory: [
      { date: "2025-05-01", price: 8.99 },
      { date: "2025-04-01", price: 8.99 },
      { date: "2025-03-01", price: 7.99 }
    ],
    salesVelocity: 9.5, // units per day
    sustainable: true,
    suppliers: [
      { id: "sup-002", name: "EcoBeauty Supplies", reliability: 0.88 },
      { id: "sup-003", name: "VeganBeauty Inc.", reliability: 0.92 }
    ],
    seasonalTrends: [
      { season: "Winter", demandMultiplier: 1.6 },
      { season: "Fall", demandMultiplier: 1.3 }
    ]
  },
  {
    id: "prod-003",
    name: "Premium Anti-Aging Serum",
    category: "Skincare",
    currentStock: 45,
    reorderPoint: 30,
    supplierLeadTime: 10, // days
    priceHistory: [
      { date: "2025-05-01", price: 79.99 },
      { date: "2025-04-01", price: 79.99 },
      { date: "2025-03-01", price: 69.99 }
    ],
    salesVelocity: 2.8, // units per day
    sustainable: false,
    suppliers: [
      { id: "sup-004", name: "LuxuryBeauty Labs", reliability: 0.97 },
      { id: "sup-005", name: "PremiumCosmetics Ltd", reliability: 0.94 }
    ],
    seasonalTrends: [
      { season: "Spring", demandMultiplier: 1.2 },
      { season: "Winter", demandMultiplier: 1.1 }
    ]
  }
];

// Define the tools for this MCP server
const CHECK_INVENTORY_TOOL = {
  name: "check_inventory",
  description: "Checks the current inventory status of a product",
  inputSchema: {
    type: "object",
    properties: {
      productId: {
        type: "string",
        description: "The ID of the product"
      },
      productName: {
        type: "string",
        description: "The name of the product. Can be used instead of productId."
      }
    }
  }
};

const ANALYZE_PRICE_TRENDS_TOOL = {
  name: "analyze_price_trends",
  description: "Analyzes price trends for a product",
  inputSchema: {
    type: "object",
    properties: {
      productId: {
        type: "string",
        description: "The ID of the product"
      },
      productName: {
        type: "string",
        description: "The name of the product. Can be used instead of productId."
      }
    }
  }
};

const FORECAST_DEMAND_TOOL = {
  name: "forecast_demand",
  description: "Forecasts demand for a product based on historical data and seasonal trends",
  inputSchema: {
    type: "object",
    properties: {
      productId: {
        type: "string",
        description: "The ID of the product"
      },
      productName: {
        type: "string",
        description: "The name of the product. Can be used instead of productId."
      },
      timeframe: {
        type: "string",
        description: "The timeframe for the forecast (e.g., '7days', '30days', '90days')"
      }
    },
    required: ["timeframe"]
  }
};

// Create and run the server
const serverInfo = {
  title: "Inventory & Supply Chain Analytics",
  description: "MCP Server for inventory management and supply chain analytics"
};

const server = new Server(serverInfo, {
  capabilities: {
    tools: [CHECK_INVENTORY_TOOL, ANALYZE_PRICE_TRENDS_TOOL, FORECAST_DEMAND_TOOL]
  }
});

// Add prompts
server.prompts = [{
  name: "Demo Start",
  content: "You are an inventory and supply chain analytics assistant that helps with inventory management, price optimization, and demand forecasting."
}];

// Add dynamic model selection capabilities
server.modelSelection = {
  // Function to select the best model based on query characteristics
  selectModel: (query, modelPreference) => {
    // If user provided a model preference, use it if it's in our supported models
    if (modelPreference && ["gpt-4o", "gpt-4", "gpt-35-turbo", "gpt-4.1", "gpt-4.5-preview"].includes(modelPreference)) {
      return modelPreference;
    }
    
    // Normalize query for analysis
    const normalizedQuery = query.toLowerCase();
    
    // Use GPT-4.1 for forecasting and complex analytics
    if (normalizedQuery.includes('forecast') || 
        normalizedQuery.includes('predict') || 
        normalizedQuery.includes('trend') ||
        normalizedQuery.includes('future')) {
      return "gpt-4.1";
    }
    
    // Use GPT-4.5-preview for complex numerical analysis and optimization
    if (normalizedQuery.includes('optimize') || 
        normalizedQuery.includes('calculation') || 
        normalizedQuery.includes('efficiency') ||
        normalizedQuery.includes('maximize') ||
        normalizedQuery.includes('model')) {
      return "gpt-4.5-preview";
    }
    
    // Use GPT-4 for inventory specific detailed analysis
    if (normalizedQuery.includes('analyze') || 
        normalizedQuery.includes('compare') || 
        normalizedQuery.includes('evaluate') ||
        normalizedQuery.includes('supply chain')) {
      return "gpt-4";
    }
    
    // Use GPT-35-turbo for simple inventory checks and quick status reports
    if (normalizedQuery.includes('check') || 
        normalizedQuery.includes('status') || 
        normalizedQuery.includes('current') ||
        normalizedQuery.includes('list') ||
        normalizedQuery.length < 30) {
      return "gpt-35-turbo";
    }
    
    // Default for inventory analytics is GPT-4
    return "gpt-4";
  }
};

// Helper function to find a product by ID or name
function findProduct(productId, productName) {
  if (productId) {
    return inventoryDB.find(product => product.id === productId);
  } else if (productName) {
    return inventoryDB.find(product => 
      product.name.toLowerCase() === productName.toLowerCase() ||
      product.name.toLowerCase().includes(productName.toLowerCase())
    );
  }
  return null;
}

// Implement tool handlers using the CallToolRequestSchema
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Handle different tools based on the name
  if (name === CHECK_INVENTORY_TOOL.name) {
    // Check inventory handler
    const { productId, productName } = args;
    const product = findProduct(productId, productName);
    
    if (!product) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "Product not found" }) }] };
    }
    
    // Calculate days until reorder needed
    const daysUntilReorder = product.currentStock > product.reorderPoint ? 
      Math.floor((product.currentStock - product.reorderPoint) / product.salesVelocity) : 0;
    
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          productId: product.id,
          name: product.name,
          category: product.category,
          currentStock: product.currentStock,
          reorderPoint: product.reorderPoint,
          supplierLeadTime: product.supplierLeadTime,
          stockStatus: product.currentStock > product.reorderPoint ? "In Stock" : "Low Stock",
          daysUntilReorder: daysUntilReorder,
          recommendedAction: product.currentStock <= product.reorderPoint ? "Place order now" : 
            (daysUntilReorder <= product.supplierLeadTime ? "Plan to reorder soon" : "No action needed")
        }) 
      }]
    };
  } 
  else if (name === ANALYZE_PRICE_TRENDS_TOOL.name) {
    // Analyze price trends handler
    const { productId, productName } = args;
    const product = findProduct(productId, productName);
    
    if (!product) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "Product not found" }) }] };
    }
    
    // Calculate price trends
    const priceHistory = product.priceHistory;
    const latestPrice = priceHistory[0].price;
    const oldestPrice = priceHistory[priceHistory.length - 1].price;
    const priceChange = ((latestPrice - oldestPrice) / oldestPrice * 100).toFixed(2);
    
    // Determine price trend
    let trend;
    if (priceChange > 0) {
      trend = "Increasing";
    } else if (priceChange < 0) {
      trend = "Decreasing";
    } else {
      trend = "Stable";
    }
    
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          productId: product.id,
          name: product.name,
          category: product.category,
          currentPrice: latestPrice,
          priceHistory: priceHistory,
          priceTrend: {
            trend: trend,
            percentageChange: priceChange + "%",
            timeFrame: `${priceHistory[priceHistory.length - 1].date} to ${priceHistory[0].date}`
          }
        }) 
      }]
    };
  }
  else if (name === FORECAST_DEMAND_TOOL.name) {
    // Forecast demand handler
    const { productId, productName, forecastDays } = args;
    const product = findProduct(productId, productName);
    
    if (!product) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "Product not found" }) }] };
    }
    
    // Calculate forecast demand based on sales velocity and seasonal factors
    const daysToForecast = forecastDays || 30; // Default to 30 days if not specified
    const baseDemand = product.salesVelocity * daysToForecast;
    
    // Apply seasonal adjustments (mock logic)
    const currentMonth = new Date().getMonth() + 1;
    let seasonalFactor = 1.0;
    
    if (product.category === "Sun Protection" && (currentMonth >= 5 && currentMonth <= 8)) {
      seasonalFactor = 1.5; // Higher demand in summer months
    } else if (product.category === "Moisturizer" && (currentMonth <= 2 || currentMonth >= 11)) {
      seasonalFactor = 1.3; // Higher demand in winter months
    }
    
    const forecastDemand = Math.round(baseDemand * seasonalFactor);
    
    // Calculate stock sufficiency
    const stockSufficiency = product.currentStock >= forecastDemand ? 
      "Sufficient" : 
      product.currentStock >= forecastDemand * 0.7 ? "Borderline" : "Insufficient";
    
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          productId: product.id,
          name: product.name,
          category: product.category,
          forecastPeriod: `${daysToForecast} days`,
          projectedDemand: forecastDemand,
          currentStock: product.currentStock,
          stockSufficiency: stockSufficiency,
          recommendedOrder: stockSufficiency !== "Sufficient" ? forecastDemand - product.currentStock : 0
        }) 
      }]
    };
  }
  
  // Return error if tool name not recognized
  return {
    content: [{ type: "text", text: JSON.stringify({ error: `Tool not recognized: ${name}` }) }]
  };
});

// Start the server with stdio transport
try {
  const transport = new StdioServerTransport();
  server.connect(transport).then(() => {
    console.log("Inventory & Supply Chain Analytics MCP Server started");
  }).catch(err => {
    console.error("Error connecting server to transport:", err);
  });
} catch (err) {
  console.error("Failed to start MCP server:", err);
}
