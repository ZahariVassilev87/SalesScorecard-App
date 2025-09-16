#!/usr/bin/env node

/**
 * Sales Scorecard Database Backup Script
 * 
 * This script creates comprehensive backups of the database including:
 * - Full database dump
 * - User data export
 * - Configuration backup
 * - Upload to S3 for long-term storage
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
// Configuration
const config = {
  databaseUrl: process.env.DATABASE_URL,
  s3Bucket: process.env.BACKUP_S3_BUCKET || 'sales-scorecard-backups',
  backupRetentionDays: 30,
  timestamp: new Date().toISOString().replace(/[:.]/g, '-')
};

// Initialize AWS S3 (optional)
let s3 = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  try {
    const AWS = require('aws-sdk');
    s3 = new AWS.S3({
      region: 'eu-north-1'
    });
  } catch (error) {
    console.log('⚠️  AWS SDK not available, S3 backup will be skipped');
  }
}

async function createDatabaseBackup() {
  console.log('🔄 Starting database backup...');
  
  const backupDir = path.join(__dirname, '..', 'backups', config.timestamp);
  fs.mkdirSync(backupDir, { recursive: true });
  
  try {
    // 1. Full PostgreSQL dump
    console.log('📦 Creating full database dump...');
    const dumpFile = path.join(backupDir, 'full-database-dump.sql');
    execSync(`pg_dump "${config.databaseUrl}" > "${dumpFile}"`, { stdio: 'inherit' });
    
    // 2. Export user data as JSON
    console.log('👥 Exporting user data...');
    const userDataFile = path.join(backupDir, 'user-data.json');
    execSync(`psql "${config.databaseUrl}" -c "\\copy (SELECT * FROM users) TO '${userDataFile}' WITH (FORMAT json)"`, { stdio: 'inherit' });
    
    // 3. Export evaluations data
    console.log('📊 Exporting evaluations data...');
    const evaluationsFile = path.join(backupDir, 'evaluations-data.json');
    execSync(`psql "${config.databaseUrl}" -c "\\copy (SELECT * FROM evaluations) TO '${evaluationsFile}' WITH (FORMAT json)"`, { stdio: 'inherit' });
    
    // 4. Export organizations data
    console.log('🏢 Exporting organizations data...');
    const orgDataFile = path.join(backupDir, 'organizations-data.json');
    execSync(`psql "${config.databaseUrl}" -c "\\copy (SELECT * FROM regions UNION ALL SELECT * FROM teams UNION ALL SELECT * FROM salespeople) TO '${orgDataFile}' WITH (FORMAT json)"`, { stdio: 'inherit' });
    
    // 5. Create backup manifest
    const manifest = {
      timestamp: config.timestamp,
      backupDate: new Date().toISOString(),
      files: [
        'full-database-dump.sql',
        'user-data.json',
        'evaluations-data.json',
        'organizations-data.json'
      ],
      databaseUrl: config.databaseUrl.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
      version: '1.0.0'
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'backup-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log('✅ Local backup created successfully');
    return backupDir;
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

async function uploadToS3(backupDir) {
  if (!s3 || !process.env.BACKUP_S3_BUCKET) {
    console.log('⚠️  S3 backup skipped (no bucket configured or AWS SDK not available)');
    return;
  }
  
  console.log('☁️  Uploading backup to S3...');
  
  try {
    const files = fs.readdirSync(backupDir);
    
    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const key = `database-backups/${config.timestamp}/${file}`;
      
      const uploadParams = {
        Bucket: config.s3Bucket,
        Key: key,
        Body: fs.createReadStream(filePath),
        ServerSideEncryption: 'AES256',
        StorageClass: 'STANDARD_IA' // Cost-effective storage
      };
      
      await s3.upload(uploadParams).promise();
      console.log(`📤 Uploaded: ${file}`);
    }
    
    console.log('✅ S3 upload completed');
    
  } catch (error) {
    console.error('❌ S3 upload failed:', error.message);
    throw error;
  }
}

async function cleanupOldBackups() {
  console.log('🧹 Cleaning up old backups...');
  
  try {
    // Clean up local backups older than retention period
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (fs.existsSync(backupsDir)) {
      const dirs = fs.readdirSync(backupsDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.backupRetentionDays);
      
      for (const dir of dirs) {
        const dirPath = path.join(backupsDir, dir);
        const stats = fs.statSync(dirPath);
        
        if (stats.isDirectory() && stats.mtime < cutoffDate) {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(`🗑️  Removed old backup: ${dir}`);
        }
      }
    }
    
    // Clean up S3 backups
    if (s3 && process.env.BACKUP_S3_BUCKET) {
      const listParams = {
        Bucket: config.s3Bucket,
        Prefix: 'database-backups/'
      };
      
      const objects = await s3.listObjectsV2(listParams).promise();
      const cutoffTime = new Date();
      cutoffTime.setDate(cutoffTime.getDate() - config.backupRetentionDays);
      
      for (const obj of objects.Contents || []) {
        if (obj.LastModified < cutoffTime) {
          await s3.deleteObject({
            Bucket: config.s3Bucket,
            Key: obj.Key
          }).promise();
          console.log(`🗑️  Removed old S3 backup: ${obj.Key}`);
        }
      }
    }
    
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    // Don't throw - cleanup failure shouldn't fail the backup
  }
}

async function main() {
  console.log('🚀 Sales Scorecard Database Backup');
  console.log('=====================================');
  console.log(`📅 Timestamp: ${config.timestamp}`);
  console.log(`🗄️  Database: ${config.databaseUrl ? 'Configured' : 'Not configured'}`);
  console.log(`☁️  S3 Bucket: ${config.s3Bucket}`);
  console.log('');
  
  try {
    // Create local backup
    const backupDir = await createDatabaseBackup();
    
    // Upload to S3
    await uploadToS3(backupDir);
    
    // Cleanup old backups
    await cleanupOldBackups();
    
    console.log('');
    console.log('🎉 Backup completed successfully!');
    console.log(`📁 Local backup: ${backupDir}`);
    console.log(`☁️  S3 location: s3://${config.s3Bucket}/database-backups/${config.timestamp}/`);
    
  } catch (error) {
    console.error('');
    console.error('💥 Backup failed:', error.message);
    process.exit(1);
  }
}

// Run the backup
if (require.main === module) {
  main();
}

module.exports = { createDatabaseBackup, uploadToS3, cleanupOldBackups };
