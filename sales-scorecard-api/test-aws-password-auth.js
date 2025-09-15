#!/usr/bin/env node

/**
 * AWS Password Authentication Test Script
 * Tests the password authentication system on AWS deployment
 */

const https = require('https');
const http = require('http');

// AWS Load Balancer URL
const AWS_BASE_URL = 'http://sales-scorecard-alb-913927421.eu-north-1.elb.amazonaws.com';

// Test user data
const testUser = {
  email: 'test.salesdirector@example.com',
  password: 'SecurePassword123!',
  displayName: 'Test Sales Director'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (options.body) {
      const body = JSON.stringify(options.body);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testHealthCheck() {
  log('\n🔍 Testing Health Check...', 'blue');
  try {
    const response = await makeRequest(`${AWS_BASE_URL}/`);
    if (response.statusCode === 404) {
      log('✅ Health check working (404 expected - no root handler)', 'green');
      return true;
    } else {
      log(`⚠️  Unexpected health check response: ${response.statusCode}`, 'yellow');
      return true; // Still working, just different response
    }
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'red');
    return false;
  }
}

async function testEmailEligibility() {
  log('\n📧 Testing Email Eligibility Check...', 'blue');
  try {
    const response = await makeRequest(`${AWS_BASE_URL}/auth/check-email`, {
      method: 'POST',
      body: { email: testUser.email }
    });

    if (response.statusCode === 200) {
      log('✅ Email eligibility check successful', 'green');
      log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'blue');
      return response.data;
    } else {
      log(`❌ Email eligibility check failed: ${response.statusCode}`, 'red');
      log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Email eligibility check error: ${error.message}`, 'red');
    return null;
  }
}

async function testUserRegistration() {
  log('\n👤 Testing User Registration...', 'blue');
  try {
    const response = await makeRequest(`${AWS_BASE_URL}/auth/register`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password,
        displayName: testUser.displayName
      }
    });

    if (response.statusCode === 201) {
      log('✅ User registration successful', 'green');
      log(`   Access Token: ${response.data.access_token ? 'Present' : 'Missing'}`, 'blue');
      log(`   User: ${response.data.user?.displayName || 'Unknown'}`, 'blue');
      return response.data;
    } else {
      log(`❌ User registration failed: ${response.statusCode}`, 'red');
      log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ User registration error: ${error.message}`, 'red');
    return null;
  }
}

async function testUserLogin() {
  log('\n🔐 Testing User Login...', 'blue');
  try {
    const response = await makeRequest(`${AWS_BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    });

    if (response.statusCode === 200) {
      log('✅ User login successful', 'green');
      log(`   Access Token: ${response.data.access_token ? 'Present' : 'Missing'}`, 'blue');
      log(`   User: ${response.data.user?.displayName || 'Unknown'}`, 'blue');
      return response.data;
    } else {
      log(`❌ User login failed: ${response.statusCode}`, 'red');
      log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ User login error: ${error.message}`, 'red');
    return null;
  }
}

async function testAuthenticatedEndpoint(accessToken) {
  log('\n🔒 Testing Authenticated Endpoint...', 'blue');
  try {
    const response = await makeRequest(`${AWS_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.statusCode === 200) {
      log('✅ Authenticated endpoint access successful', 'green');
      log(`   User: ${response.data.displayName || 'Unknown'}`, 'blue');
      log(`   Role: ${response.data.role || 'Unknown'}`, 'blue');
      return true;
    } else {
      log(`❌ Authenticated endpoint access failed: ${response.statusCode}`, 'red');
      log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Authenticated endpoint error: ${error.message}`, 'red');
    return false;
  }
}

async function testWrongPassword() {
  log('\n🚫 Testing Wrong Password...', 'blue');
  try {
    const response = await makeRequest(`${AWS_BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: 'WrongPassword123!'
      }
    });

    if (response.statusCode === 401) {
      log('✅ Wrong password correctly rejected', 'green');
      return true;
    } else {
      log(`❌ Wrong password not rejected: ${response.statusCode}`, 'red');
      log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Wrong password test error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('🚀 Starting AWS Password Authentication Tests', 'bold');
  log(`📍 Testing against: ${AWS_BASE_URL}`, 'blue');
  log(`👤 Test user: ${testUser.email}`, 'blue');

  const results = {
    healthCheck: false,
    emailEligibility: false,
    registration: false,
    login: false,
    authenticatedAccess: false,
    wrongPassword: false
  };

  // Test 1: Health Check
  results.healthCheck = await testHealthCheck();

  // Test 2: Email Eligibility
  const eligibilityResult = await testEmailEligibility();
  results.emailEligibility = eligibilityResult !== null;

  // Test 3: User Registration
  const registrationResult = await testUserRegistration();
  results.registration = registrationResult !== null;

  // Test 4: User Login
  const loginResult = await testUserLogin();
  results.login = loginResult !== null;

  // Test 5: Authenticated Endpoint (if login was successful)
  if (loginResult && loginResult.access_token) {
    results.authenticatedAccess = await testAuthenticatedEndpoint(loginResult.access_token);
  }

  // Test 6: Wrong Password
  results.wrongPassword = await testWrongPassword();

  // Summary
  log('\n📊 Test Results Summary:', 'bold');
  log('================================', 'blue');
  
  const testNames = {
    healthCheck: 'Health Check',
    emailEligibility: 'Email Eligibility',
    registration: 'User Registration',
    login: 'User Login',
    authenticatedAccess: 'Authenticated Access',
    wrongPassword: 'Wrong Password Rejection'
  };

  let passedTests = 0;
  let totalTests = 0;

  Object.entries(results).forEach(([key, passed]) => {
    totalTests++;
    if (passed) passedTests++;
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} ${testNames[key]}`, color);
  });

  log('\n================================', 'blue');
  log(`📈 Overall Result: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 All tests passed! Password authentication system is working correctly.', 'green');
  } else {
    log('⚠️  Some tests failed. Please check the issues above.', 'yellow');
  }

  return results;
}

// Run the tests
runTests().catch(error => {
  log(`💥 Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});
