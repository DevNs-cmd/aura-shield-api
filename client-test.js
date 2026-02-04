// Simple client to test AURA-SHIELD API
const axios = require('axios');

async function testApi() {
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('Health response:', healthResponse.data);
    
    // Test analyze endpoint
    console.log('\nTesting analyze endpoint...');
    const analyzeResponse = await axios.post('http://localhost:3000/analyze', {
      message: "URGENT: Your bank account will be suspended! Click here to verify your credentials immediately: fake-bank-login.com",
      source: "sms"
    }, {
      headers: {
        'Authorization': 'Bearer sk-aura-test-key-123',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Analyze response:', analyzeResponse.data);
    console.log('\n✅ API is working correctly!');
  } catch (error) {
    if (error.response) {
      console.log('API response error:', error.response.data);
      console.log('Status:', error.response.status);
    } else {
      console.log('Network error:', error.message);
    }
  }
}

testApi();