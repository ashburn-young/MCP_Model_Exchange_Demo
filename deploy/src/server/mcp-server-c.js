// Promotion & Marketing Optimization MCP Server
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Mock database for marketing data
const marketingDB = {
  activePromotions: [
    {
      id: "promo-001",
      name: "Summer Skincare Sale",
      startDate: "2025-05-01",
      endDate: "2025-05-31",
      discount: "20%",
      applicableCategories: ["Skincare", "Sun Protection"],
      minimumPurchase: 30.00,
      redemptionRate: 0.18, // 18% of eligible customers use this promotion
      incrementalRevenue: 15200.00,
      customerSegments: ["skincare enthusiasts", "summer shoppers"]
    },
    {
      id: "promo-002",
      name: "Sustainable Beauty Bundle",
      startDate: "2025-04-15",
      endDate: "2025-06-15",
      discount: "15%",
      applicableCategories: ["Eco-Friendly", "Vegan", "Sustainable"],
      minimumPurchase: 45.00,
      redemptionRate: 0.22,
      incrementalRevenue: 18500.00,
      customerSegments: ["eco-conscious", "vegan"]
    },
    {
      id: "promo-003",
      name: "Loyalty Member Appreciation",
      startDate: "2025-05-10",
      endDate: "2025-05-20",
      discount: "25%",
      applicableCategories: ["All"],
      minimumPurchase: 0.00,
      loyaltyTierRequired: "Gold",
      redemptionRate: 0.45,
      incrementalRevenue: 22400.00,
      customerSegments: ["loyalty program members", "repeat customers"]
    }
  ],
  campaignPerformance: [
    {
      id: "camp-001",
      name: "Spring Skincare Revival",
      platform: "Email",
      startDate: "2025-03-01",
      endDate: "2025-03-31",
      audience: 25000,
      impressions: 22500,
      clicks: 3600,
      conversions: 720,
      revenue: 36000.00,
      roas: 5.2
    },
    {
      id: "camp-002",
      name: "Earth Day Campaign",
      platform: "Social Media",
      startDate: "2025-04-15",
      endDate: "2025-04-25",
      audience: 150000,
      impressions: 120000,
      clicks: 15000,
      conversions: 1800,
      revenue: 81000.00,
      roas: 7.8
    },
    {
      id: "camp-003",
      name: "Mother's Day Gift Guide",
      platform: "Email + Social Media",
      startDate: "2025-05-01",
      endDate: "2025-05-12",
      audience: 180000,
      impressions: 152000,
      clicks: 20500,
      conversions: 3200,
      revenue: 192000.00,
      roas: 8.3
    }
  ],
  marketTrends: [
    {
      category: "Skincare",
      growthRate: 0.12,
      topSellingProducts: ["Hyaluronic Acid Serum", "Vitamin C Brightening Cream", "SPF 50 Daily Moisturizer"],
      emergingTrends: ["Microbiome-friendly products", "Refillable packaging", "Blue light protection"],
      customerDemographics: {
        ageGroups: ["25-34", "35-44"],
        interests: ["self-care", "wellness", "natural ingredients"]
      }
    },
    {
      category: "Sustainable Beauty",
      growthRate: 0.28,
      topSellingProducts: ["Bamboo Makeup Brushes", "Refillable Lipstick", "Zero-waste Shampoo Bars"],
      emergingTrends: ["Waterless formulas", "Compostable packaging", "Carbon-neutral brands"],
      customerDemographics: {
        ageGroups: ["18-24", "25-34"],
        interests: ["environmentalism", "social responsibility", "minimal waste"]
      }
    },
    {
      category: "Anti-Aging",
      growthRate: 0.08,
      topSellingProducts: ["Retinol Night Cream", "Peptide Eye Serum", "Collagen Supplements"],
      emergingTrends: ["Non-invasive alternatives", "Preventative skincare for younger customers", "Targeted treatments"],
      customerDemographics: {
        ageGroups: ["35-44", "45-54", "55+"],
        interests: ["longevity", "luxury experience", "clinical results"]
      }
    }
  ]
};

// Define the tools for this MCP server
const GET_ACTIVE_PROMOTIONS_TOOL = {
  name: "get_active_promotions",
  description: "Retrieves active promotions and their performance metrics",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: "Filter promotions by product category"
      },
      customerSegment: {
        type: "string",
        description: "Filter promotions by customer segment"
      }
    }
  }
};

const CAMPAIGN_PERFORMANCE_TOOL = {
  name: "analyze_campaign_performance",
  description: "Analyzes performance metrics for marketing campaigns",
  inputSchema: {
    type: "object",
    properties: {
      campaignId: {
        type: "string",
        description: "The ID of the specific campaign to analyze"
      },
      platform: {
        type: "string",
        description: "Filter campaigns by platform (e.g., Email, Social Media)"
      },
      timeframe: {
        type: "string",
        description: "Timeframe for analysis (e.g., 'last30days', 'last90days')"
      }
    }
  }
};

const GENERATE_PROMOTION_TOOL = {
  name: "generate_personalized_promotion",
  description: "Generates a personalized promotion based on customer data and current trends",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The ID of the customer for personalization"
      },
      customerSegment: {
        type: "string",
        description: "The customer segment for targeting"
      },
      productCategory: {
        type: "string",
        description: "The product category for the promotion"
      },
      discountLevel: {
        type: "string",
        description: "Preferred discount level (e.g., 'low', 'medium', 'high')"
      }
    },
    required: ["customerSegment"]
  }
};

// Create and run the server
const serverInfo = {
  title: "Promotion & Marketing Optimization",
  description: "MCP Server for promotion and marketing campaign optimization"
};

const server = new Server(serverInfo, {
  capabilities: {
    tools: [GET_ACTIVE_PROMOTIONS_TOOL, CAMPAIGN_PERFORMANCE_TOOL, GENERATE_PROMOTION_TOOL]
  }
});

// Add prompts
server.prompts = [{
  name: "Demo Start",
  content: "You are a marketing optimization assistant that helps analyze campaign performance and generate personalized promotions."
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
    
    // Use GPT-4.5-preview for creative tasks (campaign and promotion generation)
    if (normalizedQuery.includes('create') || 
        normalizedQuery.includes('generate') || 
        normalizedQuery.includes('design') ||
        normalizedQuery.includes('promotion') ||
        normalizedQuery.includes('campaign')) {
      return "gpt-4.5-preview";
    }
    
    // Use GPT-4.1 for ROI and performance analysis
    if (normalizedQuery.includes('roi') || 
        normalizedQuery.includes('performance') || 
        normalizedQuery.includes('analysis') ||
        normalizedQuery.includes('metrics')) {
      return "gpt-4.1";
    }
    
    // Use GPT-4o for complex marketing strategy questions
    if (normalizedQuery.includes('strategy') || 
        normalizedQuery.includes('complex') || 
        normalizedQuery.includes('competitive')) {
      return "gpt-4o";
    }
    
    // Default to GPT-3.5 Turbo for Marketing Optimization (our faster default)
    return "gpt-35-turbo";
  }
};

// Implement tool handlers using the CallToolRequestSchema
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Handle different tools based on the name
  if (name === GET_ACTIVE_PROMOTIONS_TOOL.name) {
    // Get active promotions handler
    const { category } = args || {};
    
    let promotions = marketingDB.activePromotions;
    
    // Filter by category if provided
    if (category) {
      promotions = promotions.filter(promo => 
        promo.applicableCategories.some(cat => 
          cat.toLowerCase() === category.toLowerCase()
        )
      );
    }
    
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          count: promotions.length,
          promotions: promotions
        }) 
      }]
    };
  } 
  else if (name === CAMPAIGN_PERFORMANCE_TOOL.name) {
    // Analyze campaign performance handler
    const { campaignId, platform, timeframe } = args;
    
    let campaigns = [...marketingDB.campaignPerformance];
    
    // Filter by campaign ID if provided
    if (campaignId) {
      campaigns = campaigns.filter(campaign => campaign.id === campaignId);
    }
    
    // Filter by platform if provided
    if (platform) {
      campaigns = campaigns.filter(campaign => 
        campaign.platform.toLowerCase().includes(platform.toLowerCase())
      );
    }
    
    // Filter by timeframe if provided
    if (timeframe) {
      const now = new Date();
      let daysBack = 30;
      
      if (timeframe.includes("90")) {
        daysBack = 90;
      } else if (timeframe.includes("60")) {
        daysBack = 60;
      }
      
      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      
      campaigns = campaigns.filter(campaign => {
        const endDate = new Date(campaign.endDate);
        return endDate >= cutoffDate;
      });
    }
    
    // Calculate aggregate metrics
    const aggregateMetrics = campaigns.reduce((metrics, campaign) => {
      metrics.totalImpressions += campaign.impressions;
      metrics.totalClicks += campaign.clicks;
      metrics.totalConversions += campaign.conversions;
      metrics.totalRevenue += campaign.revenue;
      
      return metrics;
    }, { totalImpressions: 0, totalClicks: 0, totalConversions: 0, totalRevenue: 0 });
    
    // Calculate derived metrics
    const ctr = aggregateMetrics.totalImpressions > 0 
      ? (aggregateMetrics.totalClicks / aggregateMetrics.totalImpressions) * 100 
      : 0;
    
    const conversionRate = aggregateMetrics.totalClicks > 0 
      ? (aggregateMetrics.totalConversions / aggregateMetrics.totalClicks) * 100 
      : 0;
    
    const averageOrderValue = aggregateMetrics.totalConversions > 0 
      ? aggregateMetrics.totalRevenue / aggregateMetrics.totalConversions 
      : 0;
    
    // Sort campaigns by ROAS
    const topPerformingCampaigns = [...campaigns].sort((a, b) => b.roas - a.roas);
    
    return {
      campaigns: campaigns,
      metrics: {
        ...aggregateMetrics,
        ctr: ctr.toFixed(2) + "%",
        conversionRate: conversionRate.toFixed(2) + "%",
        averageOrderValue: averageOrderValue.toFixed(2)
      },
      topPerforming: topPerformingCampaigns.length > 0 ? topPerformingCampaigns[0] : null,
      recommendations: [
        "Focus on campaigns with higher ROAS",
        "Optimize underperforming campaigns by adjusting targeting parameters",
        "Consider expanding successful campaign formats to new audiences"
      ]
    };
  }
  else if (name === GENERATE_PROMOTION_TOOL.name) {
    // Generate promotion handler
    const { customerId, customerSegment, productCategory, discountLevel } = args;
    
    // Default discount percentage based on the discountLevel parameter
    let discountPercentage = 15;
    if (discountLevel === "low") {
      discountPercentage = 10;
    } else if (discountLevel === "medium") {
      discountPercentage = 15;
    } else if (discountLevel === "high") {
      discountPercentage = 25;
    }
    
    // Find relevant market trend if product category is provided
    let relevantTrend = null;
    if (productCategory) {
      relevantTrend = marketingDB.marketTrends.find(trend => 
        trend.category.toLowerCase() === productCategory.toLowerCase() ||
        trend.category.toLowerCase().includes(productCategory.toLowerCase())
      );
    }
    
    // Generate promotion based on customer segment
    let promotionName, description, applicableProducts, minimumPurchase, validityPeriod;
    
    if (customerSegment && customerSegment.toLowerCase().includes("eco-conscious")) {
      promotionName = "Eco-Friendly Beauty Bundle";
      description = `Save ${discountPercentage}% on sustainable and eco-friendly beauty products.`;
      applicableProducts = ["Bamboo Makeup Brushes", "Refillable Lipstick", "Zero-waste Shampoo Bars", "All sustainable products"];
      minimumPurchase = 30.00;
      validityPeriod = "30 days";
    } else if (customerSegment && customerSegment.toLowerCase().includes("skincare")) {
      promotionName = "Advanced Skincare Bundle";
      description = `Enjoy ${discountPercentage}% off on premium skincare products.`;
      applicableProducts = ["Hyaluronic Acid Serum", "Vitamin C Brightening Cream", "SPF 50 Daily Moisturizer", "All skincare products"];
      minimumPurchase = 40.00;
      validityPeriod = "21 days";
    } else if (customerSegment && customerSegment.toLowerCase().includes("loyal")) {
      promotionName = "Loyal Customer Appreciation";
      description = `As a valued customer, enjoy ${discountPercentage}% off your next purchase.`;
      applicableProducts = ["Any product in our store"];
      minimumPurchase = 0.00;
      validityPeriod = "14 days";
    } else {
      promotionName = "New Customer Welcome Offer";
      description = `Welcome! Get ${discountPercentage}% off your first purchase.`;
      applicableProducts = ["Any product in our store"];
      minimumPurchase = 25.00;
      validityPeriod = "10 days";
    }
    
    // Add trending products if available
    let trendingRecommendations = [];
    if (relevantTrend) {
      trendingRecommendations = relevantTrend.topSellingProducts;
    }
    
    // Generate a unique promotion code
    const promoCode = `${customerSegment ? customerSegment.substring(0, 3).toUpperCase() : "NEW"}${Math.floor(Math.random() * 10000)}`;
    
    return {
      promotionName: promotionName,
      description: description,
      promoCode: promoCode,
      discountPercentage: discountPercentage,
      applicableProducts: applicableProducts,
      minimumPurchase: minimumPurchase,
      validityPeriod: validityPeriod,
      targetedCustomerSegment: customerSegment || "New customers",
      recommendedProducts: trendingRecommendations,
      estimatedRedemptionRate: "15-20%",
      marketInsight: relevantTrend ? `The ${relevantTrend.category} category is growing at ${relevantTrend.growthRate * 100}% with emerging trends in ${relevantTrend.emergingTrends.join(", ")}.` : "No specific market insights available for the selected category."
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
    console.log("Promotion & Marketing Optimization MCP Server started");
  }).catch(err => {
    console.error("Error connecting server to transport:", err);
  });
} catch (err) {
  console.error("Failed to start MCP server:", err);
}
