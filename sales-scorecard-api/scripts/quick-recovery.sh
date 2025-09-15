#!/bin/bash

# Sales Scorecard Quick Recovery Script
# Use this script to quickly restore the service if it goes down

set -e

echo "🚨 Sales Scorecard Quick Recovery Script"
echo "========================================"

# Check current status
echo "🔍 Checking current infrastructure status..."

# Check ECS service
if aws ecs describe-services --cluster sales-scorecard-cluster --services sales-scorecard-service > /dev/null 2>&1; then
    SERVICE_STATUS=$(aws ecs describe-services --cluster sales-scorecard-cluster --services sales-scorecard-service --query 'services[0].status' --output text)
    RUNNING_COUNT=$(aws ecs describe-services --cluster sales-scorecard-cluster --services sales-scorecard-service --query 'services[0].runningCount' --output text)
    
    echo "📊 ECS Service Status: $SERVICE_STATUS"
    echo "📊 Running Tasks: $RUNNING_COUNT"
    
    if [ "$RUNNING_COUNT" -eq 0 ]; then
        echo "⚠️  No tasks running! Attempting to restart service..."
        
        # Restart the service
        aws ecs update-service --cluster sales-scorecard-cluster --service sales-scorecard-service --desired-count 1 --force-new-deployment
        
        echo "🔄 Service restart initiated. Waiting for tasks to start..."
        
        # Wait for service to stabilize
        aws ecs wait services-stable --cluster sales-scorecard-cluster --services sales-scorecard-service --cli-read-timeout 600
        
        echo "✅ Service restarted successfully!"
    else
        echo "✅ Service is running normally"
    fi
else
    echo "❌ ECS service not found! Need full infrastructure restoration."
    echo "🔧 Run: ./scripts/backup-infrastructure.sh to create backup first"
    echo "🔧 Then run: cd ./infrastructure-backups/[latest] && ./restore-infrastructure.sh"
    exit 1
fi

# Check API health
echo "🔍 Checking API health..."
sleep 10  # Give service time to start

if curl -s http://api.instorm.io/health > /dev/null; then
    echo "✅ API is responding"
    curl -s http://api.instorm.io/health | jq '.' 2>/dev/null || echo "API responded but JSON parsing failed"
else
    echo "⚠️  API not responding yet. This may take a few minutes."
    echo "🔍 Check logs with: aws logs tail /ecs/sales-scorecard --follow"
fi

echo "🎉 Recovery process completed!"
echo "🌐 API URL: http://api.instorm.io"
echo "📊 Monitor: https://eu-north-1.console.aws.amazon.com/cloudwatch/home?region=eu-north-1#dashboards:name=SalesScorecard-Infrastructure"
