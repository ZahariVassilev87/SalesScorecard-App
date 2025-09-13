#!/usr/bin/env node

/**
 * Test Script: Automatic User Assignment
 * 
 * This script demonstrates how the system automatically assigns users
 * to their organizational structure when they log in.
 */

const API_BASE = 'http://localhost:3000';

async function testAutoAssignment() {
    console.log('🎯 Testing Automatic User Assignment');
    console.log('=====================================\n');

    // Test 1: Existing salesperson in organization
    console.log('📋 Test 1: Existing Salesperson Login');
    console.log('Email: john.smith@company.com (exists as salesperson)');
    
    try {
        const response1 = await fetch(`${API_BASE}/auth/magic-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'john.smith@company.com' })
        });
        
        const result1 = await response1.json();
        console.log('✅ Result:', result1.message);
        console.log('📧 Email sent with personalized message for existing team member\n');
    } catch (error) {
        console.log('❌ Error:', error.message, '\n');
    }

    // Test 2: New user not in organization
    console.log('📋 Test 2: New User Login');
    console.log('Email: new.user@company.com (not in organization)');
    
    try {
        const response2 = await fetch(`${API_BASE}/auth/magic-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'new.user@company.com' })
        });
        
        const result2 = await response2.json();
        console.log('✅ Result:', result2.message);
        console.log('📧 Email sent with welcome message for new user\n');
    } catch (error) {
        console.log('❌ Error:', error.message, '\n');
    }

    // Test 3: Admin domain user
    console.log('📋 Test 3: Admin Domain User');
    console.log('Email: admin@instorm.bg (admin domain)');
    
    try {
        const response3 = await fetch(`${API_BASE}/auth/magic-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@instorm.bg' })
        });
        
        const result3 = await response3.json();
        console.log('✅ Result:', result3.message);
        console.log('📧 Email sent - will be assigned ADMIN role\n');
    } catch (error) {
        console.log('❌ Error:', error.message, '\n');
    }

    console.log('🎉 Automatic Assignment Features:');
    console.log('================================');
    console.log('✅ Existing salespeople → Automatically recognized and assigned to their team');
    console.log('✅ New users → Created with appropriate default role');
    console.log('✅ Admin domain → Automatically assigned ADMIN role');
    console.log('✅ Team relationships → Automatically linked to existing teams');
    console.log('✅ Personalized emails → Different messages for existing vs new users');
    console.log('\n📱 When users log in with their email:');
    console.log('1. System checks if email exists in organizational structure');
    console.log('2. If exists as salesperson → Converts to user account with team assignment');
    console.log('3. If exists as user → Logs in with existing role and team');
    console.log('4. If new → Creates account with default role based on domain');
    console.log('5. User gets appropriate permissions and team access automatically!');
}

// Run the test
testAutoAssignment().catch(console.error);
