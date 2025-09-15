# Sales Scorecard AWS Infrastructure Scripts

This directory contains scripts to manage and protect the Sales Scorecard AWS infrastructure.

## 🛡️ Protection Mechanisms Implemented

### 1. **Resource Tagging**
- All AWS resources are tagged with `AutoDelete=false` to prevent accidental deletion
- Resources tagged with `Environment=Production`, `Project=SalesScorecard`, `Owner=Zahari`

### 2. **CloudWatch Monitoring**
- **Dashboard**: Real-time monitoring of ECS tasks, load balancer health, API requests, and response times
- **Alarms**: Automatic alerts for:
  - ECS service down (no running tasks)
  - Load balancer unhealthy targets
  - High API response times (>2 seconds)
  - High error rates (>10 5XX errors)

### 3. **SNS Notifications**
- Email alerts sent to `zahari.vasilev@instorm.bg` for all critical issues
- Real-time notifications when infrastructure problems occur

### 4. **Automated Backups**
- Infrastructure configurations backed up daily
- Easy restoration scripts included
- Health check scripts for quick diagnostics

## 📁 Scripts Overview

### `backup-infrastructure.sh`
**Purpose**: Creates complete backup of AWS infrastructure configuration
**Usage**: `./scripts/backup-infrastructure.sh`
**Output**: Creates timestamped backup directory with:
- ECS service configuration
- Task definition
- Load balancer settings
- Security groups
- VPC and subnet configurations
- Restoration script
- Health check script

### `deploy-to-aws.sh`
**Purpose**: Safe deployment of new application versions
**Usage**: `./scripts/deploy-to-aws.sh`
**Features**:
- Builds and pushes Docker image
- Updates ECS service with zero downtime
- Performs health checks
- Shows deployment status

### `quick-recovery.sh`
**Purpose**: Quick recovery when service goes down
**Usage**: `./scripts/quick-recovery.sh`
**Features**:
- Checks current service status
- Automatically restarts failed services
- Verifies API health
- Provides monitoring links

### `setup-monitoring.sh`
**Purpose**: Sets up CloudWatch monitoring and alarms
**Usage**: `./scripts/setup-monitoring.sh`
**Features**:
- Creates monitoring dashboard
- Sets up alerting rules
- Configures log retention
- Sets up SNS notifications

## 🚨 Emergency Procedures

### If the API goes down:

1. **Quick Recovery** (most common):
   ```bash
   ./scripts/quick-recovery.sh
   ```

2. **Full Infrastructure Recovery** (if service was deleted):
   ```bash
   # Find latest backup
   ls -la ./infrastructure-backups/
   
   # Restore from backup
   cd ./infrastructure-backups/[latest-backup]
   ./restore-infrastructure.sh
   ```

3. **Check Status**:
   ```bash
   # Use backup health check
   cd ./infrastructure-backups/[latest-backup]
   ./health-check.sh
   
   # Or check directly
   curl http://api.instorm.io/health
   ```

## 📊 Monitoring Dashboard

Access the CloudWatch dashboard at:
https://eu-north-1.console.aws.amazon.com/cloudwatch/home?region=eu-north-1#dashboards:name=SalesScorecard-Infrastructure

**Dashboard shows**:
- ECS task count (running vs desired)
- Load balancer target health
- API request count
- API response times

## 🔔 Alert Configuration

**Email Alerts** are sent to `zahari.vasilev@instorm.bg` for:
- ECS service has no running tasks
- Load balancer targets are unhealthy
- API response time > 2 seconds
- API error rate > 10 errors per 5 minutes

**To confirm email subscription**:
1. Check your email for AWS SNS confirmation
2. Click the confirmation link
3. You'll receive alerts for all infrastructure issues

## 🛠️ Maintenance

### Daily Tasks:
- Monitor dashboard for any issues
- Check email for any alerts

### Weekly Tasks:
- Run backup script: `./scripts/backup-infrastructure.sh`
- Review CloudWatch logs for any issues

### Monthly Tasks:
- Review and clean up old backups
- Update monitoring thresholds if needed

## 🔧 Troubleshooting

### Common Issues:

1. **"Service not found" error**:
   - Run full infrastructure restoration from backup

2. **"No tasks running" error**:
   - Use quick recovery script
   - Check ECS service logs in CloudWatch

3. **API not responding**:
   - Check load balancer target health
   - Verify security group rules
   - Check application logs

4. **Deployment failures**:
   - Check ECR repository exists
   - Verify Docker image builds successfully
   - Check AWS credentials

### Useful Commands:

```bash
# Check ECS service status
aws ecs describe-services --cluster sales-scorecard-cluster --services sales-scorecard-service

# Check load balancer health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:eu-north-1:221855463690:targetgroup/sales-scorecard-targets/08de804ec692dbf9

# View application logs
aws logs tail /ecs/sales-scorecard --follow

# Check API health
curl http://api.instorm.io/health
```

## 📞 Support

If you encounter issues:
1. Check the monitoring dashboard first
2. Review CloudWatch logs
3. Use the recovery scripts
4. Check email for any AWS alerts

The infrastructure is now protected with multiple layers of monitoring, backup, and recovery mechanisms to prevent future outages.
