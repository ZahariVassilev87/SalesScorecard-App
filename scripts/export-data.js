#!/usr/bin/env node

/**
 * Data Export Script for Production Migration
 * Exports all data from SQLite to JSON format for PostgreSQL import
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🔄 Starting data export...');
    
    // Export all data
    const data = {
      users: await prisma.user.findMany(),
      regions: await prisma.region.findMany(),
      teams: await prisma.team.findMany(),
      salespeople: await prisma.salesperson.findMany(),
      behaviorCategories: await prisma.behaviorCategory.findMany(),
      behaviorItems: await prisma.behaviorItem.findMany(),
      evaluations: await prisma.evaluation.findMany(),
      evaluationItems: await prisma.evaluationItem.findMany(),
      userRegions: await prisma.userRegion.findMany(),
      userTeams: await prisma.userTeam.findMany(),
      auditLogs: await prisma.auditLog.findMany(),
      invites: await prisma.invite.findMany(),
    };

    // Create exports directory
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Export to JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `data-export-${timestamp}.json`;
    const filepath = path.join(exportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Data exported successfully to: ${filepath}`);
    console.log(`📊 Exported:`);
    console.log(`   - ${data.users.length} users`);
    console.log(`   - ${data.regions.length} regions`);
    console.log(`   - ${data.teams.length} teams`);
    console.log(`   - ${data.salespeople.length} salespeople`);
    console.log(`   - ${data.behaviorCategories.length} behavior categories`);
    console.log(`   - ${data.behaviorItems.length} behavior items`);
    console.log(`   - ${data.evaluations.length} evaluations`);
    console.log(`   - ${data.evaluationItems.length} evaluation items`);
    console.log(`   - ${data.userRegions.length} user-region relationships`);
    console.log(`   - ${data.userTeams.length} user-team relationships`);
    console.log(`   - ${data.auditLogs.length} audit logs`);
    console.log(`   - ${data.invites.length} invites`);
    
    return filepath;
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function importData(filepath) {
  try {
    console.log(`🔄 Starting data import from: ${filepath}`);
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    // Import in correct order (respecting foreign key constraints)
    console.log('📥 Importing users...');
    for (const user of data.users) {
      await prisma.user.create({ data: user });
    }
    
    console.log('📥 Importing regions...');
    for (const region of data.regions) {
      await prisma.region.create({ data: region });
    }
    
    console.log('📥 Importing teams...');
    for (const team of data.teams) {
      await prisma.team.create({ data: team });
    }
    
    console.log('📥 Importing salespeople...');
    for (const salesperson of data.salespeople) {
      await prisma.salesperson.create({ data: salesperson });
    }
    
    console.log('📥 Importing behavior categories...');
    for (const category of data.behaviorCategories) {
      await prisma.behaviorCategory.create({ data: category });
    }
    
    console.log('📥 Importing behavior items...');
    for (const item of data.behaviorItems) {
      await prisma.behaviorItem.create({ data: item });
    }
    
    console.log('📥 Importing evaluations...');
    for (const evaluation of data.evaluations) {
      await prisma.evaluation.create({ data: evaluation });
    }
    
    console.log('📥 Importing evaluation items...');
    for (const item of data.evaluationItems) {
      await prisma.evaluationItem.create({ data: item });
    }
    
    console.log('📥 Importing user-region relationships...');
    for (const userRegion of data.userRegions) {
      await prisma.userRegion.create({ data: userRegion });
    }
    
    console.log('📥 Importing user-team relationships...');
    for (const userTeam of data.userTeams) {
      await prisma.userTeam.create({ data: userTeam });
    }
    
    console.log('📥 Importing audit logs...');
    for (const log of data.auditLogs) {
      await prisma.auditLog.create({ data: log });
    }
    
    console.log('📥 Importing invites...');
    for (const invite of data.invites) {
      await prisma.invite.create({ data: invite });
    }
    
    console.log('✅ Data import completed successfully!');
  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  const filepath = process.argv[3];
  
  if (command === 'export') {
    exportData();
  } else if (command === 'import' && filepath) {
    importData(filepath);
  } else {
    console.log('Usage:');
    console.log('  node scripts/export-data.js export');
    console.log('  node scripts/export-data.js import <filepath>');
  }
}

module.exports = { exportData, importData };
