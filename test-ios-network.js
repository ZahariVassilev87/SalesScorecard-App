const { exec } = require('child_process');

console.log('🧪 Testing iOS app network connectivity...');

// Test 1: Check if simulator is running
exec('xcrun simctl list devices | grep "iPhone 16 Pro" | grep "Booted"', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Simulator not running');
    return;
  }
  
  console.log('✅ Simulator is running');
  
  // Test 2: Check app logs for network errors
  console.log('📱 Checking app logs...');
  
  const logProcess = exec('xcrun simctl spawn "iPhone 16 Pro" log stream --predicate \'process == "Sales Scorecard"\' --style compact --timeout 10', (error, stdout, stderr) => {
    if (stdout) {
      console.log('📋 App logs:');
      console.log(stdout);
    }
  });
  
  // Test 3: Test API connectivity from simulator
  console.log('🌐 Testing API connectivity...');
  
  exec('curl -s http://api.instorm.io/health', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ API not reachable:', error.message);
    } else {
      console.log('✅ API is reachable');
      console.log('Response:', stdout);
    }
  });
});
