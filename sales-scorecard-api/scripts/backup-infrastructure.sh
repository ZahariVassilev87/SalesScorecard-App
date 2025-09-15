#!/bin/bash

# Sales Scorecard Infrastructure Backup Script
# This script creates backups of critical AWS infrastructure configurations

set -e

BACKUP_DIR="./infrastructure-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "🔧 Creating infrastructure backup in $BACKUP_DIR"

# Backup ECS Service Configuration
echo "📦 Backing up ECS service configuration..."
aws ecs describe-services --cluster sales-scorecard-cluster --services sales-scorecard-service > "$BACKUP_DIR/ecs-service.json"

# Backup Task Definition
echo "📦 Backing up task definition..."
aws ecs describe-task-definition --task-definition sales-scorecard-task > "$BACKUP_DIR/task-definition.json"

# Backup Load Balancer Configuration
echo "📦 Backing up load balancer configuration..."
aws elbv2 describe-load-balancers --names sales-scorecard-alb > "$BACKUP_DIR/load-balancer.json"

# Backup Target Group Configuration
echo "📦 Backing up target group configuration..."
aws elbv2 describe-target-groups --names sales-scorecard-targets > "$BACKUP_DIR/target-group.json"

# Backup Security Groups
echo "📦 Backing up security group configuration..."
aws ec2 describe-security-groups --group-ids sg-023ad82910d10d4ef > "$BACKUP_DIR/security-group.json"

# Backup VPC Configuration
echo "📦 Backing up VPC configuration..."
aws ec2 describe-vpcs --vpc-ids vpc-0a31ab81dafef4473 > "$BACKUP_DIR/vpc.json"

# Backup Subnets
echo "📦 Backing up subnet configuration..."
aws ec2 describe-subnets --subnet-ids subnet-08e2e6f3d87ae2407 subnet-0cf7f08ec911e292f > "$BACKUP_DIR/subnets.json"

# Create restoration script
echo "📝 Creating restoration script..."
cat > "$BACKUP_DIR/restore-infrastructure.sh" << 'EOF'
#!/bin/bash

# Sales Scorecard Infrastructure Restoration Script
# Run this script to restore infrastructure from backup

set -e

echo "🚀 Starting infrastructure restoration..."

# Check if backup files exist
if [ ! -f "ecs-service.json" ] || [ ! -f "task-definition.json" ]; then
    echo "❌ Backup files not found. Please ensure you're in the correct backup directory."
    exit 1
fi

echo "📦 Restoring ECS task definition..."
TASK_DEF_ARN=$(aws ecs register-task-definition --cli-input-json file://task-definition.json --query 'taskDefinition.taskDefinitionArn' --output text)
echo "✅ Task definition restored: $TASK_DEF_ARN"

echo "📦 Restoring ECS service..."
aws ecs create-service --cluster sales-scorecard-cluster --service-name sales-scorecard-service --task-definition "$TASK_DEF_ARN" --desired-count 1 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[subnet-08e2e6f3d87ae2407,subnet-0cf7f08ec911e292f],securityGroups=[sg-023ad82910d10d4ef],assignPublicIp=ENABLED}" --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:eu-north-1:221855463690:targetgroup/sales-scorecard-targets/08de804ec692dbf9,containerName=sales-scorecard-api,containerPort=3000"

echo "✅ Infrastructure restoration completed!"
echo "🔍 Check service status with: aws ecs describe-services --cluster sales-scorecard-cluster --services sales-scorecard-service"
EOF

chmod +x "$BACKUP_DIR/restore-infrastructure.sh"

# Create quick health check script
cat > "$BACKUP_DIR/health-check.sh" << 'EOF'
#!/bin/bash

# Quick health check script
echo "🔍 Checking Sales Scorecard infrastructure health..."

echo "📊 ECS Service Status:"
aws ecs describe-services --cluster sales-scorecard-cluster --services sales-scorecard-service --query 'services[0].{Status:status,RunningCount:runningCount,DesiredCount:desiredCount}' --output table

echo "📊 Load Balancer Health:"
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:eu-north-1:221855463690:targetgroup/sales-scorecard-targets/08de804ec692dbf9 --query 'TargetHealthDescriptions[0].{Target:Target.Id,Health:TargetHealth.State}' --output table

echo "📊 API Health Check:"
curl -s http://api.instorm.io/health | jq '.' || echo "❌ API not responding"
EOF

chmod +x "$BACKUP_DIR/health-check.sh"

echo "✅ Infrastructure backup completed!"
echo "📁 Backup location: $BACKUP_DIR"
echo "🔧 To restore: cd $BACKUP_DIR && ./restore-infrastructure.sh"
echo "🔍 To check health: cd $BACKUP_DIR && ./health-check.sh"
