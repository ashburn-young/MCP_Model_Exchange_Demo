/**
 * This file contains mock responses for testing the application without actual Azure OpenAI API calls
 */

// Mock response for customer preferences queries
export const customerPreferencesResponse = `
Based on your customer profile and purchase history, I can see you have a strong preference for organic and sustainable skincare products. 

Your recent purchases include organic aloe vera moisturizer, vegan lip balm, and a bamboo face towel. You also bought sustainable shampoo bars and natural deodorant last month.

I would recommend:
1. Our new organic rose water toner, which complements your moisturizer
2. The sustainable bamboo makeup brush set, which aligns with your eco-friendly preferences
3. Our newly launched vegan face mask collection

Would you like more specific recommendations in any of these categories?
`;

// Mock response for inventory analytics queries
export const inventoryAnalyticsResponse = `
Here's the current inventory status for our face moisturizers:

- Organic Aloe Vera Moisturizer: 145 units (Well-stocked)
- Hydrating Rose Cream: 32 units (Low stock, reorder recommended)
- Anti-aging Collagen Cream: 78 units (Adequate)
- Sensitive Skin Formula: 15 units (Critical low, immediate reorder required)
- Overnight Repair Moisturizer: 92 units (Adequate)

Based on current sales trends, we should restock the Sensitive Skin Formula within the next 3 days, and the Hydrating Rose Cream within 7 days.

Would you like me to generate a reorder report or analyze sales trends for any specific product?
`;

// Mock response for marketing optimization queries
export const marketingOptimizationResponse = `
I've created a summer skincare promotion strategy for your consideration:

"SUMMER GLOW COLLECTION"

Key elements:
1. Bundle Offer: Sunscreen + After-sun Moisturizer + Hydrating Face Mist at 25% off regular price
2. Limited Edition: Special "Summer Essentials" travel kit
3. Loyalty Reward: 2x points on all suncare products during June-August

Recommended timeframe: Launch by June 1st to capture early summer shoppers
Target audience: Current customers with interest in skincare, especially those with previous suncare purchases

Would you like me to develop specific marketing copy for email, social media, or in-store displays?
`;

// Function to get a mock response based on query and server type
export function getMockResponse(query, serverType) {
  if (serverType === 'Customer Preferences') {
    return customerPreferencesResponse;
  } else if (serverType === 'Inventory Analytics') {
    return inventoryAnalyticsResponse;
  } else if (serverType === 'Marketing Optimization') {
    return marketingOptimizationResponse;
  }
  
  // Default response if no match
  return `I've processed your query about "${query}" using the ${serverType} system, but I'll need to connect to the actual AI models for a detailed response. This is just a simulated demo.`;
}
