// test-model-switching-local.js - Direct API test for model switching functionality with local server
import axios from 'axios';

// Configuration for local server
const API_URL = 'http://localhost:3005/api';
const DEFAULT_TIMEOUT = 15000; // 15 seconds

// Test cases
const testCases = [
  {
    name: "Simple Query",
    query: "What are our bestselling products this week?",
    expectedModel: "gpt-35-turbo",
    rationale: "Short query with no special keywords"
  },
  {
    name: "Complex Analysis",
    query: "I need a complex, detailed breakdown of our inventory to understand supply chain bottlenecks and optimize our ordering process.",
    expectedModel: "gpt-4o",
    rationale: "Contains complexity keywords"
  },
  {
    name: "Analytics and Forecasting",
    query: "Analyze the sales trends for skincare products over the last 6 months and predict the next quarter's performance.",
    expectedModel: "gpt-4.1",
    rationale: "Contains analytics and forecasting keywords"
  },
  {
    name: "Creative Content",
    query: "Create an innovative summer marketing campaign with compelling slogans for our new organic skincare line.",
    expectedModel: "gpt-4.5-preview",
    rationale: "Contains creative and marketing keywords"
  }
];

// Function to run a test
async function runTest(testCase) {
  console.log(`\n======== TESTING: ${testCase.name} ========`);
  console.log(`Query: "${testCase.query}"`);
  console.log(`Expected Model: ${testCase.expectedModel}`);
  
  try {
    const response = await axios.post(`${API_URL}/inquiry`, {
      query: testCase.query
    }, {
      timeout: DEFAULT_TIMEOUT
    });
    
    const selectedModel = response.data.model || 'Unknown';
    const reason = response.data.modelSelectionReason || 'No reason provided';
    const serverType = response.data.serverType || 'Unknown';
    
    console.log(`Selected Model: ${selectedModel}`);
    console.log(`Selection Reason: ${reason}`);
    console.log(`Server Type: ${serverType}`);
    
    if (selectedModel === testCase.expectedModel) {
      console.log('✅ TEST PASSED: Model selection matched expectation');
    } else {
      console.log('❌ TEST FAILED: Model selection did not match expectation');
    }
    
    return {
      success: true,
      result: {
        selectedModel,
        reason,
        serverType,
        matched: selectedModel === testCase.expectedModel
      }
    };
  } catch (error) {
    console.log('❌ TEST ERROR');
    if (error.response) {
      console.log(`Error Status: ${error.response.status}`);
      console.log(`Error Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.log('No response received from server');
      console.log(`Request: ${JSON.stringify(error.request._currentUrl || error.request, null, 2)}`);
    } else {
      console.log(`Error Message: ${error.message}`);
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to run all tests
async function runAllTests() {
  console.log('=========================================');
  console.log('SMART RETAIL ASSISTANT - MODEL SWITCHING TEST (LOCAL)');
  console.log('=========================================');
  console.log(`API URL: ${API_URL}`);
  
  // First check if the API is accessible
  console.log('\nChecking API connectivity...');
  try {
    const modelResponse = await axios.get(`${API_URL}/models`, { timeout: DEFAULT_TIMEOUT });
    console.log('✅ API is accessible');
    console.log(`Available Models: ${modelResponse.data.models.map(m => m.id).join(', ')}`);
  } catch (error) {
    console.log('❌ API is not accessible');
    console.log(`Error: ${error.message}`);
    console.log('\nPlease make sure the local server is running at http://localhost:3005');
    console.log('Start the server using: cd scripts && ./run-local.sh');
    return;
  }
  
  // Run all test cases
  const results = [];
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push({
      testCase,
      result
    });
    
    // Add a small delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Print summary
  console.log('\n=========================================');
  console.log('TEST RESULTS SUMMARY');
  console.log('=========================================');
  
  let passed = 0;
  let failed = 0;
  let errors = 0;
  
  results.forEach((result, index) => {
    const { testCase } = result;
    
    if (!result.result.success) {
      console.log(`${index + 1}. ${testCase.name}: ❌ ERROR - ${result.result.error}`);
      errors++;
    } else if (result.result.result.matched) {
      console.log(`${index + 1}. ${testCase.name}: ✅ PASSED`);
      passed++;
    } else {
      console.log(`${index + 1}. ${testCase.name}: ❌ FAILED - Expected ${testCase.expectedModel}, got ${result.result.result.selectedModel}`);
      failed++;
    }
  });
  
  console.log('\n=========================================');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed, ${errors} errors`);
  console.log('=========================================');
}

// Run the tests
runAllTests().catch(error => {
  console.error('Unhandled error in test runner:', error);
});
