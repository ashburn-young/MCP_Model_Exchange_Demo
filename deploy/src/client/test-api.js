import axios from 'axios';

// Test function to check if the API is accessible
async function testApi() {
  try {
    // Try the ping endpoint first
    console.log('Testing ping endpoint...');
    const pingResponse = await axios.get('http://localhost:3002/api/ping');
    console.log('Ping response:', pingResponse.data);
    
    // Then test the inquiry endpoint
    console.log('\nTesting inquiry endpoint...');
    const inquiryResponse = await axios.post('http://localhost:3002/api/inquiry', {
      query: 'Test message for sustainable products',
      customerName: 'Test User'
    });
    console.log('Inquiry response status:', inquiryResponse.status);
    console.log('Inquiry model:', inquiryResponse.data.model);
    console.log('Inquiry model version:', inquiryResponse.data.modelVersion);
    console.log('Using mock:', inquiryResponse.data.usingMock);
    console.log('First 100 chars of response:', inquiryResponse.data.response.substring(0, 100) + '...');
    
    console.log('\nAPI connection is working correctly!');
  } catch (error) {
    console.error('Error testing API:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Server might be down or CORS issues.');
      console.error('Request details:', error.request._currentUrl);
    } else {
      console.error('Error details:', error.config);
    }
  }
}

// Run the test
testApi();
