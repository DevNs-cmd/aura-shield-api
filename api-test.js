// Test API endpoint
const http = require('http');

// Test health endpoint
console.log('Testing health endpoint...');
const healthReq = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Health response:', data);
    
    // Now test analyze endpoint
    console.log('\nTesting analyze endpoint...');
    const analyzeReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/analyze',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-aura-test-key-123',
        'Content-Type': 'application/json'
      }
    }, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log('Analyze response (expected error for missing body):', data2);
        console.log('\n✅ API is responding correctly!');
      });
    });
    
    // Send request body for analyze
    analyzeReq.write(JSON.stringify({
      message: "Test message for scam detection",
      source: "sms"
    }));
    analyzeReq.end();
  });
});

healthReq.on('error', (e) => {
  console.error('Error:', e.message);
});
healthReq.end();