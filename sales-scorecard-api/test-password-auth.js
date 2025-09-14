#!/usr/bin/env node

/**
 * Test script for password authentication system
 * Run this after Railway deployment to verify password functionality
 */

const https = require('https');
const http = require('http');

// Get Railway URL from environment or use localhost
const BASE_URL = process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : 'http://localhost:3000';

console.log('🔐 Testing Password Authentication System');
console.log('==========================================');
console.log(`Testing against: ${BASE_URL}`);

async function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = client.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testPasswordAuth() {
  const testEmail = 'zahari.vasilev@instorm.bg';
  const testPassword = 'TestPassword123!';

  try {
    console.log('\n1. Testing email eligibility check...');
    const eligibilityResponse = await makeRequest('/auth/check-eligibility', 'POST', {
      email: testEmail
    });
    
    console.log('Eligibility Response:', eligibilityResponse);
    
    if (eligibilityResponse.status === 200) {
      const { eligible, isRegistered, message } = eligibilityResponse.data;
      console.log(`✅ Email eligibility: ${message}`);
      console.log(`📧 Is registered: ${isRegistered}`);
      
      if (eligible && !isRegistered) {
        console.log('\n2. Testing user registration...');
        const registerResponse = await makeRequest('/auth/register', 'POST', {
          email: testEmail,
          password: testPassword,
          displayName: 'Zahari Vasilev'
        });
        
        console.log('Registration Response:', registerResponse);
        
        if (registerResponse.status === 201) {
          console.log('✅ Registration successful!');
          const { access_token, user } = registerResponse.data;
          console.log(`🔑 Token received: ${access_token ? 'Yes' : 'No'}`);
          console.log(`👤 User: ${user.displayName} (${user.role})`);
          
          console.log('\n3. Testing user login...');
          const loginResponse = await makeRequest('/auth/login', 'POST', {
            email: testEmail,
            password: testPassword
          });
          
          console.log('Login Response:', loginResponse);
          
          if (loginResponse.status === 200) {
            console.log('✅ Login successful!');
            console.log('🔐 Password authentication is working correctly!');
          } else {
            console.log('❌ Login failed:', loginResponse.data);
          }
        } else {
          console.log('❌ Registration failed:', registerResponse.data);
        }
      } else if (eligible && isRegistered) {
        console.log('\n2. Testing user login (already registered)...');
        const loginResponse = await makeRequest('/auth/login', 'POST', {
          email: testEmail,
          password: testPassword
        });
        
        console.log('Login Response:', loginResponse);
        
        if (loginResponse.status === 200) {
          console.log('✅ Login successful!');
          console.log('🔐 Password authentication is working correctly!');
        } else {
          console.log('❌ Login failed:', loginResponse.data);
        }
      }
    } else {
      console.log('❌ Eligibility check failed:', eligibilityResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPasswordAuth().then(() => {
  console.log('\n🏁 Password authentication test completed!');
}).catch(console.error);
