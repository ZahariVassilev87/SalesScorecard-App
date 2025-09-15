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
