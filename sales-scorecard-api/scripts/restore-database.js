#!/usr/bin/env node

/**
 * Sales Scorecard Database Restore Script
 * 
 * This script restores the database from backup files
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  databaseUrl: process.env.DATABASE_URL,
  backupPath: process.argv[2] || process.env.BACKUP_PATH
};

async function restoreDatabase() {
  if (!config.backupPath) {
    console.error('❌ Please provide backup path as argument or BACKUP_PATH environment variable');
    console.log('Usage: node restore-database.js /path/to/backup/directory');
    process.exit(1);
  }
  
  if (!fs.existsSync(config.backupPath)) {
    console.error(`❌ Backup path does not exist: ${config.backupPath}`);
    process.exit(1);
  }
  
  console.log('🔄 Starting database restore...');
  console.log(`📁 Backup path: ${config.backupPath}`);
  console.log(`🗄️  Database: ${config.databaseUrl ? 'Configured' : 'Not configured'}`);
  console.log('');
  
  try {
    // Check if backup manifest exists
    const manifestPath = path.join(config.backupPath, 'backup-manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log(`📋 Backup info:`);
      console.log(`   • Date: ${manifest.backupDate}`);
      console.log(`   • Version: ${manifest.version}`);
      console.log(`   • Files: ${manifest.files.join(', ')}`);
      console.log('');
    }
    
    // Confirm restore
    console.log('⚠️  WARNING: This will completely replace the current database!');
    console.log('   Make sure you have a current backup before proceeding.');
    console.log('');
    
    // For safety, we'll ask for confirmation in production
    if (process.env.NODE_ENV === 'production') {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Type "RESTORE" to confirm: ', resolve);
      });
      rl.close();
      
      if (answer !== 'RESTORE') {
        console.log('❌ Restore cancelled');
        process.exit(0);
      }
    }
    
    // 1. Drop and recreate database (if full dump exists)
    const dumpFile = path.join(config.backupPath, 'full-database-dump.sql');
    if (fs.existsSync(dumpFile)) {
      console.log('📦 Restoring full database dump...');
      execSync(`psql "${config.databaseUrl}" < "${dumpFile}"`, { stdio: 'inherit' });
      console.log('✅ Full database restored');
    } else {
      console.log('⚠️  No full database dump found, restoring individual tables...');
      
      // 2. Restore individual data files
      const userDataFile = path.join(config.backupPath, 'user-data.json');
      if (fs.existsSync(userDataFile)) {
        console.log('👥 Restoring user data...');
        execSync(`psql "${config.databaseUrl}" -c "\\copy users FROM '${userDataFile}' WITH (FORMAT json)"`, { stdio: 'inherit' });
      }
      
      const evaluationsFile = path.join(config.backupPath, 'evaluations-data.json');
      if (fs.existsSync(evaluationsFile)) {
        console.log('📊 Restoring evaluations data...');
        execSync(`psql "${config.databaseUrl}" -c "\\copy evaluations FROM '${evaluationsFile}' WITH (FORMAT json)"`, { stdio: 'inherit' });
      }
      
      const orgDataFile = path.join(config.backupPath, 'organizations-data.json');
      if (fs.existsSync(orgDataFile)) {
        console.log('🏢 Restoring organizations data...');
        // Note: This would need to be split by table type in a real implementation
        console.log('⚠️  Organizations data restore needs manual handling');
      }
    }
    
    console.log('');
    console.log('🎉 Database restore completed successfully!');
    console.log('');
    console.log('🔍 Verify the restore:');
    console.log('   • Check user count: SELECT COUNT(*) FROM users;');
    console.log('   • Check evaluations: SELECT COUNT(*) FROM evaluations;');
    console.log('   • Test login functionality');
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

// Run the restore
if (require.main === module) {
  restoreDatabase();
}

module.exports = { restoreDatabase };
