// Test script for AURA-SHIELD API
// This demonstrates the functionality of the scam detection system

const { analyzeScamMessage } = require('./scamAnalyzer');

async function runTests() {
  console.log('🧪 Running AURA-SHIELD Tests...\n');
  
  // Test 1: Bank Impersonation Scam
  console.log('Test 1: Bank Impersonation Scam');
  let result = await analyzeScamMessage(
    "URGENT: Your bank account will be suspended! Click here to verify your credentials immediately: fake-bank-login.com", 
    "sms"
  );
  console.log(JSON.stringify(result, null, 2));
  console.log('\n---\n');
  
  // Test 2: Lottery Scam
  console.log('Test 2: Lottery Scam');
  result = await analyzeScamMessage(
    "Congratulations! You have won Rs. 10,00,000 in the lottery. Claim your prize now by depositing Rs. 10,000 processing fees.", 
    "email"
  );
  console.log(JSON.stringify(result, null, 2));
  console.log('\n---\n');
  
  // Test 3: OTP Scam
  console.log('Test 3: OTP Scam');
  result = await analyzeScamMessage(
    "Your Amazon order needs verification. Send your OTP to confirm: 123456", 
    "sms"
  );
  console.log(JSON.stringify(result, null, 2));
  console.log('\n---\n');
  
  // Test 4: Job Scam
  console.log('Test 4: Job Scam');
  result = await analyzeScamMessage(
    "Congratulations! You're hired for a work-from-home position. Send Rs. 5000 as security deposit to secure your job.", 
    "email"
  );
  console.log(JSON.stringify(result, null, 2));
  console.log('\n---\n');
  
  // Test 5: Legitimate Message
  console.log('Test 5: Legitimate Message');
  result = await analyzeScamMessage(
    "Hi, are you free for a meeting tomorrow at 10 AM?", 
    "chat"
  );
  console.log(JSON.stringify(result, null, 2));
  console.log('\n---\n');
  
  console.log('✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };