#!/bin/bash

# Sales Scorecard Backup Setup Script
# This script sets up automated daily backups

echo "🚀 Setting up Sales Scorecard automated backups..."

# Create backup directory
mkdir -p /opt/sales-scorecard/backups
mkdir -p /opt/sales-scorecard/scripts

# Copy backup script
cp backup-database.js /opt/sales-scorecard/scripts/
chmod +x /opt/sales-scorecard/scripts/backup-database.js

# Create environment file for backup
cat > /opt/sales-scorecard/backup.env << EOF
# Database configuration
DATABASE_URL="${DATABASE_URL}"

# S3 backup configuration (optional)
BACKUP_S3_BUCKET="sales-scorecard-backups"

# AWS credentials (if using S3)
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
AWS_DEFAULT_REGION="eu-north-1"
EOF

# Create cron job for daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * cd /opt/sales-scorecard && source backup.env && node scripts/backup-database.js >> /var/log/sales-scorecard-backup.log 2>&1") | crontab -

# Create log rotation for backup logs
cat > /etc/logrotate.d/sales-scorecard-backup << EOF
/var/log/sales-scorecard-backup.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

echo "✅ Backup system configured successfully!"
echo ""
echo "📋 Backup Configuration:"
echo "   • Daily backups at 2:00 AM"
echo "   • Local storage: /opt/sales-scorecard/backups"
echo "   • S3 storage: s3://sales-scorecard-backups (if configured)"
echo "   • Logs: /var/log/sales-scorecard-backup.log"
echo "   • Retention: 30 days"
echo ""
echo "🔧 Manual backup command:"
echo "   cd /opt/sales-scorecard && source backup.env && node scripts/backup-database.js"
echo ""
echo "📊 Check backup status:"
echo "   tail -f /var/log/sales-scorecard-backup.log"
