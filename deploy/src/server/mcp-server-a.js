// Customer Preference & Purchase History MCP Server
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Mock database for customer data
const customersDB = [
  {
    id: "cust-001",
    name: "Alice Johnson",
    preferences: ["organic", "vegan", "sustainable", "natural"],
    loyaltyLevel: "gold",
    purchaseHistory: [
      { date: "2025-05-01", items: ["organic aloe vera moisturizer", "vegan lip balm", "bamboo face towel"] },
      { date: "2025-04-15", items: ["sustainable shampoo bar", "reusable cotton pads", "natural deodorant"] },
      { date: "2025-03-28", items: ["organic face serum", "vegan makeup remover", "eco-friendly hairbrush"] }
    ]
  },
  {
    id: "cust-002",
    name: "Bob Smith",
    preferences: ["fragrance-free", "sensitive skin", "cruelty-free"],
    loyaltyLevel: "silver",
    purchaseHistory: [
      { date: "2025-05-05", items: ["fragrance-free body wash", "sensitive skin moisturizer"] },
      { date: "2025-04-10", items: ["hypoallergenic face cream", "gentle exfoliator"] }
    ]
  },
  {
    id: "cust-003",
    name: "Carol Davis",
    preferences: ["anti-aging", "luxury", "spa"],
    loyaltyLevel: "platinum",
    purchaseHistory: [
      { date: "2025-05-08", items: ["premium anti-aging serum", "luxury face mask", "collagen supplement"] },
      { date: "2025-04-22", items: ["retinol cream", "jade roller", "vitamin C brightening drops"] },
      { date: "2025-03-15", items: ["luxury spa gift set", "premium face oils collection"] }
    ]
  }
];

// Define the tools for this MCP server
const GET_CUSTOMER_PREFERENCES_TOOL = {
  name: "get_customer_preferences",
  description: "Retrieves a customer's preferences and shopping habits",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The ID of the customer"
      },
      customerName: {
        type: "string",
        description: "The name of the customer. Can be used instead of customerId."
      }
    }
  }
};

const GET_PURCHASE_HISTORY_TOOL = {
  name: "get_purchase_history",
  description: "Retrieves a customer's purchase history",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The ID of the customer"
      },
      customerName: {
        type: "string",
        description: "The name of the customer. Can be used instead of customerId."
      },
      dateFrom: {
        type: "string",
        description: "The start date to filter the purchase history (YYYY-MM-DD)"
      },
      dateTo: {
        type: "string",
        description: "The end date to filter the purchase history (YYYY-MM-DD)"
      }
    },
    required: ["customerId"]
  }
};

const SEARCH_RELATED_PRODUCTS_TOOL = {
  name: "search_related_products",
  description: "Searches for products related to customer preferences and purchase history",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The ID of the customer"
      },
      customerName: {
        type: "string",
        description: "The name of the customer. Can be used instead of customerId."
      },
      query: {
        type: "string",
        description: "The search query for related products"
      },
      category: {
        type: "string",
        description: "The category to filter products"
      }
    },
    required: ["query"]
  }
};

// Create and run the server
const serverInfo = {
  title: "Customer Preference & Purchase History",
  description: "MCP Server for customer preferences and purchase history tracking"
};

const server = new Server(serverInfo, {
  capabilities: {
    tools: [GET_CUSTOMER_PREFERENCES_TOOL, GET_PURCHASE_HISTORY_TOOL, SEARCH_RELATED_PRODUCTS_TOOL]
  }
});

// Add prompts
server.prompts = [{
  name: "Demo Start",
  content: "You are a customer preference analysis assistant that helps understand customer shopping behaviors and preferences."
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
    
    // Prefer GPT-4o for complex customer analysis
    if (normalizedQuery.includes('analyze') || 
        normalizedQuery.includes('compare') || 
        normalizedQuery.includes('preferences') ||
        normalizedQuery.includes('history')) {
      return "gpt-4o";
    }
    
    // Prefer GPT-3.5 Turbo for quick requests
    if (normalizedQuery.includes('quick') || 
        normalizedQuery.includes('fast') || 
        normalizedQuery.length < 30) {
      return "gpt-35-turbo";
    }
    
    // Use GPT-4.1 for analytics and patterns
    if (normalizedQuery.includes('pattern') || 
        normalizedQuery.includes('trend') || 
        normalizedQuery.includes('analysis')) {
      return "gpt-4.1";
    }
    
    // Default for customer preferences is GPT-4o
    return "gpt-4o";
  }
};

// Helper function to find a customer by ID or name
function findCustomer(customerId, customerName) {
  if (customerId) {
    return customersDB.find(customer => customer.id === customerId);
  } else if (customerName) {
    return customersDB.find(customer => customer.name.toLowerCase() === customerName.toLowerCase());
  }
  return null;
}

// Implement tool handlers using the CallToolRequestSchema
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Handle different tools based on the name
  if (name === GET_CUSTOMER_PREFERENCES_TOOL.name) {
    // Customer preferences handler
    const { customerId, customerName } = args;
    const customer = findCustomer(customerId, customerName);
    
    if (!customer) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "Customer not found" }) }] };
    }
    
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          customerId: customer.id,
          name: customer.name,
          preferences: customer.preferences,
          loyaltyLevel: customer.loyaltyLevel
        }) 
      }]
    };
  } 
  else if (name === GET_PURCHASE_HISTORY_TOOL.name) {
    // Purchase history handler
    const { customerId, customerName, dateFrom, dateTo } = args;
    const customer = findCustomer(customerId, customerName);
    
    if (!customer) {
      return { content: [{ type: "text", text: JSON.stringify({ error: "Customer not found" }) }] };
    }
    
    let purchaseHistory = customer.purchaseHistory;
    
    // Apply date filters if provided
    if (dateFrom) {
      purchaseHistory = purchaseHistory.filter(purchase => purchase.date >= dateFrom);
    }
    
    if (dateTo) {
      purchaseHistory = purchaseHistory.filter(purchase => purchase.date <= dateTo);
    }
    
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          customerId: customer.id,
          name: customer.name,
          purchaseHistory: purchaseHistory
        }) 
      }]
    };
  } 
  else if (name === SEARCH_RELATED_PRODUCTS_TOOL.name) {
    // Search related products handler
    const { customerId, customerName, query, category } = args;
    
    let preferences = [];
    let purchasedItems = [];
    
    // If customer info is provided, use it to enhance recommendations
    if (customerId || customerName) {
      const customer = findCustomer(customerId, customerName);
      if (customer) {
        preferences = customer.preferences;
        purchasedItems = customer.purchaseHistory.flatMap(purchase => purchase.items);
      }
    }
    
    // Mock product search based on query, category, and customer data
    const relatedProducts = [];
    
    // Generate mock search results based on the query and customer preferences
    if (query.includes("sustainable") || preferences.includes("sustainable")) {
      relatedProducts.push(
        { name: "Bamboo toothbrush set", category: "Personal Care", sustainabilityScore: 9.5, price: "$12.99" },
        { name: "Reusable makeup remover pads", category: "Beauty", sustainabilityScore: 9.0, price: "$15.99" }
      );
    }
    
    if (query.includes("organic") || preferences.includes("organic")) {
      relatedProducts.push(
        { name: "Organic aloe vera moisturizer", category: "Skincare", organicCertified: true, price: "$24.99" },
        { name: "Organic shea butter lotion", category: "Body Care", organicCertified: true, price: "$18.50" }
      );
    }
    
    // Add some general recommendations based on the query
    if (query.includes("skincare") || query.includes("moisturizer")) {
      relatedProducts.push(
        { name: "Hydrating facial toner", category: "Skincare", bestSeller: true, price: "$22.99" },
        { name: "Night repair cream", category: "Skincare", price: "$34.99" }
      );
    }
    
    // Filter by category if provided
    const results = category 
      ? relatedProducts.filter(product => product.category.toLowerCase() === category.toLowerCase())
      : relatedProducts;
    
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          query: query,
          preferenceMatchScore: preferences.length > 0 ? 0.85 : 0.5,
          results: results
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
    console.log("Customer Preference & Purchase History MCP Server started");
  }).catch(err => {
    console.error("Error connecting server to transport:", err);
  });
} catch (err) {
  console.error("Failed to start MCP server:", err);
}
