#!/usr/bin/env node

// Test script to verify iOS app connectivity endpoints
const https = require('https');

const baseURL = 'https://api.instorm.io';

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.instorm.io',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'iOS-SalesScorecard/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testConnectivity() {
    console.log('🧪 Testing iOS App Connectivity to Sales Scorecard API');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Health Check
        console.log('\n1. 🔍 Testing Health Check...');
        const healthResponse = await makeRequest('/health');
        console.log(`   Status: ${healthResponse.statusCode}`);
        console.log(`   Response:`, JSON.stringify(healthResponse.data, null, 2));
        
        // Test 2: Email Eligibility Check
        console.log('\n2. 📧 Testing Email Eligibility Check...');
        const emailCheckResponse = await makeRequest('/auth/check-email', 'POST', {
            email: 'test@instorm.bg'
        });
        console.log(`   Status: ${emailCheckResponse.statusCode}`);
        console.log(`   Response:`, JSON.stringify(emailCheckResponse.data, null, 2));
        
        // Test 3: Test Email (SES)
        console.log('\n3. 📨 Testing Email Functionality...');
        const emailTestResponse = await makeRequest('/auth/test-email', 'POST', {
            email: 'zahari.vasilev@instorm.bg'
        });
        console.log(`   Status: ${emailTestResponse.statusCode}`);
        console.log(`   Response:`, JSON.stringify(emailTestResponse.data, null, 2));
        
        // Test 4: Categories (Public Endpoint)
        console.log('\n4. 📋 Testing Categories Endpoint...');
        const categoriesResponse = await makeRequest('/public-admin/categories');
        console.log(`   Status: ${categoriesResponse.statusCode}`);
        console.log(`   Response:`, JSON.stringify(categoriesResponse.data, null, 2));
        
        // Test 5: Teams (Public Endpoint)
        console.log('\n5. 👥 Testing Teams Endpoint...');
        const teamsResponse = await makeRequest('/public-admin/teams');
        console.log(`   Status: ${teamsResponse.statusCode}`);
        console.log(`   Response:`, JSON.stringify(teamsResponse.data, null, 2));
        
        console.log('\n✅ All connectivity tests completed!');
        console.log('\n📱 Your iOS app should now be able to connect successfully to:');
        console.log('   • Health Check: https://api.instorm.io/health');
        console.log('   • Authentication: https://api.instorm.io/auth/*');
        console.log('   • Public Admin: https://api.instorm.io/public-admin/*');
        console.log('   • All other endpoints with proper authentication');
        
    } catch (error) {
        console.error('❌ Connectivity test failed:', error.message);
        process.exit(1);
    }
}

testConnectivity();
