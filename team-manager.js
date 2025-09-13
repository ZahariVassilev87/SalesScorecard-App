#!/usr/bin/env node

/**
 * Simple Team Management Script for Sales Scorecard
 * Usage: node team-manager.js
 */

const API_BASE = 'http://localhost:3000';

// Sample team data
const sampleTeams = [
  {
    region: 'North America',
    teams: [
      { name: 'Enterprise Sales', salespeople: ['John Smith', 'Sarah Johnson', 'Mike Davis'] },
      { name: 'SMB Sales', salespeople: ['Alice Brown', 'Bob Wilson'] },
      { name: 'Inside Sales', salespeople: ['Carol Green', 'David Lee'] }
    ]
  },
  {
    region: 'Europe',
    teams: [
      { name: 'European Sales', salespeople: ['Emma Thompson', 'James Miller'] },
      { name: 'UK Sales', salespeople: ['Sophie Taylor', 'Oliver Jones'] }
    ]
  }
];

console.log('🎯 Sales Scorecard Team Manager');
console.log('================================');
console.log('');
console.log('Sample Team Structure:');
console.log('');

sampleTeams.forEach(region => {
  console.log(`📍 ${region.region}`);
  region.teams.forEach(team => {
    console.log(`  └── ${team.name} (${team.salespeople.length} people)`);
    team.salespeople.forEach(person => {
      console.log(`      • ${person}`);
    });
  });
  console.log('');
});

console.log('📋 To add these teams in production:');
console.log('1. Use your iOS app (Test Mode)');
console.log('2. Use API endpoints with authentication');
console.log('3. Use database management tools');
console.log('4. Create a proper admin interface');
console.log('');
console.log('🔗 API Documentation: http://localhost:3000/api/docs');
console.log('🎯 Admin Panel: http://localhost:3000/public-admin/panel');
