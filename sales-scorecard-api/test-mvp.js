#!/usr/bin/env node

/**
 * Sales Scorecard MVP Test Script
 * Tests the complete MVP functionality including:
 * - Admin panel access
 * - User creation
 * - Authentication flow
 * - Role-based access
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = 'https://sales-scorecard-api-production.up.railway.app';

// Test data
const testUsers = {
  admin: {
    email: 'admin@instorm.bg',
    displayName: 'System Administrator',
    password: 'AdminPass123!',
    role: 'ADMIN'
  },
  manager: {
    email: 'manager@instorm.bg',
    displayName: 'Regional Manager',
    password: 'ManagerPass123!',
    role: 'REGIONAL_MANAGER'
  },
  salesperson: {
    email: 'salesperson@instorm.bg',
    displayName: 'Sales Person',
    password: 'SalesPass123!',
    role: 'SALESPERSON'
  }
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testAdminPanel() {
  console.log('\n🔍 Testing Admin Panel...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/simple-admin`);
    if (response.status === 200) {
      console.log('✅ Admin panel accessible');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Version: ${response.data.version}`);
      console.log(`   Total Users: ${response.data.stats?.totalUsers || 0}`);
      return true;
    } else {
      console.log(`❌ Admin panel failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Admin panel error: ${error.message}`);
    return false;
  }
}

async function testCreateAdmin() {
  console.log('\n👤 Testing Admin User Creation...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/simple-admin/create-admin`, {
      method: 'POST',
      body: testUsers.admin
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Admin user created successfully');
      console.log(`   Email: ${response.data.user?.email}`);
      console.log(`   Role: ${response.data.user?.role}`);
      return true;
    } else {
      console.log(`❌ Admin creation failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Admin creation error: ${error.message}`);
    return false;
  }
}

async function testCreateUser(userData) {
  console.log(`\n👥 Testing User Creation (${userData.role})...`);
  try {
    const response = await makeRequest(`${API_BASE_URL}/simple-admin/users`, {
      method: 'POST',
      body: {
        ...userData,
        sendEmail: false // Don't send email during testing
      }
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ ${userData.role} user created successfully`);
      console.log(`   Email: ${response.data.user?.email}`);
      console.log(`   Role: ${response.data.user?.role}`);
      return true;
    } else {
      console.log(`❌ User creation failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ User creation error: ${error.message}`);
    return false;
  }
}

async function testUserLogin(email, password) {
  console.log(`\n🔐 Testing Login (${email})...`);
  try {
    const response = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: { email, password }
    });
    
    if (response.status === 200) {
      console.log(`✅ Login successful for ${email}`);
      console.log(`   Token: ${response.data.access_token ? 'Generated' : 'Missing'}`);
      console.log(`   User: ${response.data.user?.displayName}`);
      console.log(`   Role: ${response.data.user?.role}`);
      return response.data.access_token;
    } else {
      console.log(`❌ Login failed: ${response.status}`);
      console.log(`   Error: ${response.data?.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login error: ${error.message}`);
    return null;
  }
}

async function testProtectedEndpoint(token, endpoint, description) {
  console.log(`\n🛡️ Testing Protected Endpoint: ${description}...`);
  try {
    const response = await makeRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200) {
      console.log(`✅ ${description} accessible`);
      return true;
    } else {
      console.log(`❌ ${description} failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} error: ${error.message}`);
    return false;
  }
}

async function testUserList() {
  console.log('\n📋 Testing User List...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/simple-admin/users`);
    
    if (response.status === 200) {
      console.log(`✅ User list accessible`);
      console.log(`   Total users: ${response.data.length}`);
      response.data.forEach(user => {
        console.log(`   - ${user.displayName} (${user.email}) - ${user.role}`);
      });
      return true;
    } else {
      console.log(`❌ User list failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ User list error: ${error.message}`);
    return false;
  }
}

// Main test function
async function runMVPTests() {
  console.log('🚀 Sales Scorecard MVP Test Suite');
  console.log('=====================================');
  console.log(`Testing API: ${API_BASE_URL}`);
  
  const results = {
    adminPanel: false,
    createAdmin: false,
    createUsers: false,
    login: false,
    protectedEndpoints: false,
    userList: false
  };

  // Test 1: Admin Panel
  results.adminPanel = await testAdminPanel();

  // Test 2: Create Admin User
  results.createAdmin = await testCreateAdmin();

  // Test 3: Create Other Users
  const managerCreated = await testCreateUser(testUsers.manager);
  const salespersonCreated = await testCreateUser(testUsers.salesperson);
  results.createUsers = managerCreated && salespersonCreated;

  // Test 4: User Login
  const adminToken = await testUserLogin(testUsers.admin.email, testUsers.admin.password);
  const managerToken = await testUserLogin(testUsers.manager.email, testUsers.manager.password);
  results.login = adminToken && managerToken;

  // Test 5: Protected Endpoints
  if (adminToken) {
    const adminDashboard = await testProtectedEndpoint(adminToken, '/admin/dashboard', 'Admin Dashboard');
    const adminUsers = await testProtectedEndpoint(adminToken, '/admin/users', 'Admin Users');
    results.protectedEndpoints = adminDashboard && adminUsers;
  }

  // Test 6: User List
  results.userList = await testUserList();

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Admin Panel: ${results.adminPanel ? '✅' : '❌'}`);
  console.log(`Create Admin: ${results.createAdmin ? '✅' : '❌'}`);
  console.log(`Create Users: ${results.createUsers ? '✅' : '❌'}`);
  console.log(`User Login: ${results.login ? '✅' : '❌'}`);
  console.log(`Protected Endpoints: ${results.protectedEndpoints ? '✅' : '❌'}`);
  console.log(`User List: ${results.userList ? '✅' : '❌'}`);

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 MVP is fully functional and ready for client demo!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }

  return results;
}

// Run the tests
if (require.main === module) {
  runMVPTests().catch(console.error);
}

module.exports = { runMVPTests, testUsers };
